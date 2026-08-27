// app/api/admin/users/[id]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, users, sites, events, supplyDistributions } from '@/db';
import { eq, count } from 'drizzle-orm';

/** Revokes a pending invitation by deleting the never-used account. */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    if (id === currentUser.id) {
      return NextResponse.json(
        { error: 'You cannot delete your own account.' },
        { status: 400 }
      );
    }

    const [target] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!target) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const fullName = `${target.firstName} ${target.lastName}`;

    // Only outstanding invitations may be revoked this way; an account that
    // has been used is deactivated, not deleted.
    if (target.inviteAcceptedAt || !target.invitedAt) {
      return NextResponse.json(
        {
          error: `${fullName} has an active account, so the invitation cannot be revoked. Deactivate the account instead.`,
        },
        { status: 409 }
      );
    }

    // users is referenced by sites/events/supply_distributions with NO ACTION,
    // so report what blocks the delete instead of surfacing an FK violation.
    const [[siteCount], [eventCount], [distCount]] = await Promise.all([
      db.select({ n: count() }).from(sites).where(eq(sites.userId, id)),
      db.select({ n: count() }).from(events).where(eq(events.userId, id)),
      db
        .select({ n: count() })
        .from(supplyDistributions)
        .where(eq(supplyDistributions.userId, id)),
    ]);

    const blockers = [
      Number(siteCount?.n || 0) > 0 && `${siteCount.n} site(s)`,
      Number(eventCount?.n || 0) > 0 && `${eventCount.n} event(s)`,
      Number(distCount?.n || 0) > 0 && `${distCount.n} distribution(s)`,
    ].filter(Boolean);

    if (blockers.length > 0) {
      return NextResponse.json(
        {
          error: `Cannot revoke ${fullName}: still assigned to ${blockers.join(', ')}. Reassign those records first.`,
        },
        { status: 409 }
      );
    }

    await db.delete(users).where(eq(users.id, id));

    return NextResponse.json({
      success: true,
      message: `Invitation for ${fullName} revoked`,
    });
  } catch (error) {
    console.error('Revoke invitation error:', error);
    return NextResponse.json(
      { error: 'Failed to revoke invitation' },
      { status: 500 }
    );
  }
}
