import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import {
  db,
  sites,
  users,
  communityPartners,
  siteSupplies,
  supplies,
} from '@/db';
import { eq, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

// Two assignments join users twice, so each needs its own alias.
const tew = alias(users, 'tew');
const pph = alias(users, 'pph');
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProfileField } from '@/components/ui/profile-field';
import { DataTable } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { Package } from 'lucide-react';
import { notFound } from 'next/navigation';
import { AvatarTile } from '@/components/ui/avatar-tile';
import { cn } from '@/lib/utils';
import BackButton from '@/components/BackButton';
import EditButton from './components/EditButton';
import GoogleMapsButton from './components/GoogleMapsButton';

interface SitePageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getSite(siteId: string) {
  const [site] = await db
    .select({
      id: sites.id,
      name: sites.name,
      latitude: sites.latitude,
      longitude: sites.longitude,
      address: sites.address,
      numberOfTenants: sites.numberOfTenants,
      hasCommunityRoom: sites.hasCommunityRoom,
      hasCommunityPartner: sites.hasCommunityPartner,
      communityPartnerId: sites.communityPartnerId,
      communityPartnerName: communityPartners.name,
      isSingleSeniorOnly: sites.isSingleSeniorOnly,
      region: sites.region,
      tewId: sites.tewId,
      tewName: sql<string>`CONCAT(${tew.firstName}, ' ', ${tew.lastName})`,
      tewEmail: tew.email,
      pphId: sites.pphId,
      pphName: sql<
        string | null
      >`CONCAT(${pph.firstName}, ' ', ${pph.lastName})`,
      pphEmail: pph.email,
      createdAt: sites.createdAt,
      updatedAt: sites.updatedAt,
    })
    .from(sites)
    .leftJoin(tew, eq(sites.tewId, tew.id))
    .leftJoin(pph, eq(sites.pphId, pph.id))
    .leftJoin(
      communityPartners,
      eq(sites.communityPartnerId, communityPartners.id)
    )
    .where(eq(sites.id, siteId))
    .limit(1);

  return site;
}

async function getSiteSupplies(siteId: string) {
  const siteSuppliesData = await db
    .select({
      id: siteSupplies.id,
      supplyId: siteSupplies.supplyId,
      supplyName: supplies.name,
      quantity: siteSupplies.quantity,
      costPerUnit: supplies.costPerUnit,
      totalValue: sql<number>`${siteSupplies.quantity} * ${supplies.costPerUnit}`,
      lastUpdated: siteSupplies.updatedAt,
    })
    .from(siteSupplies)
    .innerJoin(supplies, eq(siteSupplies.supplyId, supplies.id))
    .where(eq(siteSupplies.siteId, siteId))
    .orderBy(supplies.name);

  return siteSuppliesData;
}

async function getSiteEventStats(siteId: string) {
  const { events } = await import('@/db');
  const result = await db
    .select({
      count: sql<number>`count(*)`,
      totalParticipants: sql<number>`coalesce(sum(${events.newParticipants} + ${events.returningParticipants}), 0)`,
    })
    .from(events)
    .where(eq(events.siteId, siteId));

  return {
    count: Number(result[0]?.count || 0),
    totalParticipants: Number(result[0]?.totalParticipants || 0),
  };
}

const surfaceCardClass =
  'gap-0 rounded-(--radius-card) border-(--border-default) bg-(--surface-card) shadow-(--shadow-card)';
const kpiTileClass =
  'gap-0 rounded-(--radius-card) border-(--border-default) border-l-4 border-l-(--surface-chrome) bg-(--surface-card) px-[18px] pt-3.5 pb-4 shadow-(--shadow-card)';
const outlineButtonClass =
  'h-auto rounded-(--radius-control) border-(--action-primary) bg-(--surface-card) px-[18px] py-[9px] text-[15px] font-normal text-(--action-primary) shadow-none hover:bg-(--action-selected) hover:text-(--action-primary) disabled:border-(--bch-gray-300) disabled:text-(--bch-gray-500) disabled:opacity-100';

function StaffBlock({
  role,
  name,
  email,
  userId,
}: {
  role: string;
  name: string | null;
  email: string | null;
  userId: string | null;
}) {
  return (
    <div>
      <div className="text-[11.5px] font-semibold tracking-[.5px] text-(--text-muted) uppercase">
        {role}
      </div>
      {userId && name ? (
        <div className="mt-1.5 flex items-start gap-3">
          <AvatarTile
            initials={
              name
                .split(' ')
                .map(n => n[0])
                .join('') ?? ''
            }
            size={44}
          />
          <div className="min-w-0">
            <Link
              href={`/users/${userId}`}
              className="text-[14.5px] font-bold text-(--text-body) hover:text-(--action-primary) hover:underline"
            >
              {name}
            </Link>
            <div className="mt-0.5 text-[12.5px] text-(--text-muted)">
              {email}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-1.5 text-[14.5px] text-(--text-muted)">
          Unassigned
        </div>
      )}
    </div>
  );
}

function money(value: number) {
  return `$${value.toFixed(2)}`;
}

const REGION_LABELS: Record<string, string> = {
  LMDM: 'Lower Mainland',
  VIR: 'Vancouver Island',
  Interior: 'Interior',
  Northern: 'Northern',
};

function formatDate(date: Date | string | null) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-CA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default async function SitePage({ params }: SitePageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const { id } = await params;
  const site = await getSite(id);
  const siteSuppliesData = await getSiteSupplies(id);
  const eventStats = await getSiteEventStats(id);

  if (!site) {
    notFound();
  }

  const isAdmin = session.user?.role === 'admin';

  const totalSupplyValue = siteSuppliesData.reduce(
    (sum, supply) => sum + Number(supply.totalValue),
    0
  );
  const totalSupplyItems = siteSuppliesData.reduce(
    (sum, supply) => sum + supply.quantity,
    0
  );

  const kpis: { label: string; value: string; note?: string }[] = [
    {
      label: 'Total Tenants',
      value: String(site.numberOfTenants),
    },
    {
      label: 'Events Held',
      value: String(eventStats.count),
      note: 'All time',
    },
    {
      label: 'Avg Attendance',
      value:
        eventStats.count > 0
          ? String(Math.round(eventStats.totalParticipants / eventStats.count))
          : '—',
      note: eventStats.count > 0 ? 'Per event, all time' : 'No events yet',
    },
    {
      label: 'Inventory Value',
      value: money(totalSupplyValue),
      note: `${totalSupplyItems} unit${totalSupplyItems === 1 ? '' : 's'} on hand`,
    },
  ];

  return (
    <div className="min-h-screen bg-(--surface-page) px-6 pt-6 pb-12">
      <div className="mx-auto max-w-[1180px]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[28px] leading-tight font-bold tracking-[-.2px]">
              {site.name}
            </h1>
            <p className="mt-1.5 text-[15px] text-(--text-muted)">
              Site details and information
            </p>
          </div>
          <div className="flex shrink-0 gap-2.5">
            {/* TODO: /sites/[id] — not wired: template's "Log an event"
                header action; /events/new exists but wiring is a
                behaviour decision. */}
            <Button
              variant="outline"
              disabled
              className={outlineButtonClass}
            >
              Log an event
            </Button>
            {isAdmin && (
              <>
                <BackButton />
                <EditButton siteId={site.id} />
              </>
            )}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
          {kpis.map(kpi => (
            <Card key={kpi.label} className={kpiTileClass}>
              <div className="text-[11.5px] font-semibold tracking-[.5px] text-(--text-muted) uppercase">
                {kpi.label}
              </div>
              <div className="mt-1.5 text-[30px] leading-[1.1] font-bold text-(--surface-chrome)">
                {kpi.value}
              </div>
              {kpi.note && (
                <div className="mt-1 text-[12.5px] text-(--text-muted)">
                  {kpi.note}
                </div>
              )}
            </Card>
          ))}
        </div>

        <Card
          className={cn(
            surfaceCardClass,
            'mt-5 grid grid-cols-1 gap-8 p-8 md:grid-cols-[220px_1fr_1.1fr]'
          )}
        >
          <div>
            <iframe
              src={`https://maps.google.com/maps?q=${site.latitude},${site.longitude}&z=15&output=embed`}
              title={`Map of ${site.name}`}
              loading="lazy"
              className="h-[220px] w-[220px] max-w-full rounded-(--radius-card) border-0"
            />
            <div className="mt-3.5 text-[22px] leading-[1.25] font-bold">
              {site.name}
            </div>
            <div className="mt-3">
              <GoogleMapsButton
                latitude={site.latitude}
                longitude={site.longitude}
              />
            </div>
          </div>

          <div>
            <ProfileField label="Address">{site.address}</ProfileField>
            <ProfileField label="Region">
              {REGION_LABELS[site.region] ?? site.region}
            </ProfileField>
            <ProfileField label="Tenancy Type">
              {site.isSingleSeniorOnly ? 'Single seniors only' : 'Mixed tenancy'}
            </ProfileField>
            <ProfileField label="Community Room">
              {site.hasCommunityRoom ? 'Yes' : 'No'}
            </ProfileField>
            {site.hasCommunityPartner && site.communityPartnerName && (
              <ProfileField label="Community Partner">
                {site.communityPartnerName}
              </ProfileField>
            )}
          </div>

          <div>
            <div className="mb-3 text-[17px] font-bold">Assigned Staff</div>
            <div className="flex flex-col gap-4">
              <StaffBlock
                role="Tenant Engagement Worker"
                name={site.tewName}
                email={site.tewEmail}
                userId={site.tewId}
              />
              <StaffBlock
                role="PPH Programmer"
                name={site.pphName}
                email={site.pphEmail}
                userId={site.pphId}
              />
            </div>
          </div>
        </Card>

        <Card className={cn(surfaceCardClass, 'mt-4 overflow-hidden')}>
          <div className="flex flex-wrap items-baseline justify-between gap-4 px-6 pt-[18px] pb-3.5">
            <div>
              <div className="text-[17px] font-bold">Supply Inventory</div>
              <div className="mt-0.5 text-[13px] text-(--text-muted)">
                Stock held at this site
              </div>
            </div>
            {/* TODO: /sites/[id] — not wired: no request-stock flow exists;
                also pending the inventory-direction decision. */}
            <Button variant="outline" size="sm" disabled className={outlineButtonClass}>
              Request stock
            </Button>
          </div>
          {siteSuppliesData.length > 0 ? (
            <div className="overflow-x-auto px-6 pb-5">
              {/* TODO: /sites/[id] — not wired: template's par-level sublines,
                  low-stock pills, and warning banner need a par column on
                  site_supplies (and the inventory-direction decision). */}
              <DataTable
                columns={[
                  { key: 'item', label: 'Item' },
                  { key: 'qty', label: 'On hand', num: true },
                  { key: 'unit', label: 'Unit cost', num: true },
                  { key: 'value', label: 'Value', num: true },
                ]}
                rows={siteSuppliesData.map(supply => ({
                  item: (
                    <div>
                      <div className="text-[15px] font-semibold">
                        {supply.supplyName}
                      </div>
                      <div className="mt-0.5 text-[12.5px] text-(--text-muted)">
                        Updated {formatDate(supply.lastUpdated)}
                      </div>
                    </div>
                  ),
                  qty: (
                    <span className="text-[15px] font-semibold">
                      {supply.quantity}
                    </span>
                  ),
                  unit: (
                    <span className="text-(--text-muted)">
                      {money(Number(supply.costPerUnit))}
                    </span>
                  ),
                  value: money(Number(supply.totalValue)),
                }))}
                footer={{
                  item: `${siteSuppliesData.length} item${siteSuppliesData.length === 1 ? '' : 's'}`,
                  qty: String(totalSupplyItems),
                  unit: '',
                  value: money(totalSupplyValue),
                }}
              />
            </div>
          ) : (
            <EmptyState
              icon={Package}
              title="No supplies at this site"
              description="Supplies assigned to this site will appear here"
              className="border-0"
            />
          )}
        </Card>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: SitePageProps) {
  const { id } = await params;
  const site = await getSite(id);

  if (!site) {
    return {
      title: 'Site Not Found',
    };
  }

  return {
    title: `${site.name} - Site Details`,
    description: `View details for ${site.name} located at ${site.address}`,
  };
}
