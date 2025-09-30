// app/api/admin/sites/[id]/route.ts
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
import { eq, sql, and } from 'drizzle-orm';
import { updateSiteSchema } from '@/lib/validations/sites';
import { ActivityFeedService } from '@/lib/services/activity-feed.service';

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

    // Get site details
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

    // Get site supplies
    const siteSuppliesData = await db
      .select({
        id: siteSupplies.id,
        supplyId: siteSupplies.supplyId,
        supplyName: supplies.name,
        quantity: siteSupplies.quantity,
        costPerUnit: supplies.costPerUnit,
        totalValue: sql<number>`${siteSupplies.quantity} * ${supplies.costPerUnit}`,
        lastUpdated: siteSupplies.updatedAt,
      })
      .from(siteSupplies)
      .innerJoin(supplies, eq(siteSupplies.supplyId, supplies.id))
      .where(eq(siteSupplies.siteId, id))
      .orderBy(supplies.name);

    return NextResponse.json({
      site,
      siteSupplies: siteSuppliesData,
    });
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
    const { newSupplies, existingSupplies, removedSupplies, ...siteData } =
      body;

    // Validate with Zod
    const validation = updateSiteSchema.safeParse(siteData);

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

    // ===== NEW: Prepare data for activity logging BEFORE making changes =====
    let removedSupplyDetails = [];
    if (
      removedSupplies &&
      Array.isArray(removedSupplies) &&
      removedSupplies.length > 0
    ) {
      // Get supply details before deletion
      for (const siteSupplyId of removedSupplies) {
        const [supplyInfo] = await db
          .select({
            name: supplies.name,
            quantity: siteSupplies.quantity,
            costPerUnit: supplies.costPerUnit,
          })
          .from(siteSupplies)
          .innerJoin(supplies, eq(siteSupplies.supplyId, supplies.id))
          .where(eq(siteSupplies.id, siteSupplyId))
          .limit(1);

        if (supplyInfo) {
          removedSupplyDetails.push(supplyInfo);
        }
      }
    }

    let existingSupplyUpdates = [];
    if (
      existingSupplies &&
      Array.isArray(existingSupplies) &&
      existingSupplies.length > 0
    ) {
      // Get current quantities before updates
      for (const supplyUpdate of existingSupplies) {
        const [supplyInfo] = await db
          .select({
            supplyName: supplies.name,
            costPerUnit: supplies.costPerUnit,
            oldQuantity: siteSupplies.quantity,
          })
          .from(siteSupplies)
          .innerJoin(supplies, eq(siteSupplies.supplyId, supplies.id))
          .where(eq(siteSupplies.id, supplyUpdate.siteSupplyId))
          .limit(1);

        if (supplyInfo && supplyInfo.oldQuantity !== supplyUpdate.quantity) {
          existingSupplyUpdates.push({
            ...supplyInfo,
            newQuantity: supplyUpdate.quantity,
          });
        }
      }
    }

    // Validate new supplies if provided
    if (newSupplies && Array.isArray(newSupplies)) {
      for (const supplyInput of newSupplies) {
        if (!supplyInput.supplyId || supplyInput.quantity <= 0) {
          return NextResponse.json(
            {
              error:
                'All new supplies must have a valid supply ID and positive quantity',
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

        // Check if supply is already at this site
        const [existingSupplyAtSite] = await db
          .select()
          .from(siteSupplies)
          .where(
            and(
              eq(siteSupplies.siteId, id),
              eq(siteSupplies.supplyId, supplyInput.supplyId)
            )
          )
          .limit(1);

        if (existingSupplyAtSite) {
          return NextResponse.json(
            {
              error: `Supply "${supply?.name}" is already at this site. Use the inventory management interface to adjust quantities.`,
            },
            { status: 400 }
          );
        }
      }
    }

    // Validate existing supplies updates if provided
    if (existingSupplies && Array.isArray(existingSupplies)) {
      for (const supplyUpdate of existingSupplies) {
        if (!supplyUpdate.siteSupplyId || supplyUpdate.quantity <= 0) {
          return NextResponse.json(
            {
              error:
                'All existing supply updates must have a valid site supply ID and positive quantity',
            },
            { status: 400 }
          );
        }

        // Check if site supply exists
        const [siteSupply] = await db
          .select()
          .from(siteSupplies)
          .where(eq(siteSupplies.id, supplyUpdate.siteSupplyId))
          .limit(1);

        if (!siteSupply) {
          return NextResponse.json(
            {
              error: `Site supply with ID ${supplyUpdate.siteSupplyId} does not exist`,
            },
            { status: 400 }
          );
        }
      }
    }

    // Validate removed supplies if provided
    if (removedSupplies && Array.isArray(removedSupplies)) {
      for (const siteSupplyId of removedSupplies) {
        const [siteSupply] = await db
          .select()
          .from(siteSupplies)
          .where(eq(siteSupplies.id, siteSupplyId))
          .limit(1);

        if (!siteSupply) {
          return NextResponse.json(
            { error: `Site supply with ID ${siteSupplyId} does not exist` },
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

    // Track changes for activity log
    const changes: any = {};
    if (data.name !== existingSite.name) {
      changes.name = { old: existingSite.name, new: data.name };
    }
    if (data.address !== existingSite.address) {
      changes.address = { old: existingSite.address, new: data.address };
    }
    if (Number(data.numberOfTenants) !== existingSite.numberOfTenants) {
      changes.numberOfTenants = {
        old: existingSite.numberOfTenants,
        new: Number(data.numberOfTenants),
      };
    }
    if (data.hasCommunityRoom !== existingSite.hasCommunityRoom) {
      changes.hasCommunityRoom = {
        old: existingSite.hasCommunityRoom,
        new: data.hasCommunityRoom,
      };
    }

    // Check community partner changes
    if (data.communityPartnerId !== existingSite.communityPartnerId) {
      let oldPartnerName = null;
      let newPartnerName = null;

      if (existingSite.communityPartnerId) {
        const [oldPartner] = await db
          .select()
          .from(communityPartners)
          .where(eq(communityPartners.id, existingSite.communityPartnerId))
          .limit(1);
        oldPartnerName = oldPartner?.name || null;
      }

      if (data.communityPartnerId) {
        const [newPartner] = await db
          .select()
          .from(communityPartners)
          .where(eq(communityPartners.id, data.communityPartnerId))
          .limit(1);
        newPartnerName = newPartner?.name || null;
      }

      changes.communityPartnerName = {
        old: oldPartnerName,
        new: newPartnerName,
      };
    }

    // Use transaction to update site and manage supplies
    const result = await db.transaction(async tx => {
      // Update site
      const [updatedSite] = await tx
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

      // Handle supply operations

      // 1. Remove supplies first
      if (
        removedSupplies &&
        Array.isArray(removedSupplies) &&
        removedSupplies.length > 0
      ) {
        for (const siteSupplyId of removedSupplies) {
          // Get the supply details before deletion to adjust main inventory
          const [siteSupply] = await tx
            .select({
              supplyId: siteSupplies.supplyId,
              quantity: siteSupplies.quantity,
            })
            .from(siteSupplies)
            .where(eq(siteSupplies.id, siteSupplyId));

          if (siteSupply) {
            // Decrease main supply quantity
            await tx
              .update(supplies)
              .set({
                quantity: sql`${supplies.quantity} - ${siteSupply.quantity}`,
                updatedAt: new Date(),
              })
              .where(eq(supplies.id, siteSupply.supplyId));

            // Remove from site
            await tx
              .delete(siteSupplies)
              .where(eq(siteSupplies.id, siteSupplyId));
          }
        }
      }

      // 2. Update existing supplies
      if (
        existingSupplies &&
        Array.isArray(existingSupplies) &&
        existingSupplies.length > 0
      ) {
        for (const supplyUpdate of existingSupplies) {
          // Get current quantity to calculate difference
          const [currentSiteSupply] = await tx
            .select({
              supplyId: siteSupplies.supplyId,
              currentQuantity: siteSupplies.quantity,
            })
            .from(siteSupplies)
            .where(eq(siteSupplies.id, supplyUpdate.siteSupplyId));

          if (currentSiteSupply) {
            const quantityDifference =
              supplyUpdate.quantity - currentSiteSupply.currentQuantity;

            // Update site supply quantity
            await tx
              .update(siteSupplies)
              .set({
                quantity: supplyUpdate.quantity,
                updatedAt: new Date(),
              })
              .where(eq(siteSupplies.id, supplyUpdate.siteSupplyId));

            // Adjust main supply quantity
            if (quantityDifference !== 0) {
              await tx
                .update(supplies)
                .set({
                  quantity: sql`${supplies.quantity} + ${quantityDifference}`,
                  updatedAt: new Date(),
                })
                .where(eq(supplies.id, currentSiteSupply.supplyId));
            }
          }
        }
      }

      // 3. Add new supplies
      if (newSupplies && Array.isArray(newSupplies) && newSupplies.length > 0) {
        for (const supplyInput of newSupplies) {
          // Add to site inventory
          await tx.insert(siteSupplies).values({
            siteId: id,
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

      return updatedSite;
    });

    // ===== NEW: Activity Logging After Successful Transaction =====

    // 1. Log removed supplies
    if (removedSupplyDetails.length > 0) {
      await ActivityFeedService.logSuppliesRemovedFromSite(currentUser.id, id, {
        siteName: data.name,
        supplies: removedSupplyDetails,
      });
    }

    // 2. Log supply quantity updates
    for (const updateInfo of existingSupplyUpdates) {
      await ActivityFeedService.logSiteSupplyUpdated(currentUser.id, id, {
        siteName: data.name,
        supplyName: updateInfo.supplyName,
        oldQuantity: updateInfo.oldQuantity,
        newQuantity: updateInfo.newQuantity,
        costPerUnit: updateInfo.costPerUnit,
      });
    }

    // 3. Log new supplies added
    if (newSupplies && Array.isArray(newSupplies) && newSupplies.length > 0) {
      const newSuppliesForLogging = [];
      for (const supplyInput of newSupplies) {
        const [supply] = await db
          .select({ name: supplies.name, costPerUnit: supplies.costPerUnit })
          .from(supplies)
          .where(eq(supplies.id, supplyInput.supplyId))
          .limit(1);

        if (supply) {
          newSuppliesForLogging.push({
            name: supply.name,
            quantity: supplyInput.quantity,
            costPerUnit: supply.costPerUnit,
          });
        }
      }

      if (newSuppliesForLogging.length > 0) {
        await ActivityFeedService.logSuppliesAddedToSite(currentUser.id, id, {
          siteName: data.name,
          supplies: newSuppliesForLogging,
        });
      }
    }

    // Log site updates
    if (Object.keys(changes).length > 0) {
      await ActivityFeedService.logSiteUpdated(currentUser.id, id, changes);
    }

    return NextResponse.json({
      success: true,
      message: 'Site updated successfully',
      site: result,
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

    // ===== NEW: Get supplies data before deletion for activity logging =====
    const siteSuppliesForLogging = await db
      .select({
        name: supplies.name,
        quantity: siteSupplies.quantity,
        costPerUnit: supplies.costPerUnit,
      })
      .from(siteSupplies)
      .innerJoin(supplies, eq(siteSupplies.supplyId, supplies.id))
      .where(eq(siteSupplies.siteId, id));

    // Use transaction to handle deletion and supply adjustments
    await db.transaction(async tx => {
      // Get all site supplies before deletion
      const siteSuppliesData = await tx
        .select({
          supplyId: siteSupplies.supplyId,
          quantity: siteSupplies.quantity,
        })
        .from(siteSupplies)
        .where(eq(siteSupplies.siteId, id));

      // Return supplies to main inventory
      for (const siteSupply of siteSuppliesData) {
        await tx
          .update(supplies)
          .set({
            quantity: sql`${supplies.quantity} - ${siteSupply.quantity}`,
            updatedAt: new Date(),
          })
          .where(eq(supplies.id, siteSupply.supplyId));
      }

      // Delete site supplies first (due to foreign key)
      await tx.delete(siteSupplies).where(eq(siteSupplies.siteId, id));

      // Delete site
      await tx.delete(sites).where(eq(sites.id, id));
    });

    // Log site deletion
    await ActivityFeedService.logSiteDeleted(
      currentUser.id,
      id,
      existingSite.name
    );

    // ===== NEW: Log supplies removed when site is deleted =====
    if (siteSuppliesForLogging.length > 0) {
      await ActivityFeedService.logSuppliesRemovedFromSite(currentUser.id, id, {
        siteName: existingSite.name,
        supplies: siteSuppliesForLogging,
      });
    }

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
