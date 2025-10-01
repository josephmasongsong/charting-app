// app/events/[id]/page.tsx
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Activity,
  DollarSign,
  Building,
  UserCheck,
  ArrowLeft,
  Edit,
  Trash2,
  Target,
} from 'lucide-react';
import Link from 'next/link';

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

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/events">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {event.title}
              </h1>
              <p className="text-muted-foreground">
                Event details and information
              </p>
            </div>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <Link href={`/admin/events/${event.id}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-sm">
            <Activity className="h-3 w-3 mr-1" />
            {event.activityTypeName}
          </Badge>
          <Badge variant="outline" className="text-sm">
            <Target className="h-3 w-3 mr-1" />
            {event.programGoalName}
          </Badge>
          {event.eventIsYouthFocused && (
            <Badge variant="secondary" className="text-sm">
              Youth-Focused
            </Badge>
          )}
          {event.hasCoHost && (
            <Badge variant="secondary" className="text-sm">
              Co-hosted
            </Badge>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-2xl font-bold">{totalParticipants}</div>
                  <div className="text-xs text-muted-foreground">
                    Total Participants
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    {event.eventDuration}m
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Event Duration
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    ${parseFloat(event.totalCost).toFixed(0)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Total Cost
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    ${costPerParticipant.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Cost/Participant
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                  <Target className="h-5 w-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Primary Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Event Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Date
                  </div>
                  <div className="font-semibold">
                    {formatDate(event.eventDate)}
                  </div>
                </div>

                <div className="h-px bg-border"></div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Description
                  </div>
                  <p className="text-sm leading-relaxed">{event.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Participation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Participation Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <div className="text-2xl font-bold">
                      {totalParticipants}
                    </div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <div className="text-2xl font-bold text-orange-600">
                      {event.newParticipants}
                    </div>
                    <div className="text-xs text-muted-foreground">New</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <div className="text-2xl font-bold text-blue-600">
                      {event.returningParticipants}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Returning
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">New Participants</span>
                    <span className="text-muted-foreground">
                      {totalParticipants > 0
                        ? (
                            (event.newParticipants / totalParticipants) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 rounded-full"
                      style={{
                        width: `${totalParticipants > 0 ? (event.newParticipants / totalParticipants) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Returning Participants</span>
                    <span className="text-muted-foreground">
                      {totalParticipants > 0
                        ? (
                            (event.returningParticipants / totalParticipants) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: `${totalParticipants > 0 ? (event.returningParticipants / totalParticipants) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Time Allocation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Time Allocation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <div className="text-2xl font-bold">{totalTime}m</div>
                    <div className="text-xs text-muted-foreground">
                      Total Time
                    </div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <div className="text-2xl font-bold text-green-600">
                      {event.eventDuration}m
                    </div>
                    <div className="text-xs text-muted-foreground">Event</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <div className="text-2xl font-bold text-orange-600">
                      {event.adminDuration}m
                    </div>
                    <div className="text-xs text-muted-foreground">Admin</div>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Event to Admin Ratio</span>
                    <Badge variant="outline">
                      {event.adminDuration > 0
                        ? (event.eventDuration / event.adminDuration).toFixed(1)
                        : event.eventDuration}
                      :1
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Secondary Info */}
          <div className="space-y-6">
            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Site
                  </div>
                  <div className="font-semibold">{event.siteName}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Address
                  </div>
                  <div className="text-sm">{event.siteAddress}</div>
                </div>
              </CardContent>
            </Card>

            {/* Organizer */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Organizer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                    {event.userName
                      .split(' ')
                      .map(n => n[0])
                      .join('')}
                  </div>
                  <div>
                    <div className="font-semibold">{event.userName}</div>
                    <div className="text-sm text-muted-foreground">
                      {event.userEmail}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Community Partner */}
            {event.hasCoHost && event.communityPartnerName && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Community Partner
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline" className="text-sm">
                    {event.communityPartnerName}
                  </Badge>
                </CardContent>
              </Card>
            )}

            {/* Financial Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Total Cost
                  </span>
                  <span className="font-semibold">
                    ${parseFloat(event.totalCost).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Cost per Participant
                  </span>
                  <span className="font-semibold">
                    ${costPerParticipant.toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{formatDateTime(String(event.createdAt))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span>{formatDateTime(String(event.updatedAt))}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
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
