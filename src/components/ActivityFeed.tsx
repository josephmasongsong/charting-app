'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  CalendarDays,
  MapPin,
  Users,
  Target,
  Building,
  UserPlus,
  Mail,
  Clock,
} from 'lucide-react';
import { useActivityFeed } from '@/hooks/useActivityFeed';

// Types
type ActivityType =
  | 'user_invited'
  | 'event_created'
  | 'activity_type_created'
  | 'site_created'
  | 'community_partner_added'
  | 'program_goal_created';

interface User {
  firstName: string;
  lastName: string;
}

interface UserInvitedDetails {
  invitedUser: string;
  role: string;
}

interface EventCreatedDetails {
  eventTitle: string;
  siteName: string;
  totalParticipants: number;
  isYouthFocused: boolean;
  hasCoHost?: boolean;
}

interface ActivityTypeCreatedDetails {
  activityTypeName: string;
  programGoal: string;
}

interface SiteCreatedDetails {
  siteName: string;
  tenantCount: number;
}

interface CommunityPartnerAddedDetails {
  partnerName: string;
  siteName: string;
}

interface ProgramGoalCreatedDetails {
  programGoalName: string;
}

type ActivityDetails =
  | UserInvitedDetails
  | EventCreatedDetails
  | ActivityTypeCreatedDetails
  | SiteCreatedDetails
  | CommunityPartnerAddedDetails
  | ProgramGoalCreatedDetails;

interface Activity {
  id: number;
  type: ActivityType;
  user: User;
  timestamp: string;
  details: ActivityDetails;
}

// type Props = { activities: Activity[] };

const ActivityFeed: React.FC = () => {
  // const activities: Activity[] = [
  //   {
  //     id: 1,
  //     type: 'user_invited',
  //     user: { firstName: 'Admin', lastName: 'User' },
  //     timestamp: '30 minutes ago',
  //     details: {
  //       invitedUser: 'jennifer.martinez@email.com',
  //       role: 'Site Coordinator',
  //     } as UserInvitedDetails,
  //   },
  //   {
  //     id: 2,
  //     type: 'event_created',
  //     user: { firstName: 'Sarah', lastName: 'Chen' },
  //     timestamp: '2 hours ago',
  //     details: {
  //       eventTitle: 'Art Therapy Workshop',
  //       siteName: 'Riverside Gardens',
  //       totalParticipants: 18,
  //       isYouthFocused: false,
  //     } as EventCreatedDetails,
  //   },
  //   {
  //     id: 3,
  //     type: 'activity_type_created',
  //     user: { firstName: 'Michael', lastName: 'Roberts' },
  //     timestamp: '4 hours ago',
  //     details: {
  //       activityTypeName: 'Digital Photography',
  //       programGoal: 'Creative Arts',
  //     } as ActivityTypeCreatedDetails,
  //   },
  //   {
  //     id: 4,
  //     type: 'site_created',
  //     user: { firstName: 'Lisa', lastName: 'Wong' },
  //     timestamp: '6 hours ago',
  //     details: {
  //       siteName: 'Harmony Heights',
  //       tenantCount: 62,
  //     } as SiteCreatedDetails,
  //   },
  //   {
  //     id: 5,
  //     type: 'community_partner_added',
  //     user: { firstName: 'James', lastName: 'Kim' },
  //     timestamp: '1 day ago',
  //     details: {
  //       partnerName: 'Local Arts Council',
  //       siteName: 'Sunset Manor',
  //     } as CommunityPartnerAddedDetails,
  //   },
  //   {
  //     id: 6,
  //     type: 'event_created',
  //     user: { firstName: 'Emma', lastName: 'Taylor' },
  //     timestamp: '1 day ago',
  //     details: {
  //       eventTitle: 'Youth Gaming Tournament',
  //       siteName: 'Metro Plaza',
  //       totalParticipants: 24,
  //       isYouthFocused: true,
  //       hasCoHost: true,
  //     } as EventCreatedDetails,
  //   },
  //   {
  //     id: 7,
  //     type: 'program_goal_created',
  //     user: { firstName: 'David', lastName: 'Miller' },
  //     timestamp: '2 days ago',
  //     details: {
  //       programGoalName: 'Mental Health & Wellness',
  //     } as ProgramGoalCreatedDetails,
  //   },
  // ];

  const { activities } = useActivityFeed();

  const getActivityIcon = (type: ActivityType): React.ReactNode => {
    const icons: Record<ActivityType, React.ReactNode> = {
      user_invited: <Mail className="h-4 w-4" />,
      event_created: <CalendarDays className="h-4 w-4" />,
      activity_type_created: <Target className="h-4 w-4" />,
      site_created: <Building className="h-4 w-4" />,
      community_partner_added: <Users className="h-4 w-4" />,
      program_goal_created: <Target className="h-4 w-4" />,
    };
    return icons[type] || <CalendarDays className="h-4 w-4" />;
  };

  const renderActivityContent = (activity: Activity): React.ReactNode => {
    const { type, user, details } = activity;
    const userName = `${user.firstName} ${user.lastName}`;

    switch (type) {
      case 'user_invited': {
        const userDetails = details as UserInvitedDetails;
        return (
          <div>
            <p className="text-sm text-gray-900">
              <span className="font-medium">{userName}</span> invited{' '}
              <span className="font-medium text-blue-600">
                {userDetails.invitedUser}
              </span>{' '}
              as {userDetails.role}
            </p>
          </div>
        );
      }

      case 'event_created': {
        const eventDetails = details as EventCreatedDetails;
        return (
          <div>
            <p className="text-sm text-gray-900">
              <span className="font-medium">{userName}</span> held an event{' '}
              <span className="font-medium text-blue-600">
                {eventDetails.eventTitle}
              </span>{' '}
              at <span className="font-medium">{eventDetails.siteName}</span>
            </p>
            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {eventDetails.totalParticipants} participants
              </span>
            </div>
          </div>
        );
      }

      case 'activity_type_created': {
        const activityTypeDetails = details as ActivityTypeCreatedDetails;
        return (
          <div>
            <p className="text-sm text-gray-900">
              <span className="font-medium">{userName}</span> created activity
              type{' '}
              <span className="font-medium text-green-600">
                {activityTypeDetails.activityTypeName}
              </span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Under: {activityTypeDetails.programGoal}
            </p>
          </div>
        );
      }

      case 'site_created': {
        const siteDetails = details as SiteCreatedDetails;
        return (
          <div>
            <p className="text-sm text-gray-900">
              <span className="font-medium">{userName}</span> created site{' '}
              <span className="font-medium text-purple-600">
                {siteDetails.siteName}
              </span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {siteDetails.tenantCount} tenants
            </p>
          </div>
        );
      }

      case 'community_partner_added': {
        const partnerDetails = details as CommunityPartnerAddedDetails;
        return (
          <div>
            <p className="text-sm text-gray-900">
              <span className="font-medium">{userName}</span> added partner{' '}
              <span className="font-medium text-orange-600">
                {partnerDetails.name}
              </span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              At: {partnerDetails.siteName}
            </p>
          </div>
        );
      }

      case 'program_goal_created': {
        const goalDetails = details as ProgramGoalCreatedDetails;
        return (
          <div>
            <p className="text-sm text-gray-900">
              <span className="font-medium">{userName}</span> created program
              goal{' '}
              <span className="font-medium text-indigo-600">
                {goalDetails.programGoalName}
              </span>
            </p>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-1">
          {activities.map((activity: Activity) => {
            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0 mt-0.5">
                  <div className="p-2 rounded-full bg-gray-100">
                    {getActivityIcon(activity.type)}
                  </div>
                </div>

                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-gray-400">
                      {activity.timestamp}
                    </span>
                  </div>

                  {renderActivityContent(activity)}
                </div>

                <div className="flex-shrink-0">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs bg-gray-100">
                      {activity.user.firstName[0]}
                      {activity.user.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t text-center">
          <button className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors">
            Load More Activity
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
