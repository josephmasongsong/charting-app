import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Activity,
  DollarSign,
  User,
  Mail,
  Building,
  UserCheck,
  Check,
  X,
} from 'lucide-react';
import BackButton from '@/components/BackButton';
import EditButton from './components/EditButton';
import { minutesToHumanReadable } from '@/app/lib/validations/events';

interface EventPageProps {
  params: {
    id: string;
  };
}

// Server function to fetch event data
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
      // Related data
      userId: events.userId,
      userName:
        sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`.as(
          'userName'
        ),
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

// Server Component for boolean display
function BooleanDisplay({
  value,
  trueText,
  falseText,
}: {
  value: boolean;
  trueText: string;
  falseText: string;
}) {
  return (
    <Badge
      variant={value ? 'default' : 'secondary'}
      className="flex items-center gap-1 w-fit"
    >
      {value ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      {value ? trueText : falseText}
    </Badge>
  );
}

export default async function EventPage({ params }: EventPageProps) {
  const session = await getServerSession(authOptions);

  // Redirect unauthenticated users to login
  if (!session) {
    redirect('/login');
  }

  // Fetch event data on the server
  const event = await getEvent(params.id);

  // Return 404 if event not found
  if (!event) {
    notFound();
  }

  // Check if current user is admin
  const isAdmin = session.user?.role === 'admin';

  // Calculate total participants
  const totalParticipants = event.newParticipants + event.returningParticipants;

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-3xl font-bold">{event.title}</h1>
            <p className="text-muted-foreground">Event Details</p>
          </div>
        </div>

        {isAdmin && <EditButton eventId={event.id} />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Event Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">
                  Title
                </h3>
                <p className="text-lg font-medium">{event.title}</p>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">
                  Date
                </h3>
                <p className="text-sm">
                  {new Date(event.eventDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-2">
                  Description
                </h3>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Event Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Event Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">
                    Event Duration
                  </h3>
                  <p className="text-sm font-medium">
                    {minutesToHumanReadable(event.eventDuration)}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">
                    Admin Duration
                  </h3>
                  <p className="text-sm font-medium">
                    {minutesToHumanReadable(event.adminDuration)}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-2">
                    Participants
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Total: {totalParticipants}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>New: {event.newParticipants}</div>
                      <div>Returning: {event.returningParticipants}</div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-2">
                    Cost
                  </h3>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-lg font-semibold">
                      ${event.totalCost}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-2">
                  Event Type
                </h3>
                <BooleanDisplay
                  value={event.eventIsYouthFocused}
                  trueText="Youth-Focused Event"
                  falseText="General Event"
                />
              </div>
            </CardContent>
          </Card>

          {/* Location & Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location & Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">
                  Site
                </h3>
                <p className="font-medium">{event.siteName}</p>
                <p className="text-sm text-muted-foreground">
                  {event.siteAddress}
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-2">
                  Activity Type
                </h3>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{event.activityTypeName}</span>
                </div>
                <Badge variant="outline" className="mt-1">
                  {event.programGoalName}
                </Badge>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-2">
                  Co-Host
                </h3>
                {event.hasCoHost && event.communityPartnerName ? (
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="default">
                      {event.communityPartnerName}
                    </Badge>
                  </div>
                ) : (
                  <BooleanDisplay
                    value={false}
                    trueText="Has Co-Host"
                    falseText="No Co-Host"
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Event Organizer */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Event Organizer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">
                  Name
                </h3>
                <p className="font-medium">{event.userName}</p>
              </div>

              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">
                  Email
                </h3>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`mailto:${event.userEmail}`}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    {event.userEmail}
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Event Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {totalParticipants}
                  </div>
                  <div className="text-xs text-blue-600">
                    Total Participants
                  </div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {minutesToHumanReadable(event.eventDuration)}
                  </div>
                  <div className="text-xs text-green-600">Event Duration</div>
                </div>
              </div>

              <div className="p-3 bg-orange-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-600">
                  ${event.totalCost}
                </div>
                <div className="text-xs text-orange-600">Total Cost</div>
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">
                  Created
                </h3>
                <p className="text-sm">
                  {new Date(event.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">
                  Last Updated
                </h3>
                <p className="text-sm">
                  {new Date(event.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <EditButton
                  eventId={event.id}
                  variant="outline"
                  className="w-full justify-start"
                />
                <BackButton
                  href="/admin/events"
                  variant="outline"
                  className="w-full justify-start"
                  text="Back to Admin"
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: EventPageProps) {
  const event = await getEvent(params.id);

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
