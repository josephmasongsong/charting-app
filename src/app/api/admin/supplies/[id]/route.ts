// app/api/admin/supplies/[id]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, supplies, users, siteSupplies, sites } from '@/db';
import { eq, and } from 'drizzle-orm';
import { ActivityFeedService } from '@/lib/services/activity-feed.service';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;

    const [supply] = await db
      .select()
      .from(supplies)
      .where(eq(supplies.id, id))
      .limit(1);

    if (!supply) {
      return NextResponse.json({ error: 'Supply not found' }, { status: 404 });
    }

    return NextResponse.json({ supply });
  } catch (error) {
    console.error('Supply fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch supply' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const { name, costPerUnit, quantity, siteId, siteQuantity } =
      await req.json();

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Validate name length
    if (name.trim().length > 255) {
      return NextResponse.json(
        { error: 'Name must be 255 characters or less' },
        { status: 400 }
      );
    }

    // Validate cost per unit
    if (
      costPerUnit !== undefined &&
      (isNaN(parseFloat(costPerUnit)) || parseFloat(costPerUnit) < 0)
    ) {
      return NextResponse.json(
        { error: 'Cost per unit must be a valid non-negative number' },
        { status: 400 }
      );
    }

    // Validate quantity
    const totalQuantity =
      quantity !== undefined ? parseInt(quantity) : undefined;
    if (
      quantity !== undefined &&
      (totalQuantity === undefined || !Number.isInteger(totalQuantity) || totalQuantity < 0)
    ) {
      return NextResponse.json(
        { error: 'Quantity must be a valid non-negative integer' },
        { status: 400 }
      );
    }

    // Validate site quantity if provided
    const assignedQuantity = siteQuantity ? parseInt(siteQuantity) : undefined;
    if (
      siteQuantity !== undefined &&
      (assignedQuantity === undefined || !Number.isInteger(assignedQuantity) || assignedQuantity < 0)
    ) {
      return NextResponse.json(
        { error: 'Site quantity must be a valid non-negative integer' },
        { status: 400 }
      );
    }

    // Check if supply exists
    const [existingSupply] = await db
      .select()
      .from(supplies)
      .where(eq(supplies.id, id))
      .limit(1);

    if (!existingSupply) {
      return NextResponse.json({ error: 'Supply not found' }, { status: 404 });
    }

    // Check if another supply with this name already exists
    const [duplicateSupply] = await db
      .select()
      .from(supplies)
      .where(eq(supplies.name, name.trim()))
      .limit(1);

    if (duplicateSupply && duplicateSupply.id !== id) {
      return NextResponse.json(
        { error: 'A supply with this name already exists' },
        { status: 400 }
      );
    }

    // Track changes for activity log
    const changes: any = {};
    if (name.trim() !== existingSupply.name) {
      changes.name = { old: existingSupply.name, new: name.trim() };
    }
    if (
      costPerUnit &&
      parseFloat(costPerUnit).toFixed(2) !== existingSupply.costPerUnit
    ) {
      changes.costPerUnit = {
        old: existingSupply.costPerUnit,
        new: parseFloat(costPerUnit).toFixed(2),
      };
    }

    // Update supply and handle site assignment in a transaction
    const result = await db.transaction(async tx => {
      // Update supply
      const [updatedSupply] = await tx
        .update(supplies)
        .set({
          name: name.trim(),
          costPerUnit: costPerUnit
            ? parseFloat(costPerUnit).toFixed(2)
            : existingSupply.costPerUnit,
          quantity:
            totalQuantity !== undefined
              ? totalQuantity
              : existingSupply.quantity,
          updatedAt: new Date(),
        })
        .where(eq(supplies.id, id))
        .returning();

      // Handle site assignment if provided
      if (siteId && assignedQuantity !== undefined) {
        // Check if site supply assignment already exists
        const [existingSiteSupply] = await tx
          .select()
          .from(siteSupplies)
          .where(
            and(
              eq(siteSupplies.supplyId, id),
              eq(siteSupplies.siteId, siteId)
            )
          )
          .limit(1);

        if (existingSiteSupply) {
          // Update existing assignment
          await tx
            .update(siteSupplies)
            .set({
              quantity: assignedQuantity,
              updatedAt: new Date(),
            })
            .where(eq(siteSupplies.id, existingSiteSupply.id));
        } else {
          // Create new assignment
          await tx.insert(siteSupplies).values({
            siteId: siteId,
            supplyId: id,
            quantity: assignedQuantity,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }

      return updatedSupply;
    });

    // Log update if there are changes
    if (Object.keys(changes).length > 0) {
      await ActivityFeedService.logSupplyUpdated(currentUser.id, id, changes);
    }

    return NextResponse.json({
      success: true,
      message: 'Supply updated successfully',
      supply: result,
    });
  } catch (error) {
    console.error('Supply update error:', error);
    return NextResponse.json(
      { error: 'Failed to update supply' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;

    // Check if supply exists
    const [existingSupply] = await db
      .select()
      .from(supplies)
      .where(eq(supplies.id, id))
      .limit(1);

    if (!existingSupply) {
      return NextResponse.json({ error: 'Supply not found' }, { status: 404 });
    }

    // Delete supply and related site supplies in a transaction
    await db.transaction(async tx => {
      // Delete all site supply assignments first
      await tx.delete(siteSupplies).where(eq(siteSupplies.supplyId, id));

      // Delete the supply
      await tx.delete(supplies).where(eq(supplies.id, id));
    });

    // Log deletion
    await ActivityFeedService.logSupplyDeleted(
      currentUser.id,
      id,
      existingSupply.name
    );

    return NextResponse.json({
      success: true,
      message: 'Supply deleted successfully',
    });
  } catch (error) {
    console.error('Supply deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete supply' },
      { status: 500 }
    );
  }
}
