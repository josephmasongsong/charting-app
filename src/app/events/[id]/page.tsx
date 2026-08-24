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
  programGoals,
} from '@/db';
import { eq, sql } from 'drizzle-orm';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProfileField } from '@/components/ui/profile-field';
import { DataTable } from '@/components/ui/data-table';
import { Calendar, Edit, Copy } from 'lucide-react';
import Link from 'next/link';
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
      userEmail: users.email,
      siteId: events.siteId,
      siteName: sites.name,
      siteAddress: sites.address,
      activityTypeId: events.activityTypeId,
      activityTypeName: activityTypes.name,
      programGoalName: programGoals.name,
      communityPartnerId: events.communityPartnerId,
      communityPartnerName: communityPartners.name,
    })
    .from(events)
    .leftJoin(users, eq(events.userId, users.id))
    .leftJoin(sites, eq(events.siteId, sites.id))
    .leftJoin(activityTypes, eq(events.activityTypeId, activityTypes.id))
    .leftJoin(programGoals, eq(activityTypes.programGoalId, programGoals.id))
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
const kpiTileClass =
  'gap-0 rounded-(--radius-card) border-(--border-default) border-l-4 border-l-(--surface-chrome) bg-(--surface-card) px-[18px] pt-3.5 pb-4 shadow-(--shadow-card)';
const primaryButtonClass =
  'h-auto rounded-(--radius-control) bg-(--action-primary) px-[18px] py-[9px] text-[15px] font-normal text-(--text-on-chrome) shadow-none hover:bg-(--action-primary-hover)';
const outlineButtonClass =
  'h-auto rounded-(--radius-control) border-(--action-primary) bg-(--surface-card) px-[18px] py-[9px] text-[15px] font-normal text-(--action-primary) shadow-none hover:bg-(--action-selected) hover:text-(--action-primary)';
const progressTrackClass = 'h-3.5 overflow-hidden rounded-full bg-(--bch-gray-200)';

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
  const totalTime = event.eventDuration + event.adminDuration;
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
  const pct = (value: number) =>
    totalParticipants > 0 ? ((value / totalParticipants) * 100).toFixed(1) : 0;
  const newShare = totalParticipants > 0 ? (event.newParticipants / totalParticipants) * 100 : 0;
  const returningShare =
    totalParticipants > 0 ? (event.returningParticipants / totalParticipants) * 100 : 0;
  const ratio =
    event.adminDuration > 0
      ? (event.eventDuration / event.adminDuration).toFixed(1)
      : event.eventDuration;
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
    { label: 'Event time', value: hm(event.eventDuration), note: 'On site' },
    { label: 'Admin time', value: hm(event.adminDuration), note: 'Setup, cleanup, reporting' },
    { label: 'Total cost', value: money(totalCost), note: costNote },
  ];

  const figureRows = [
    { measure: 'New participants', value: event.newParticipants, detail: `${pct(event.newParticipants)}% of attendance` },
    { measure: 'Returning participants', value: event.returningParticipants, detail: `${pct(event.returningParticipants)}% of attendance` },
    { measure: 'Event duration', value: hm(event.eventDuration), detail: `${event.eventDuration} minutes on site` },
    { measure: 'Admin time', value: hm(event.adminDuration), detail: 'Setup, cleanup, and reporting' },
    { measure: 'Event to admin ratio', value: `${ratio}:1`, detail: 'Event minutes per admin minute' },
    { measure: 'Total cost', value: money(totalCost), detail: costNote },
    { measure: 'Cost per participant', value: money(costPerParticipant), detail: 'Total cost ÷ participants' },
  ];

  return (
    <div className="min-h-screen bg-(--surface-page) px-6 pt-6 pb-11">
      <div className="mx-auto max-w-[1180px]">
        <div className="flex flex-wrap items-center justify-end gap-2.5">
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

        <h1 className="mt-4 text-[28px] leading-tight font-bold tracking-[-.2px]">
          {event.title}
        </h1>

        <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
          {kpis.map(kpi => (
            <Card key={kpi.label} className={kpiTileClass}>
              <div className="text-[11.5px] font-semibold tracking-[.5px] text-(--text-muted) uppercase">
                {kpi.label}
              </div>
              <div className="mt-1.5 text-[30px] leading-[1.1] font-bold text-(--surface-chrome)">
                {kpi.value}
              </div>
              <div className="mt-1 text-[12.5px] text-(--text-muted)">{kpi.note}</div>
            </Card>
          ))}
        </div>

        <Card className={cn(surfaceCardClass, 'mt-5 grid grid-cols-1 gap-7 p-8 md:grid-cols-[120px_1fr_1fr]')}>
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
            <ProfileField label="Program Goal">{event.programGoalName}</ProfileField>
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
                <div className="grid size-11 shrink-0 place-items-center rounded-(--radius-avatar) bg-[linear-gradient(160deg,#8FA6B5,#6B8496)] text-sm font-bold text-white">
                  {organizerInitials}
                </div>
                <div className="min-w-0">
                  {/* TODO: /events/[id] — not wired: the template links the
                      organizer to a user profile; no /users/[id] route exists. */}
                  <div className="text-[14.5px] font-bold">{event.userName}</div>
                  <div className="mt-0.5 text-[12.5px] text-(--text-muted)">
                    {event.userEmail}
                  </div>
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

        <Card className={cn(surfaceCardClass, 'mt-5 overflow-hidden')}>
          <div className="flex items-baseline justify-between gap-4 px-6 pt-[18px] pb-3.5">
            <div className="text-[17px] font-bold">Reported Figures</div>
            {/* TODO: /events/[id] — not wired: no per-event export exists. */}
            <button
              type="button"
              disabled
              className="shrink-0 text-[13.5px] text-(--action-primary) opacity-60"
            >
              Export CSV
            </button>
          </div>

          <div className="flex flex-col gap-3 px-6 pb-5">
            <div>
              <div className="mb-1.5 flex justify-between text-[13.5px]">
                <span className="font-semibold">New Participants</span>
                <span className="text-(--text-muted)">{pct(event.newParticipants)}%</span>
              </div>
              <div className={progressTrackClass}>
                <div className="h-full bg-(--bch-seafoam)" style={{ width: `${newShare}%` }} />
              </div>
            </div>
            <div>
              <div className="mb-1.5 flex justify-between text-[13.5px]">
                <span className="font-semibold">Returning Participants</span>
                <span className="text-(--text-muted)">
                  {pct(event.returningParticipants)}%
                </span>
              </div>
              <div className={progressTrackClass}>
                <div className="h-full bg-(--bch-sky-400)" style={{ width: `${returningShare}%` }} />
              </div>
            </div>
          </div>

          <div className="px-6 pb-6">
            <DataTable
              columns={[
                { key: 'measure', label: 'Measure' },
                { key: 'value', label: 'Reported', num: true },
                { key: 'detail', label: 'Detail' },
              ]}
              rows={figureRows}
              footer={{
                measure: 'Totals',
                value: `${totalParticipants} participants`,
                detail: `${hm(totalTime)} staff time · ${money(totalCost)}`,
              }}
            />
          </div>
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
