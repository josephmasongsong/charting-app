import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, users, sites, referrals } from '@/db';
import { eq, ilike, or, count, desc, asc, sql, and } from 'drizzle-orm';
import { ActivityFeedService } from '@/lib/services/activity-feed.service';
import { createReferralSchema } from '@/lib/validations/referrals';

/**
 * One route serves both the worker and the admin table: rows are scoped by
 * role rather than duplicated into a parallel /api/admin/referrals file, which
 * is how every older entity ended up with two near-identical handlers.
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'referralDate';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const siteId = searchParams.get('siteId');
    const channel = searchParams.get('channel');
    const referredTo = searchParams.get('referredTo');
    const offset = (page - 1) * limit;

    const conditions = [];

    if (siteId) {
      conditions.push(eq(referrals.siteId, siteId));
    }

    if (channel) {
      conditions.push(eq(referrals.channel, channel));
    }

    if (referredTo) {
      conditions.push(eq(referrals.referredTo, referredTo));
    }

    // Non-admin users can only see their own referrals
    if (currentUser.role !== 'admin') {
      conditions.push(eq(referrals.userId, currentUser.id));
    }

    // There is no free text on a referral, so search covers the site and the
    // worker who logged it.
    if (search) {
      conditions.push(
        or(
          ilike(sites.name, `%${search}%`),
          ilike(
            sql`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
            `%${search}%`
          )
        )
      );
    }

    const whereCondition =
      conditions.length > 0 ? and(...conditions) : undefined;

    const countQuery = db
      .select({ count: count() })
      .from(referrals)
      .leftJoin(users, eq(referrals.userId, users.id))
      .leftJoin(sites, eq(referrals.siteId, sites.id));

    const countResult = whereCondition
      ? await countQuery.where(whereCondition)
      : await countQuery;

    const totalCount = countResult[0]?.count || 0;

    let sortColumn;
    switch (sortBy) {
      case 'referralDate':
        sortColumn = referrals.referralDate;
        break;
      case 'channel':
        sortColumn = referrals.channel;
        break;
      case 'referredTo':
        sortColumn = referrals.referredTo;
        break;
      case 'siteName':
        sortColumn = sites.name;
        break;
      case 'userName':
        sortColumn = sql`CONCAT(${users.firstName}, ' ', ${users.lastName})`;
        break;
      case 'createdAt':
        sortColumn = referrals.createdAt;
        break;
      default:
        sortColumn = referrals.referralDate;
    }

    const sortFunction = sortOrder === 'asc' ? asc : desc;

    const referralsQuery = db
      .select({
        id: referrals.id,
        siteId: referrals.siteId,
        siteName: sites.name,
        userId: referrals.userId,
        userName:
          sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`.as(
            'userName'
          ),
        referralDate: referrals.referralDate,
        channel: referrals.channel,
        referredTo: referrals.referredTo,
        createdAt: referrals.createdAt,
        updatedAt: referrals.updatedAt,
      })
      .from(referrals)
      .leftJoin(users, eq(referrals.userId, users.id))
      .leftJoin(sites, eq(referrals.siteId, sites.id))
      .limit(limit)
      .offset(offset)
      .orderBy(sortFunction(sortColumn));

    const allReferrals = whereCondition
      ? await referralsQuery.where(whereCondition)
      : await referralsQuery;

    // Stat tiles count what this user is allowed to see, so a worker's tiles
    // agree with their own rows instead of showing the whole programme.
    const statScope =
      currentUser.role !== 'admin'
        ? eq(referrals.userId, currentUser.id)
        : undefined;

    const statsQuery = db
      .select({
        totalReferrals: count(),
        inPerson: sql<number>`count(*) filter (where ${referrals.channel} = 'in_person')`,
        phoneCall: sql<number>`count(*) filter (where ${referrals.channel} = 'phone_call')`,
        email: sql<number>`count(*) filter (where ${referrals.channel} = 'email')`,
      })
      .from(referrals);

    const [referralStats] = statScope
      ? await statsQuery.where(statScope)
      : await statsQuery;

    return NextResponse.json({
      referrals: allReferrals,
      stats: {
        totalReferrals: Number(referralStats?.totalReferrals || 0),
        inPerson: Number(referralStats?.inPerson || 0),
        phoneCall: Number(referralStats?.phoneCall || 0),
        email: Number(referralStats?.email || 0),
      },
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Referrals fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch referrals' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const validation = createReferralSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    const [site] = await db
      .select()
      .from(sites)
      .where(eq(sites.id, data.siteId))
      .limit(1);

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 400 });
    }

    const [newReferral] = await db
      .insert(referrals)
      .values({
        siteId: data.siteId,
        userId: currentUser.id,
        referralDate: data.referralDate,
        channel: data.channel,
        referredTo: data.referredTo,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    await ActivityFeedService.logReferral(currentUser.id, newReferral.id, {
      siteName: site.name,
      channel: data.channel,
      referredTo: data.referredTo,
      referralDate: data.referralDate,
    });

    return NextResponse.json({
      success: true,
      message: 'Referral logged successfully',
      referral: newReferral,
    });
  } catch (error) {
    console.error('Referral creation error:', error);
    return NextResponse.json(
      { error: 'Failed to log referral' },
      { status: 500 }
    );
  }
}
