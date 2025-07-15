// app/api/admin/sites/[id]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, users, sites, communityPartners } from '@/db';
import { eq, sql } from 'drizzle-orm';
import { updateSiteSchema } from '@/lib/validations/sites';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id } = params;

    const [site] = await db
      .select({
        id: sites.id,
        name: sites.name,
        latitude: sites.latitude,
        longitude: sites.longitude,
        address: sites.address,
        numberOfTenants: sites.numberOfTenants,
        hasCommunityRoom: sites.hasCommunityRoom,
        hasCommunityPartner: sites.hasCommunityPartner,
        communityPartnerId: sites.communityPartnerId,
        communityPartnerName: communityPartners.name,
        isSingleSeniorOnly: sites.isSingleSeniorOnly,
        userId: sites.userId,
        userName:
          sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`.as(
            'userName'
          ),
        createdAt: sites.createdAt,
        updatedAt: sites.updatedAt,
      })
      .from(sites)
      .leftJoin(users, eq(sites.userId, users.id))
      .leftJoin(
        communityPartners,
        eq(sites.communityPartnerId, communityPartners.id)
      )
      .where(eq(sites.id, id))
      .limit(1);

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    return NextResponse.json({ site });
  } catch (error) {
    console.error('Site fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch site' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await req.json();

    // Validate with Zod
    const validation = updateSiteSchema.safeParse(body);

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

    // Check if site exists
    const [existingSite] = await db
      .select()
      .from(sites)
      .where(eq(sites.id, id))
      .limit(1);

    if (!existingSite) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    // Check if user exists
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, data.userId))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: 'Selected user does not exist' },
        { status: 400 }
      );
    }

    // Check community partner if specified
    if (data.hasCommunityPartner && data.communityPartnerId) {
      const [communityPartner] = await db
        .select()
        .from(communityPartners)
        .where(eq(communityPartners.id, data.communityPartnerId))
        .limit(1);

      if (!communityPartner) {
        return NextResponse.json(
          { error: 'Selected community partner does not exist' },
          { status: 400 }
        );
      }
    }

    // Check if another site with this name already exists
    const [duplicateSite] = await db
      .select()
      .from(sites)
      .where(eq(sites.name, data.name))
      .limit(1);

    if (duplicateSite && duplicateSite.id !== id) {
      return NextResponse.json(
        { error: 'A site with this name already exists' },
        { status: 400 }
      );
    }

    // Update site
    const [updatedSite] = await db
      .update(sites)
      .set({
        name: data.name,
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address,
        numberOfTenants: Number(data.numberOfTenants),
        hasCommunityRoom: data.hasCommunityRoom,
        hasCommunityPartner: data.hasCommunityPartner,
        communityPartnerId: data.hasCommunityPartner
          ? data.communityPartnerId
          : null,
        isSingleSeniorOnly: data.isSingleSeniorOnly,
        userId: data.userId,
        updatedAt: new Date(),
      })
      .where(eq(sites.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Site updated successfully',
      site: updatedSite,
    });
  } catch (error) {
    console.error('Site update error:', error);
    return NextResponse.json(
      { error: 'Failed to update site' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id } = params;

    // Check if site exists
    const [existingSite] = await db
      .select()
      .from(sites)
      .where(eq(sites.id, id))
      .limit(1);

    if (!existingSite) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    // Delete site
    await db.delete(sites).where(eq(sites.id, id));

    return NextResponse.json({
      success: true,
      message: 'Site deleted successfully',
    });
  } catch (error) {
    console.error('Site deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete site' },
      { status: 500 }
    );
  }
}
