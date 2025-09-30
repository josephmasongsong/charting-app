// app/api/admin/sites/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  db,
  users,
  sites,
  communityPartners,
  supplies,
  siteSupplies,
} from '@/db';
import { eq, ilike, or, count, desc, asc, sql, and } from 'drizzle-orm';
import { createSiteSchema } from '@/lib/validations/sites';
import { ActivityFeedService } from '@/lib/services/activity-feed.service';

export async function GET(req: Request) {
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

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const offset = (page - 1) * limit;

    // Build where condition based on search
    const searchCondition = search
      ? or(
          ilike(sites.name, `%${search}%`),
          ilike(sites.address, `%${search}%`),
          ilike(
            sql`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
            `%${search}%`
          ),
          ilike(communityPartners.name, `%${search}%`)
        )
      : undefined;

    // Get total count for pagination with joins
    const countQuery = db
      .select({ count: count() })
      .from(sites)
      .leftJoin(users, eq(sites.userId, users.id))
      .leftJoin(
        communityPartners,
        eq(sites.communityPartnerId, communityPartners.id)
      );

    const countResult = searchCondition
      ? await countQuery.where(searchCondition)
      : await countQuery;

    const totalCount = countResult[0]?.count || 0;

    // Determine sort column and order
    let sortColumn;
    switch (sortBy) {
      case 'name':
        sortColumn = sites.name;
        break;
      case 'address':
        sortColumn = sites.address;
        break;
      case 'numberOfTenants':
        sortColumn = sites.numberOfTenants;
        break;
      case 'userName':
        sortColumn = sql`CONCAT(${users.firstName}, ' ', ${users.lastName})`;
        break;
      case 'createdAt':
        sortColumn = sites.createdAt;
        break;
      case 'updatedAt':
        sortColumn = sites.updatedAt;
        break;
      default:
        sortColumn = sites.createdAt;
    }

    const sortFunction = sortOrder === 'asc' ? asc : desc;

    // Get paginated results with related data
    let sitesQuery = db
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
      .limit(limit)
      .offset(offset)
      .orderBy(sortFunction(sortColumn));

    // Apply search condition if it exists
    const allSites = searchCondition
      ? await sitesQuery.where(searchCondition)
      : await sitesQuery;

    return NextResponse.json({
      sites: allSites,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Sites fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sites' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
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

    const body = await req.json();
    const { supplies: siteSuppliesInput, ...siteData } = body;

    // Validate with Zod
    const validation = createSiteSchema.safeParse(siteData);

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

    // Validate supplies if provided
    if (siteSuppliesInput && Array.isArray(siteSuppliesInput)) {
      for (const supplyInput of siteSuppliesInput) {
        if (!supplyInput.supplyId || supplyInput.quantity <= 0) {
          return NextResponse.json(
            {
              error:
                'All supplies must have a valid supply ID and positive quantity',
            },
            { status: 400 }
          );
        }

        // Check if supply exists
        const [supply] = await db
          .select()
          .from(supplies)
          .where(eq(supplies.id, supplyInput.supplyId))
          .limit(1);

        if (!supply) {
          return NextResponse.json(
            { error: `Supply with ID ${supplyInput.supplyId} does not exist` },
            { status: 400 }
          );
        }
      }
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

    // Check if site with this name already exists
    const [existingSite] = await db
      .select()
      .from(sites)
      .where(eq(sites.name, data.name))
      .limit(1);

    if (existingSite) {
      return NextResponse.json(
        { error: 'A site with this name already exists' },
        { status: 400 }
      );
    }

    // Use transaction to create site and manage supplies
    const result = await db.transaction(async tx => {
      // Create site
      const [newSite] = await tx
        .insert(sites)
        .values({
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
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      // Handle supply additions if provided
      if (
        siteSuppliesInput &&
        Array.isArray(siteSuppliesInput) &&
        siteSuppliesInput.length > 0
      ) {
        for (const supplyInput of siteSuppliesInput) {
          // Add to site inventory
          await tx.insert(siteSupplies).values({
            siteId: newSite.id,
            supplyId: supplyInput.supplyId,
            quantity: supplyInput.quantity,
          });

          // Update main supply quantity
          await tx
            .update(supplies)
            .set({
              quantity: sql`${supplies.quantity} + ${supplyInput.quantity}`,
              updatedAt: new Date(),
            })
            .where(eq(supplies.id, supplyInput.supplyId));
        }
      }

      return newSite;
    });

    // Log the site creation activity
    await ActivityFeedService.logSiteCreated(currentUser.id, result.id, {
      name: data.name,
      tenantCount: Number(data.numberOfTenants),
    });

    // ===== NEW: Log supplies added to site =====
    if (
      siteSuppliesInput &&
      Array.isArray(siteSuppliesInput) &&
      siteSuppliesInput.length > 0
    ) {
      // Get supply details for activity logging
      const suppliesForLogging = [];
      for (const supplyInput of siteSuppliesInput) {
        const [supply] = await db
          .select({ name: supplies.name, costPerUnit: supplies.costPerUnit })
          .from(supplies)
          .where(eq(supplies.id, supplyInput.supplyId))
          .limit(1);

        if (supply) {
          suppliesForLogging.push({
            name: supply.name,
            quantity: supplyInput.quantity,
            costPerUnit: supply.costPerUnit,
          });
        }
      }

      // Log supplies added to site
      if (suppliesForLogging.length > 0) {
        await ActivityFeedService.logSuppliesAddedToSite(
          currentUser.id,
          result.id,
          {
            siteName: data.name,
            supplies: suppliesForLogging,
          }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Site created successfully',
      site: result,
    });
  } catch (error) {
    console.error('Site creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create site' },
      { status: 500 }
    );
  }
}
