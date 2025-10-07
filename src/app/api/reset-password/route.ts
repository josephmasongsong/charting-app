import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { Resend } from 'resend';

const logoUrl = `${process.env.NEXT_PUBLIC_APP_URL}/logo.jpg`;
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      // Return success even if no user found (security)
      return NextResponse.json({
        success: true,
        message: 'If an account exists, a reset link has been sent',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 1); // Token expires in 1 hour

    // Save token to user
    await db
      .update(users)
      .set({
        resetToken,
        resetTokenExpiry: tokenExpiry,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    // Create email with reset link
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/${resetToken}`;

    // Send email using Resend
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <img src="${logoUrl}" style="width: 40px; height: 40px; margin: auto; display: block;" alt="BCH Logo" />
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>You requested a password reset for your account. Click the link below to reset your password:</p>
          <p style="margin: 20px 0;">
            <a href="${resetUrl}" style="background-color: #007cff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Reset Password
            </a>
          </p>
          <p style="color: #666; font-size: 14px;">
            This link will expire in 1 hour. If you didn't request this reset, please ignore this email.
          </p>
          <p style="color: #666; font-size: 14px;">
            If the button doesn't work, copy and paste this link: ${resetUrl}
          </p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: 'If an account exists, a reset link has been sent',
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { success: false, message: 'Something went wrong' },
      { status: 500 }
    );
  }
}
