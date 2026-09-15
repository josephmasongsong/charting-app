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
import { alias } from 'drizzle-orm/pg-core';
import { PPH_JOB_TITLE, TEW_JOB_TITLE } from '@/lib/job-titles';

// Two assignments join the same table, so each needs its own alias.
const tew = alias(users, 'tew');
const pph = alias(users, 'pph');
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
            sql`CONCAT(${tew.firstName}, ' ', ${tew.lastName})`,
            `%${search}%`
          ),
          ilike(
            sql`CONCAT(${pph.firstName}, ' ', ${pph.lastName})`,
            `%${search}%`
          ),
          ilike(communityPartners.name, `%${search}%`)
        )
      : undefined;

    // Get total count for pagination with joins
    const countQuery = db
      .select({ count: count() })
      .from(sites)
      .leftJoin(tew, eq(sites.tewId, tew.id))
      .leftJoin(pph, eq(sites.pphId, pph.id))
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
        sortColumn = sql`CONCAT(${tew.firstName}, ' ', ${tew.lastName})`;
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
        region: sites.region,
        tewId: sites.tewId,
        tewName: sql<string>`CONCAT(${tew.firstName}, ' ', ${tew.lastName})`.as(
          'tewName'
        ),
        pphId: sites.pphId,
        pphName: sql<
          string | null
        >`CONCAT(${pph.firstName}, ' ', ${pph.lastName})`.as('pphName'),
        createdAt: sites.createdAt,
        updatedAt: sites.updatedAt,
      })
      .from(sites)
      .leftJoin(tew, eq(sites.tewId, tew.id))
      .leftJoin(pph, eq(sites.pphId, pph.id))
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

    // Unfiltered stat aggregates — distinct from the search-filtered
    // pagination.total; all four source columns live on sites.
    const [statsRow] = await db
      .select({
        totalSites: count(),
        totalTenants: sql<number>`coalesce(sum(${sites.numberOfTenants}), 0)`,
        withCommunityRoom: sql<number>`count(*) filter (where ${sites.hasCommunityRoom})`,
        seniorOnly: sql<number>`count(*) filter (where ${sites.isSingleSeniorOnly})`,
      })
      .from(sites);

    return NextResponse.json({
      sites: allSites,
      stats: {
        totalSites: Number(statsRow?.totalSites || 0),
        totalTenants: Number(statsRow?.totalTenants || 0),
        withCommunityRoom: Number(statsRow?.withCommunityRoom || 0),
        seniorOnly: Number(statsRow?.seniorOnly || 0),
      },
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

    // Both assignments must exist AND hold the matching job title — the
    // filtered dropdowns are a convenience, this is the actual guarantee.
    const [tewUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, data.tewId))
      .limit(1);

    if (!tewUser) {
      return NextResponse.json(
        { error: 'Selected Tenant Engagement Worker does not exist' },
        { status: 400 }
      );
    }
    if (tewUser.jobTitle !== TEW_JOB_TITLE) {
      return NextResponse.json(
        { error: `${tewUser.firstName} ${tewUser.lastName} is not a Tenant Engagement Worker` },
        { status: 400 }
      );
    }

    if (data.pphId) {
      const [pphUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, data.pphId))
        .limit(1);

      if (!pphUser) {
        return NextResponse.json(
          { error: 'Selected PPH programmer does not exist' },
          { status: 400 }
        );
      }
      if (pphUser.jobTitle !== PPH_JOB_TITLE) {
        return NextResponse.json(
          { error: `${pphUser.firstName} ${pphUser.lastName} is not a People Plants & Homes programmer` },
          { status: 400 }
        );
      }
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
          region: data.region,
          tewId: data.tewId,
          pphId: data.pphId || null,
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
