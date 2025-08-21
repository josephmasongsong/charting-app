import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, supplies, users } from '@/db';
import { eq } from 'drizzle-orm';

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
    const { name, costPerUnit, quantity } = await req.json();

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
    if (
      quantity !== undefined &&
      (!Number.isInteger(parseInt(quantity)) || parseInt(quantity) < 0)
    ) {
      return NextResponse.json(
        { error: 'Quantity must be a valid non-negative integer' },
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

    // Update supply
    const [updatedSupply] = await db
      .update(supplies)
      .set({
        name: name.trim(),
        costPerUnit: costPerUnit
          ? parseFloat(costPerUnit).toFixed(2)
          : existingSupply.costPerUnit,
        quantity:
          quantity !== undefined ? parseInt(quantity) : existingSupply.quantity,
        updatedAt: new Date(),
      })
      .where(eq(supplies.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Supply updated successfully',
      supply: updatedSupply,
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

    // Check if supply exists
    const [existingSupply] = await db
      .select()
      .from(supplies)
      .where(eq(supplies.id, id))
      .limit(1);

    if (!existingSupply) {
      return NextResponse.json({ error: 'Supply not found' }, { status: 404 });
    }

    // TODO: Check if supply is being used in site_supplies or event_supply_distributions
    // You might want to prevent deletion if the supply is in use

    // Delete supply
    await db.delete(supplies).where(eq(supplies.id, id));

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
