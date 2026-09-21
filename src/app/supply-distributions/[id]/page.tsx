import {
  db,
  supplyDistributions,
  supplyDistributionItems,
  supplies,
  sites,
  users,
  events,
} from '@/db';
import { eq, sql } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { Truck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ProfileField } from '@/components/ui/profile-field';
import { DataTable } from '@/components/ui/data-table';
import { DistributionTypeBadge } from '@/app/admin/supply-distributions/components/distribution-type-badge';
import { AvatarTile } from '@/components/ui/avatar-tile';
import { cn } from '@/lib/utils';

interface DistributionPageProps {
  params: Promise<{ id: string }>;
}

const surfaceCardClass =
  'gap-0 rounded-(--radius-card) border-(--border-default) bg-(--surface-card) shadow-(--shadow-card)';

function money(value: string | number) {
  return `$${parseFloat(String(value)).toFixed(2)}`;
}

// distribution_date is a DATE column serialised as YYYY-MM-DD; parse the
// parts to avoid the UTC shift.
function dateParts(dateStr: string) {
  const [y, m, d] = dateStr.slice(0, 10).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function formatDateLong(dateStr: string) {
  return dateParts(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

function formatDateShort(dateStr: string) {
  return dateParts(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

function formatTimestamp(date: Date | string) {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

async function getDistribution(id: string) {
  const [distribution] = await db
    .select({
      id: supplyDistributions.id,
      distributionDate: supplyDistributions.distributionDate,
      distributionType: supplyDistributions.distributionType,
      totalCost: supplyDistributions.totalCost,
      notes: supplyDistributions.notes,
      createdAt: supplyDistributions.createdAt,
      updatedAt: supplyDistributions.updatedAt,
      siteId: supplyDistributions.siteId,
      siteName: sites.name,
      userId: supplyDistributions.userId,
      userName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
      eventId: supplyDistributions.eventId,
      eventTitle: events.title,
    })
    .from(supplyDistributions)
    .leftJoin(sites, eq(supplyDistributions.siteId, sites.id))
    .leftJoin(users, eq(supplyDistributions.userId, users.id))
    .leftJoin(events, eq(supplyDistributions.eventId, events.id))
    .where(eq(supplyDistributions.id, id))
    .limit(1);

  return distribution;
}

async function getDistributionItems(id: string) {
  return db
    .select({
      id: supplyDistributionItems.id,
      supplyName: supplies.name,
      quantityDistributed: supplyDistributionItems.quantityDistributed,
      unitCostAtTime: supplyDistributionItems.unitCostAtTime,
      lineTotal: supplyDistributionItems.lineTotal,
    })
    .from(supplyDistributionItems)
    .innerJoin(supplies, eq(supplyDistributionItems.supplyId, supplies.id))
    .where(eq(supplyDistributionItems.distributionId, id))
    .orderBy(supplies.name);
}

export default async function DistributionPage({
  params,
}: DistributionPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const { id } = await params;
  const distribution = await getDistribution(id);

  if (!distribution) {
    notFound();
  }

  const items = await getDistributionItems(id);
  const itemBreakdown = items
    .map(item => `${item.supplyName} (${item.quantityDistributed})`)
    .join(', ');
  const initials = distribution.userName
    ?.split(' ')
    .map(part => part[0])
    .join('');

  return (
    <div className="bg-(--surface-page) px-6 pt-6 pb-12">
      <div className="mx-auto max-w-[1180px]">
        <div>
          <h1 className="text-[28px] leading-tight font-bold tracking-[-.2px]">
            {distribution.siteName} —{' '}
            {formatDateShort(distribution.distributionDate)}
          </h1>
          <p className="mt-1.5 text-[13.5px] text-(--text-muted)">
            Created {formatTimestamp(distribution.createdAt)} · Updated{' '}
            {formatTimestamp(distribution.updatedAt)}
          </p>
        </div>

        <Card
          className={cn(
            surfaceCardClass,
            'mt-5 grid grid-cols-1 gap-8 p-8 md:grid-cols-[180px_1fr_1.1fr]'
          )}
        >
          <div>
            <div className="grid size-[72px] place-items-center rounded-(--radius-card) bg-(--surface-chrome) text-(--text-on-chrome)">
              <Truck size={34} />
            </div>
          </div>

          <div>
            <ProfileField label="Distribution Date">
              {formatDateLong(distribution.distributionDate)}
            </ProfileField>
            <ProfileField label="Site">
              <Link
                href={`/sites/${distribution.siteId}`}
                className="text-(--action-primary) hover:underline"
              >
                {distribution.siteName}
              </Link>
            </ProfileField>
            <ProfileField label="Type">
              <DistributionTypeBadge type={distribution.distributionType} />
            </ProfileField>
            <ProfileField label="Total Items Distributed">
              {itemBreakdown || '—'}
            </ProfileField>
            {distribution.eventId && distribution.eventTitle && (
              <ProfileField label="Associated Event">
                <Link
                  href={`/events/${distribution.eventId}`}
                  className="text-(--action-primary) hover:underline"
                >
                  {distribution.eventTitle}
                </Link>
              </ProfileField>
            )}
          </div>

          <div>
            <div className="mb-3 text-[17px] font-bold">Distributed By</div>
            <div className="flex items-center gap-3">
              <AvatarTile initials={initials ?? ''} size={44} />
              <div className="min-w-0">
                <Link
                  href={`/users/${distribution.userId}`}
                  className="text-[14.5px] font-bold text-(--text-body) hover:text-(--action-primary) hover:underline"
                >
                  {distribution.userName}
                </Link>
              </div>
            </div>

            <div className="mt-5">
              <ProfileField label="Notes">
                {distribution.notes || 'None recorded'}
              </ProfileField>
            </div>
          </div>
        </Card>

        <Card className={cn(surfaceCardClass, 'mt-4 overflow-hidden')}>
          <div className="px-6 pt-[18px] pb-3.5">
            <div className="text-[17px] font-bold">
              Distributed Items ({items.length})
            </div>
          </div>
          <div className="overflow-x-auto px-6 pb-5">
            <DataTable
              columns={[
                { key: 'name', label: 'Supply item' },
                { key: 'qty', label: 'Quantity', num: true },
                { key: 'unit', label: 'Unit cost', num: true },
                { key: 'lineTotal', label: 'Line total', num: true },
              ]}
              rows={items.map(item => ({
                name: <span className="font-semibold">{item.supplyName}</span>,
                qty: item.quantityDistributed.toLocaleString(),
                unit: money(item.unitCostAtTime),
                lineTotal: money(item.lineTotal),
              }))}
              footer={{
                name: 'Total distribution value',
                qty: '',
                unit: '',
                lineTotal: money(distribution.totalCost),
              }}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: DistributionPageProps) {
  const { id } = await params;
  const distribution = await getDistribution(id);

  if (!distribution) {
    return { title: 'Distribution Not Found' };
  }

  return {
    title: `${distribution.siteName} — ${formatDateShort(distribution.distributionDate)} - Distribution`,
  };
}
