import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { db, users } from '@/db';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { Resend } from 'resend';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

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

    const {
      firstName,
      lastName,
      email,
      password,
      role = 'user',
      region = 'LMDM',
      jobTitle = 'Tenant Engagement Worker',
      sendInvite = true,
    } = await req.json();

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate role
    if (!['admin', 'user', 'partner'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Validate region
    if (!['LMDM', 'VIR', 'Interior', 'Northern'].includes(region)) {
      return NextResponse.json({ error: 'Invalid region' }, { status: 400 });
    }

    // Validate jobTitle
    if (
      jobTitle &&
      ![
        'Tenant Engagement Worker',
        'People Plants & Homes',
        'Tenant Support Worker',
        'Health Services Manager',
      ].includes(jobTitle)
    ) {
      return NextResponse.json({ error: 'Invalid job title' }, { status: 400 });
    }

    // Check if user already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Generate user ID and hash password
    // const userId = `user_${crypto.randomBytes(8).toString('hex')}`;

    const hashedPassword = await bcrypt.hash(password, 10);
    // const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

    // Prepare user data
    const userData: any = {
      firstName: firstName,
      lastName: lastName,
      email: email.toLowerCase(),
      hashedPassword,
      role,
      region,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Set jobTitle based on role
    if (role === 'partner') {
      userData.jobTitle = null;
    } else {
      userData.jobTitle = jobTitle;
    }

    // Create user
    const [newUser] = await db.insert(users).values(userData).returning();

    // Send invitation email if requested
    if (sendInvite && process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: process.env.EMAIL_FROM!,
          to: email,
          subject: 'Welcome! Your account has been created',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Welcome to Our Platform!</h2>
              <p>Hello ${firstName},</p>
              <p>Your account has been created by an administrator. Here are your login details:</p>

              <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Temporary Password:</strong> ${password}</p>
                <p><strong>Role:</strong> ${role}</p>
                <p><strong>Region:</strong> ${region}</p>
                ${role !== 'partner' ? `<p><strong>Job Title:</strong> ${jobTitle}</p>` : ''}
              </div>

              <p style="margin: 20px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/login"
                   style="background-color: #007cff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                  Login to Your Account
                </a>
              </p>

              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                <strong>Important:</strong> Please change your password after your first login for security purposes.
              </p>

              <p style="color: #666; font-size: 14px;">
                If you have any questions, please contact your administrator.
              </p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error('Failed to send invitation email:', emailError);
        // Don't fail the user creation if email fails
      }
    }

    // Return user without sensitive data
    const {
      hashedPassword: _,
      resetToken,
      resetTokenExpiry,
      ...safeUser
    } = newUser;

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: safeUser,
      emailSent: sendInvite,
    });
  } catch (error) {
    console.error('User invitation error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
