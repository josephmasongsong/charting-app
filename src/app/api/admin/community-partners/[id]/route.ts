// app/api/admin/community-partners/[id]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, communityPartners, users } from '@/db';
import { eq } from 'drizzle-orm';
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

    const [partner] = await db
      .select()
      .from(communityPartners)
      .where(eq(communityPartners.id, id))
      .limit(1);

    if (!partner) {
      return NextResponse.json(
        { error: 'Community partner not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ communityPartner: partner });
  } catch (error) {
    console.error('Community partner fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch community partner' },
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
    const { name } = await req.json();

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

    // Check if community partner exists
    const [existingPartner] = await db
      .select()
      .from(communityPartners)
      .where(eq(communityPartners.id, id))
      .limit(1);

    if (!existingPartner) {
      return NextResponse.json(
        { error: 'Community partner not found' },
        { status: 404 }
      );
    }

    // Check if another partner with this name already exists
    const [duplicatePartner] = await db
      .select()
      .from(communityPartners)
      .where(eq(communityPartners.name, name.trim()))
      .limit(1);

    if (duplicatePartner && duplicatePartner.id !== id) {
      return NextResponse.json(
        { error: 'A community partner with this name already exists' },
        { status: 400 }
      );
    }

    // Update community partner
    const [updatedPartner] = await db
      .update(communityPartners)
      .set({
        name: name.trim(),
        updatedAt: new Date(),
      })
      .where(eq(communityPartners.id, id))
      .returning();

    // Log update if name changed
    if (name.trim() !== existingPartner.name) {
      await ActivityFeedService.logCommunityPartnerUpdated(
        currentUser.id,
        id,
        existingPartner.name,
        name.trim()
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Community partner updated successfully',
      communityPartner: updatedPartner,
    });
  } catch (error) {
    console.error('Community partner update error:', error);
    return NextResponse.json(
      { error: 'Failed to update community partner' },
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

    // Check if community partner exists
    const [existingPartner] = await db
      .select()
      .from(communityPartners)
      .where(eq(communityPartners.id, id))
      .limit(1);

    if (!existingPartner) {
      return NextResponse.json(
        { error: 'Community partner not found' },
        { status: 404 }
      );
    }

    // Delete community partner
    await db.delete(communityPartners).where(eq(communityPartners.id, id));

    // Log deletion
    await ActivityFeedService.logCommunityPartnerDeleted(
      currentUser.id,
      id,
      existingPartner.name
    );

    return NextResponse.json({
      success: true,
      message: 'Community partner deleted successfully',
    });
  } catch (error) {
    console.error('Community partner deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete community partner' },
      { status: 500 }
    );
  }
}
