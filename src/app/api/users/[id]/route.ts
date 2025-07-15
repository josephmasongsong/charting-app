import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, users } from '@/db';
import { eq, sql } from 'drizzle-orm';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const {
      firstName,
      lastName,
      name,
      email,
      role,
      isActive,
      region,
      jobTitle,
    } = body;

    // Check current user permissions
    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isAdmin = currentUser.role === 'admin';
    const isOwnProfile = session.user.id === id;

    // Only allow role changes if user is admin
    if (role && !isAdmin) {
      return NextResponse.json(
        { error: 'Only admins can change roles' },
        { status: 403 }
      );
    }

    // Only allow isActive changes if user is admin
    if (isActive !== undefined && !isAdmin) {
      return NextResponse.json(
        { error: 'Only admins can change account status' },
        { status: 403 }
      );
    }

    // Only allow region changes if user is admin
    if (region !== undefined && !isAdmin) {
      return NextResponse.json(
        { error: 'Only admins can change regions' },
        { status: 403 }
      );
    }

    // Only allow jobTitle changes if user is admin
    if (jobTitle !== undefined && !isAdmin) {
      return NextResponse.json(
        { error: 'Only admins can change job titles' },
        { status: 403 }
      );
    }

    // Only allow editing other users if admin
    if (!isOwnProfile && !isAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Validate role if provided
    if (role && !['admin', 'user', 'partner'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Validate region if provided
    if (region && !['LMDM', 'VIR', 'Interior', 'Northern'].includes(region)) {
      return NextResponse.json({ error: 'Invalid region' }, { status: 400 });
    }

    // Validate jobTitle if provided
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

    // Build update object
    const updateData: any = {
      updatedAt: new Date(),
    };

    // Handle name field - prioritize firstName/lastName combination
    if (firstName !== undefined || lastName !== undefined) {
      const first = firstName?.trim() || '';
      const last = lastName?.trim() || '';
      updateData.firstName = first;
      updateData.lastName = last;
    } else if (name !== undefined) {
      // If only name is provided, try to split it
      const nameParts = name.trim().split(' ');
      updateData.firstName = nameParts[0] || '';
      updateData.lastName = nameParts.slice(1).join(' ') || '';
    }

    if (email !== undefined) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        );
      }

      // Check if email is already taken by another user
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, email.toLowerCase()))
        .limit(1);

      if (existingUser && existingUser.id !== id) {
        return NextResponse.json(
          { error: 'Email is already taken' },
          { status: 400 }
        );
      }

      updateData.email = email.toLowerCase();
    }

    if (role !== undefined && isAdmin) {
      updateData.role = role;
    }

    if (isActive !== undefined && isAdmin) {
      updateData.isActive = isActive;
    }

    if (region !== undefined && isAdmin) {
      updateData.region = region;
    }

    if (jobTitle !== undefined && isAdmin) {
      // Set jobTitle to null if role is partner, otherwise use the provided value
      if (role === 'partner') {
        updateData.jobTitle = null;
      } else {
        // Check current user role if role is not being updated
        const [currentUserData] = await db
          .select()
          .from(users)
          .where(eq(users.id, id))
          .limit(1);

        if (currentUserData?.role === 'partner' && role === undefined) {
          updateData.jobTitle = null;
        } else {
          updateData.jobTitle = jobTitle;
        }
      }
    }

    // Handle role changes and jobTitle implications
    if (role !== undefined && isAdmin) {
      updateData.role = role;
      // If changing to partner role, set jobTitle to null
      if (role === 'partner') {
        updateData.jobTitle = null;
      }
      // If changing from partner to another role and no jobTitle provided, set default
      else if (jobTitle === undefined) {
        const [currentUserData] = await db
          .select()
          .from(users)
          .where(eq(users.id, id))
          .limit(1);
        if (currentUserData?.role === 'partner') {
          updateData.jobTitle = 'Tenant Engagement Worker';
        }
      }
    }

    // Update user in database
    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return user without sensitive data
    const { hashedPassword, resetToken, resetTokenExpiry, ...safeUser } =
      updatedUser;

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      user: safeUser,
    });
  } catch (error) {
    console.error('User update error:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const [user] = await db
      .select({
        id: users.id,
        name: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`.as(
          'name'
        ),
        email: users.email,
        role: users.role,
        region: users.region,
        jobTitle: users.jobTitle,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check permissions
    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    const isAdmin = currentUser?.role === 'admin';
    const isOwnProfile = session.user.id === id;

    if (!isOwnProfile && !isAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Split name into firstName and lastName for editing
    const nameParts = user.name?.split(' ') || [];
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    return NextResponse.json({
      user: {
        ...user,
        firstName,
        lastName,
      },
    });
  } catch (error) {
    console.error('User fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}
