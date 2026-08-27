import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import {
  db,
  events,
  users,
  sites,
  communityPartners,
  activityTypes,
} from '@/db';
import { eq, sql } from 'drizzle-orm';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProfileField } from '@/components/ui/profile-field';
import { Calendar, Copy, Edit } from 'lucide-react';
import Link from 'next/link';
import { AvatarTile } from '@/components/ui/avatar-tile';
import { cn } from '@/lib/utils';
import { DuplicateEventDialog } from '../components/DuplicateEventDialog';

interface EventPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getEvent(eventId: string) {
  const [event] = await db
    .select({
      id: events.id,
      title: events.title,
      eventDate: events.eventDate,
      description: events.description,
      eventDuration: events.eventDuration,
      adminDuration: events.adminDuration,
      newParticipants: events.newParticipants,
      returningParticipants: events.returningParticipants,
      eventIsYouthFocused: events.eventIsYouthFocused,
      hasCoHost: events.hasCoHost,
      totalCost: events.totalCost,
      createdAt: events.createdAt,
      updatedAt: events.updatedAt,
      userId: events.userId,
      userName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
      userJobTitle: users.jobTitle,
      siteId: events.siteId,
      siteName: sites.name,
      siteAddress: sites.address,
      activityTypeId: events.activityTypeId,
      activityTypeName: activityTypes.name,
      communityPartnerId: events.communityPartnerId,
      communityPartnerName: communityPartners.name,
    })
    .from(events)
    .leftJoin(users, eq(events.userId, users.id))
    .leftJoin(sites, eq(events.siteId, sites.id))
    .leftJoin(activityTypes, eq(events.activityTypeId, activityTypes.id))
    .leftJoin(
      communityPartners,
      eq(events.communityPartnerId, communityPartners.id)
    )
    .where(eq(events.id, eventId))
    .limit(1);

  return event;
}

const hm = (minutes: number) =>
  `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m`;
const money = (n: number) => `$${n.toFixed(2)}`;

const surfaceCardClass =
  'gap-0 rounded-(--radius-card) border-(--border-default) bg-(--surface-card) shadow-(--shadow-card)';
// Same KPI tile the site and distribution detail pages use.
const kpiTileClass =
  'gap-0 rounded-(--radius-card) border-(--border-default) border-l-4 border-l-(--surface-chrome) bg-(--surface-card) px-[18px] pt-3.5 pb-4 shadow-(--shadow-card)';
const primaryButtonClass =
  'h-auto rounded-(--radius-control) bg-(--action-primary) px-[18px] py-[9px] text-[15px] font-normal text-(--text-on-chrome) shadow-none hover:bg-(--action-primary-hover)';
const outlineButtonClass =
  'h-auto rounded-(--radius-control) border-(--action-primary) bg-(--surface-card) px-[18px] py-[9px] text-[15px] font-normal text-(--action-primary) shadow-none hover:bg-(--action-selected) hover:text-(--action-primary)';

export default async function EventPage({ params }: EventPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const { id } = await params;
  const event = await getEvent(id);

  if (!event) {
    notFound();
  }

  const isAdmin = session.user?.role === 'admin';
  const totalParticipants = event.newParticipants + event.returningParticipants;
  const costPerParticipant =
    totalParticipants > 0 ? parseFloat(event.totalCost) / totalParticipants : 0;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const totalCost = parseFloat(event.totalCost);
  const organizerInitials = event.userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2);
  const costNote = totalCost > 0 ? 'Supplies and materials' : 'No expenses recorded';

  const kpis = [
    {
      label: 'Participants',
      value: String(totalParticipants),
      note: `${event.newParticipants} new · ${event.returningParticipants} returning`,
    },
    {
      label: 'Event time',
      value: hm(event.eventDuration),
      note: 'On site',
    },
    {
      label: 'Admin time',
      value: hm(event.adminDuration),
      note: 'Setup, cleanup, reporting',
    },
    {
      label: 'Total cost',
      value: money(totalCost),
      note: costNote,
    },
    {
      label: 'Cost per participant',
      value: money(costPerParticipant),
      note: 'Total cost ÷ participants',
    },
  ];

  return (
    <div className="min-h-screen bg-(--surface-page) px-6 pt-6 pb-11">
      <div className="mx-auto max-w-[1180px]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[28px] leading-tight font-bold tracking-[-.2px]">
              {event.title}
            </h1>
            <p className="mt-1.5 text-[15px] text-(--text-muted)">
              {formatDate(event.eventDate)} · {event.siteName}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2.5">
            <DuplicateEventDialog
              eventId={event.id}
              eventTitle={event.title}
              trigger={
                <Button variant="outline" className={outlineButtonClass}>
                  <Copy className="h-4 w-4" />
                  Duplicate
                </Button>
              }
            />
            {isAdmin && (
              <Button asChild className={primaryButtonClass}>
                <Link href={`/admin/events/${event.id}/edit`}>
                  <Edit className="h-4 w-4" />
                  Edit
                </Link>
              </Button>
            )}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
          {kpis.map(kpi => (
            <Card key={kpi.label} className={kpiTileClass}>
              <div className="text-[11.5px] font-semibold tracking-[.5px] text-(--text-muted) uppercase">
                {kpi.label}
              </div>
              <div className="mt-1.5 text-[30px] leading-[1.1] font-bold text-(--surface-chrome)">
                {kpi.value}
              </div>
              <div className="mt-1 text-[12.5px] text-(--text-muted)">
                {kpi.note}
              </div>
            </Card>
          ))}
        </div>

        <Card className={cn(surfaceCardClass, 'mt-5 grid grid-cols-1 gap-8 p-8 md:grid-cols-[180px_1fr_1.1fr]')}>
          <div>
            <span className="grid size-[72px] place-items-center rounded-(--radius-control) bg-(--surface-chrome) text-(--text-on-chrome)">
              <Calendar size={34} />
            </span>
          </div>

          <div>
            <ProfileField label="Date">{formatDate(event.eventDate)}</ProfileField>
            <ProfileField label="Site">
              <Link
                href={`/sites/${event.siteId}`}
                className="text-(--action-primary) hover:text-(--action-primary-hover) hover:underline"
              >
                {event.siteName}
              </Link>
            </ProfileField>
            <ProfileField label="Address">{event.siteAddress}</ProfileField>
            <ProfileField label="Activity Type">{event.activityTypeName}</ProfileField>
          </div>

          <div>
            <ProfileField label="Community Partner">
              {event.hasCoHost && event.communityPartnerName
                ? event.communityPartnerName
                : 'None'}
            </ProfileField>
            <ProfileField label="Youth Focused">
              {event.eventIsYouthFocused ? 'Yes' : 'No'}
            </ProfileField>
            <div>
              <div className="mb-2 text-base font-bold">Logged By</div>
              <div className="flex items-start gap-3">
                <AvatarTile initials={organizerInitials ?? ''} size={44} />
                <div className="min-w-0">
                  <Link
                    href={`/users/${event.userId}`}
                    className="text-[14.5px] font-bold text-(--text-body) hover:text-(--action-primary) hover:underline"
                  >
                    {event.userName}
                  </Link>
                  {event.userJobTitle && (
                    <div className="mt-0.5 text-[12.5px] text-(--text-muted)">
                      {event.userJobTitle}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className={cn(surfaceCardClass, 'mt-5 px-6 pt-[18px] pb-3.5')}>
          <div className="text-[17px] font-bold">What Happened</div>
          <p className="mt-2 text-[15px] leading-[1.6] text-(--text-body) [text-wrap:pretty]">
            {event.description}
          </p>
        </Card>

      </div>
    </div>
  );
}

export async function generateMetadata({ params }: EventPageProps) {
  const { id } = await params;
  const event = await getEvent(id);

  if (!event) {
    return {
      title: 'Event Not Found',
    };
  }

  return {
    title: `${event.title} - Event Details`,
    description: `View details for ${event.title} scheduled for ${new Date(event.eventDate).toLocaleDateString()}`,
  };
}
