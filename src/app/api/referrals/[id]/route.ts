import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, users, sites, referrals } from '@/db';
import { eq } from 'drizzle-orm';
import { ActivityFeedService } from '@/lib/services/activity-feed.service';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user has admin access
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

    // Read the details for the feed entry before the row goes away
    const [existingReferral] = await db
      .select({
        id: referrals.id,
        channel: referrals.channel,
        referredTo: referrals.referredTo,
        siteName: sites.name,
      })
      .from(referrals)
      .leftJoin(sites, eq(referrals.siteId, sites.id))
      .where(eq(referrals.id, id))
      .limit(1);

    if (!existingReferral) {
      return NextResponse.json(
        { error: 'Referral not found' },
        { status: 404 }
      );
    }

    await db.delete(referrals).where(eq(referrals.id, id));

    await ActivityFeedService.logReferralDeleted(currentUser.id, id, {
      siteName: existingReferral.siteName || 'Unknown Site',
      channel: existingReferral.channel,
      referredTo: existingReferral.referredTo,
    });

    return NextResponse.json({
      success: true,
      message: 'Referral deleted',
    });
  } catch (error) {
    console.error('Referral deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete referral' },
      { status: 500 }
    );
  }
}
