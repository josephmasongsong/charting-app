import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, sites } from '@/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Every site, unlike the distribution options route which filters to sites
    // holding stock — a referral has nothing to do with inventory.
    const sitesData = await db
      .select({
        id: sites.id,
        name: sites.name,
        address: sites.address,
      })
      .from(sites)
      .orderBy(sites.name);

    return NextResponse.json({ sites: sitesData });
  } catch (error) {
    console.error('Referral options fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch referral options' },
      { status: 500 }
    );
  }
}
