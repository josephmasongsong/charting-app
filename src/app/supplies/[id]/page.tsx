import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import { db, supplies, siteSupplies, sites, users } from '@/db';
import { eq } from 'drizzle-orm';
import SupplyDetailCard from './components/SupplyDetailCard';

interface SupplyPageProps {
  params: {
    id: string;
  };
}

// Server function to fetch supply data directly from database
async function getSupplyData(supplyId: string) {
  try {
    // Get supply details
    const [supply] = await db
      .select({
        id: supplies.id,
        name: supplies.name,
        costPerUnit: supplies.costPerUnit,
        quantity: supplies.quantity,
        createdAt: supplies.createdAt,
        updatedAt: supplies.updatedAt,
      })
      .from(supplies)
      .where(eq(supplies.id, supplyId))
      .limit(1);

    if (!supply) {
      return null;
    }

    // Get site distribution for this supply
    const siteDistribution = await db
      .select({
        siteId: sites.id,
        siteName: sites.name,
        quantity: siteSupplies.quantity,
      })
      .from(siteSupplies)
      .innerJoin(sites, eq(siteSupplies.siteId, sites.id))
      .where(eq(siteSupplies.supplyId, supplyId))
      .orderBy(sites.name);

    // Calculate total value
    const totalValue = Number(supply.costPerUnit) * supply.quantity;

    // Calculate distributed vs available quantities
    const distributedQuantity = siteDistribution.reduce(
      (sum, site) => sum + site.quantity,
      0
    );
    const availableQuantity = supply.quantity - distributedQuantity;

    return {
      supply: {
        ...supply,
        createdAt: String(supply.createdAt),
        updatedAt: String(supply.updatedAt),
        totalValue,
        distributedQuantity,
        availableQuantity,
      },
      siteDistribution,
    };
  } catch (error) {
    console.error('Error fetching supply data:', error);
    throw error;
  }
}

export default async function SupplyPage({ params }: SupplyPageProps) {
  const session = await getServerSession(authOptions);

  // Redirect unauthenticated users to login
  if (!session) {
    redirect('/login');
  }

  // Check if user exists and is active
  const [currentUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!currentUser || !currentUser.isActive) {
    redirect('/login');
  }

  // Fetch supply data on the server
  const { id } = await params;

  let supplyData;
  try {
    supplyData = await getSupplyData(id);
  } catch (error) {
    // Handle server-side fetch errors
    console.error('Failed to fetch supply data:', error);
    throw error;
  }

  // Return 404 if supply not found
  if (!supplyData) {
    notFound();
  }

  return <SupplyDetailCard data={supplyData} />;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: SupplyPageProps) {
  try {
    const { id } = await params;
    const supplyData = await getSupplyData(id);

    if (!supplyData) {
      return {
        title: 'Supply Not Found',
      };
    }

    return {
      title: `${supplyData.supply.name} - Supply Details`,
      description: `View details for ${supplyData.supply.name} - Quantity: ${supplyData.supply.quantity}, Cost: ${supplyData.supply.costPerUnit}`,
    };
  } catch (error) {
    return {
      title: 'Supply Details',
    };
  }
}
