import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import {
  db,
  activityTypes,
  sites,
  communityPartners,
  programGoals,
} from '@/db';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get all activity types with their program goals
    const activityTypesData = await db
      .select({
        id: activityTypes.id,
        name: activityTypes.name,
        programGoalId: activityTypes.programGoalId,
        programGoalName: programGoals.name,
      })
      .from(activityTypes)
      .leftJoin(programGoals, eq(activityTypes.programGoalId, programGoals.id))
      .orderBy(activityTypes.name);

    // Get all sites
    const sitesData = await db
      .select({
        id: sites.id,
        name: sites.name,
        address: sites.address,
      })
      .from(sites)
      .orderBy(sites.name);

    // Get all community partners
    const partnersData = await db
      .select({
        id: communityPartners.id,
        name: communityPartners.name,
      })
      .from(communityPartners)
      .orderBy(communityPartners.name);

    return NextResponse.json({
      activityTypes: activityTypesData,
      sites: sitesData,
      communityPartners: partnersData,
    });
  } catch (error) {
    console.error('Options fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch options' },
      { status: 500 }
    );
  }
}
