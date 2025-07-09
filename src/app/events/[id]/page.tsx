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
  Mail,
  Building,
  UserCheck,
  Check,
  X,
  ArrowLeft,
  Edit3,
  CalendarDays,
  Timer,
  FileText,
  Settings,
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

export default async function EventPage({ params }: EventPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const event = await getEvent(params.id);

  if (!event) {
    notFound();
  }

  const isAdmin = session.user?.role === 'admin';
  const totalParticipants = event.newParticipants + event.returningParticipants;

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <BackButton className="p-2 hover:bg-gray-100 rounded-lg transition-colors" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {event.title}
                </h1>
                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <CalendarDays className="h-4 w-4" />
                    <span>
                      {new Date(event.eventDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Timer className="h-4 w-4" />
                    <span>{minutesToHumanReadable(event.eventDuration)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <Badge
                      variant={
                        event.eventIsYouthFocused ? 'default' : 'secondary'
                      }
                      className="text-xs"
                    >
                      {event.eventIsYouthFocused ? 'Youth-Focused' : 'General'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            {isAdmin && <EditButton eventId={event.id} />}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Participants
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {totalParticipants}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {event.newParticipants} new, {event.returningParticipants}{' '}
                  returning
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Cost</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ${event.totalCost}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Duration</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {minutesToHumanReadable(event.eventDuration)}
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Admin Time</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {minutesToHumanReadable(event.adminDuration)}
                </p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <Timer className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <FileText className="h-5 w-5 text-emerald-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Description
                </h2>
              </div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {event.description}
              </p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Location */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-red-50 rounded-lg">
                    <MapPin className="h-5 w-5 text-red-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Location
                  </h2>
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">{event.siteName}</p>
                  <p className="text-sm text-gray-600">{event.siteAddress}</p>
                </div>
              </div>

              {/* Activity */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <Activity className="h-5 w-5 text-indigo-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Activity
                  </h2>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-gray-900">
                      {event.activityTypeName}
                    </p>
                    <Badge variant="outline" className="mt-1">
                      {event.programGoalName}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Partnership */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm md:col-span-2">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-teal-50 rounded-lg">
                    <Building className="h-5 w-5 text-teal-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Partnership
                  </h2>
                </div>
                {event.hasCoHost && event.communityPartnerName ? (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Co-hosted with</p>
                    <p className="font-medium text-gray-900">
                      {event.communityPartnerName}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-600">No partnership for this event</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Organizer */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <UserCheck className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Organizer
                </h2>
              </div>
              <div className="space-y-3">
                <p className="font-medium text-gray-900">{event.userName}</p>
                <a
                  href={`mailto:${event.userEmail}`}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">{event.userEmail}</span>
                </a>
              </div>
            </div>

            {/* Event Date */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-gray-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Event Date
                </h2>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Scheduled Date
                  </p>
                  <p className="text-sm text-gray-900">
                    {new Date(event.eventDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Last Updated
                  </p>
                  <p className="text-sm text-gray-900">
                    {new Date(event.updatedAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            {isAdmin && (
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <Settings className="h-5 w-5 text-slate-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Actions
                  </h2>
                </div>
                <div className="space-y-3">
                  <EditButton
                    eventId={event.id}
                    className="w-full justify-start"
                  />
                  <BackButton
                    href="/admin/events"
                    variant="outline"
                    className="w-full justify-start"
                    text="Back to Events"
                  />
                </div>
              </div>
            )}
          </div>
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
