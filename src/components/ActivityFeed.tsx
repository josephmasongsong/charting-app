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
  Package,
  PackagePlus,
  PackageMinus,
  PackageCheck,
} from 'lucide-react';
import { useActivityFeed } from '@/hooks/useActivityFeed';

// Types
type ActivityType =
  | 'user_invited'
  | 'event_created'
  | 'activity_type_created'
  | 'site_created'
  | 'community_partner_added'
  | 'program_goal_created'
  | 'supply_created'
  | 'supplies_added_to_site'
  | 'supplies_removed_from_site'
  | 'site_supply_updated';

interface User {
  firstName: string;
  lastName: string;
}

interface UserInvitedDetails {
  invitedEmail: string;
  title: string;
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

interface SupplyCreatedDetails {
  supplyName: string;
  costPerUnit: string;
  quantity: number;
}

interface SuppliesAddedToSiteDetails {
  siteName: string;
  supplies: Array<{
    name: string;
    quantity: number;
    costPerUnit: string;
  }>;
  totalItems: number;
}

interface SuppliesRemovedFromSiteDetails {
  siteName: string;
  supplies: Array<{
    name: string;
    quantity: number;
    costPerUnit: string;
  }>;
  totalItems: number;
}

interface SiteSupplyUpdatedDetails {
  siteName: string;
  supplyName: string;
  oldQuantity: number;
  newQuantity: number;
  quantityChange: number;
  costPerUnit: string;
}

type ActivityDetails =
  | UserInvitedDetails
  | EventCreatedDetails
  | ActivityTypeCreatedDetails
  | SiteCreatedDetails
  | CommunityPartnerAddedDetails
  | ProgramGoalCreatedDetails
  | SupplyCreatedDetails
  | SuppliesAddedToSiteDetails
  | SuppliesRemovedFromSiteDetails
  | SiteSupplyUpdatedDetails;

interface Activity {
  id: number;
  type: ActivityType;
  user: User;
  timestamp: string;
  details: ActivityDetails;
}

const ActivityFeed: React.FC = () => {
  const { activities } = useActivityFeed();

  const getActivityIcon = (type: ActivityType): React.ReactNode => {
    const icons: Record<ActivityType, React.ReactNode> = {
      user_invited: <Mail className="h-4 w-4" />,
      event_created: <CalendarDays className="h-4 w-4" />,
      activity_type_created: <Target className="h-4 w-4" />,
      site_created: <Building className="h-4 w-4" />,
      community_partner_added: <Users className="h-4 w-4" />,
      program_goal_created: <Target className="h-4 w-4" />,
      supply_created: <Package className="h-4 w-4" />,
      supplies_added_to_site: <PackagePlus className="h-4 w-4" />,
      supplies_removed_from_site: <PackageMinus className="h-4 w-4" />,
      site_supply_updated: <PackageCheck className="h-4 w-4" />,
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
                {userDetails.invitedEmail}
              </span>{' '}
              as {userDetails.title}
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
                {partnerDetails.partnerName}
              </span>
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

      case 'supply_created': {
        const supplyDetails = details as SupplyCreatedDetails;
        return (
          <div>
            <p className="text-sm text-gray-900">
              <span className="font-medium">{userName}</span> added supply{' '}
              <span className="font-medium text-emerald-600">
                {supplyDetails.supplyName}
              </span>
            </p>
            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Package className="h-3 w-3" />
                {supplyDetails.quantity} units
              </span>
              <span>${supplyDetails.costPerUnit} per unit</span>
            </div>
          </div>
        );
      }

      case 'supplies_added_to_site': {
        const siteSupplyDetails = details as SuppliesAddedToSiteDetails;
        return (
          <div>
            <p className="text-sm text-gray-900">
              <span className="font-medium">{userName}</span> added{' '}
              <span className="font-medium text-green-600">
                {siteSupplyDetails.totalItems} supply item
                {siteSupplyDetails.totalItems !== 1 ? 's' : ''}
              </span>{' '}
              to{' '}
              <span className="font-medium">{siteSupplyDetails.siteName}</span>
            </p>
            <div className="mt-1 text-xs text-gray-500">
              {siteSupplyDetails.supplies.slice(0, 2).map((supply, index) => (
                <span key={index} className="block">
                  {supply.name}: {supply.quantity} units
                </span>
              ))}
              {siteSupplyDetails.supplies.length > 2 && (
                <span className="text-gray-400">
                  +{siteSupplyDetails.supplies.length - 2} more items
                </span>
              )}
            </div>
          </div>
        );
      }

      case 'supplies_removed_from_site': {
        const siteSupplyDetails = details as SuppliesRemovedFromSiteDetails;
        return (
          <div>
            <p className="text-sm text-gray-900">
              <span className="font-medium">{userName}</span> removed{' '}
              <span className="font-medium text-red-600">
                {siteSupplyDetails.totalItems} supply item
                {siteSupplyDetails.totalItems !== 1 ? 's' : ''}
              </span>{' '}
              from{' '}
              <span className="font-medium">{siteSupplyDetails.siteName}</span>
            </p>
            <div className="mt-1 text-xs text-gray-500">
              {siteSupplyDetails.supplies.slice(0, 2).map((supply, index) => (
                <span key={index} className="block">
                  {supply.name}: {supply.quantity} units
                </span>
              ))}
              {siteSupplyDetails.supplies.length > 2 && (
                <span className="text-gray-400">
                  +{siteSupplyDetails.supplies.length - 2} more items
                </span>
              )}
            </div>
          </div>
        );
      }

      case 'site_supply_updated': {
        const updateDetails = details as SiteSupplyUpdatedDetails;
        const isIncrease = updateDetails.quantityChange > 0;
        return (
          <div>
            <p className="text-sm text-gray-900">
              <span className="font-medium">{userName}</span> updated{' '}
              <span className="font-medium text-blue-600">
                {updateDetails.supplyName}
              </span>{' '}
              quantity at{' '}
              <span className="font-medium">{updateDetails.siteName}</span>
            </p>
            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <PackageCheck className="h-3 w-3" />
                {updateDetails.oldQuantity} → {updateDetails.newQuantity} units
              </span>
              <span className={isIncrease ? 'text-green-600' : 'text-red-600'}>
                {isIncrease ? '+' : ''}
                {updateDetails.quantityChange}
              </span>
            </div>
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
