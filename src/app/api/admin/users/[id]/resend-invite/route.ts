// app/api/admin/users/[id]/resend-invite/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, users } from '@/db';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const logoUrl = `${process.env.NEXT_PUBLIC_APP_URL}/logo.jpg`;

/** Re-issues a temporary password and re-sends the invitation email. */
export async function POST(
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
    const [invitee] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!invitee) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only an outstanding invitation may be resent. Without this, resending
    // against an established account would silently reset its password.
    if (!invitee.invitedAt || invitee.inviteAcceptedAt) {
      return NextResponse.json(
        {
          error: `${invitee.firstName} ${invitee.lastName} does not have an outstanding invitation, so nothing was resent.`,
        },
        { status: 409 }
      );
    }

    // The original temporary password is not recoverable, so issue a new one.
    const tempPassword = crypto.randomBytes(9).toString('base64url');
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    await db
      .update(users)
      .set({
        hashedPassword,
        invitedAt: new Date(),
        invitedBy: currentUser.id,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'Email is not configured, so the invitation was not sent.' },
        { status: 500 }
      );
    }

    try {
      await resend.emails.send({
        from: process.env.EMAIL_FROM!,
        to: invitee.email,
        subject: 'Your invitation reminder',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <img src="${logoUrl}" style="width: 40px; height: 40px; margin: auto; display: block;" alt="BCH Logo" />
            <h2 style="color: #333;">Your account is waiting</h2>
            <p>Hello ${invitee.firstName},</p>
            <p>Here are fresh login details for your account:</p>
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Email:</strong> ${invitee.email}</p>
              <p><strong>Temporary Password:</strong> ${tempPassword}</p>
            </div>
            <p style="margin: 20px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/login"
                 style="background-color: #0073ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Login to Your Account
              </a>
            </p>
            <p style="color: #666; font-size: 14px;">
              <strong>Important:</strong> Please change your password after signing in.
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Failed to resend invitation email:', emailError);
      return NextResponse.json(
        { error: 'Password was reset but the email failed to send.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Invitation resent to ${invitee.email}`,
    });
  } catch (error) {
    console.error('Resend invitation error:', error);
    return NextResponse.json(
      { error: 'Failed to resend invitation' },
      { status: 500 }
    );
  }
}
