// src/components/ActivityFeed.tsx
'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { useActivityFeed } from '@/hooks/useActivityFeed';

// Types
type ActivityType =
  | 'user_invited'
  | 'event_created'
  | 'event_updated'
  | 'event_deleted'
  | 'activity_type_created'
  | 'activity_type_updated'
  | 'activity_type_deleted'
  | 'site_created'
  | 'site_updated'
  | 'site_deleted'
  | 'community_partner_added'
  | 'community_partner_updated'
  | 'community_partner_deleted'
  | 'program_goal_created'
  | 'program_goal_updated'
  | 'program_goal_deleted'
  | 'supply_created'
  | 'supply_updated'
  | 'supply_deleted'
  | 'supplies_added_to_site'
  | 'supplies_removed_from_site'
  | 'site_supply_updated'
  | 'supply_distribution_logged'
  | 'supply_distribution_deleted'
  | 'user_updated';

interface User {
  firstName: string;
  lastName: string;
}

interface Activity {
  id: number;
  type: ActivityType;
  user: User;
  timestamp: string;
  details: any;
  targetId?: string;
}

const ActivityFeed: React.FC = () => {
  const { activities } = useActivityFeed();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate pagination
  const totalPages = Math.ceil(activities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentActivities = activities.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const getActivityColor = (type: ActivityType): string => {
    const colors: Record<ActivityType, string> = {
      user_invited: 'text-purple-600',
      event_created: 'text-green-600',
      event_updated: 'text-blue-600',
      event_deleted: 'text-red-600',
      activity_type_created: 'text-emerald-600',
      activity_type_updated: 'text-blue-600',
      activity_type_deleted: 'text-red-600',
      site_created: 'text-orange-600',
      site_updated: 'text-blue-600',
      site_deleted: 'text-red-600',
      community_partner_added: 'text-pink-600',
      community_partner_updated: 'text-blue-600',
      community_partner_deleted: 'text-red-600',
      program_goal_created: 'text-indigo-600',
      program_goal_updated: 'text-blue-600',
      program_goal_deleted: 'text-red-600',
      supply_created: 'text-amber-600',
      supply_updated: 'text-blue-600',
      supply_deleted: 'text-red-600',
      supplies_added_to_site: 'text-teal-600',
      supplies_removed_from_site: 'text-red-600',
      site_supply_updated: 'text-cyan-600',
      supply_distribution_logged: 'text-blue-600',
      supply_distribution_deleted: 'text-red-600',
      user_updated: 'text-blue-600',
    };
    return colors[type] || 'text-gray-600';
  };

  const getUserInitials = (user: User): string => {
    return `${user.firstName[0]}${user.lastName[0]}`;
  };

  const formatSupplyList = (
    supplies: Array<{ supplyName?: string; name?: string; quantity: number }>
  ): string => {
    if (supplies.length === 0) return '';

    const formatted = supplies.map(s => {
      const name = s.supplyName || s.name || 'Unknown Supply';
      return `${s.quantity} ${name}`;
    });

    if (formatted.length === 1) {
      return formatted[0];
    } else if (formatted.length === 2) {
      return `${formatted[0]} and ${formatted[1]}`;
    } else {
      const lastItem = formatted[formatted.length - 1];
      const otherItems = formatted.slice(0, -1).join(', ');
      return `${otherItems}, and ${lastItem}`;
    }
  };

  const formatChanges = (changes: any): string => {
    const changeTexts: string[] = [];

    for (const [key, value] of Object.entries(changes)) {
      const change = value as { old: any; new: any };
      let fieldName = key.replace(/([A-Z])/g, ' $1').toLowerCase();

      // Special formatting for specific fields
      if (key === 'isActive') {
        changeTexts.push(
          `status from ${change.old ? 'active' : 'inactive'} to ${change.new ? 'active' : 'inactive'}`
        );
      } else if (key === 'jobTitle') {
        const oldTitle = change.old || 'none';
        const newTitle = change.new || 'none';
        changeTexts.push(`job title from ${oldTitle} to ${newTitle}`);
      } else if (key === 'communityPartnerName') {
        const oldPartner = change.old || 'none';
        const newPartner = change.new || 'none';
        changeTexts.push(
          `community partner from ${oldPartner} to ${newPartner}`
        );
      } else if (key === 'hasCommunityRoom') {
        changeTexts.push(
          `community room status to ${change.new ? 'yes' : 'no'}`
        );
      } else {
        changeTexts.push(
          `${fieldName} from "${change.old}" to "${change.new}"`
        );
      }
    }

    return changeTexts.join(', ');
  };

  const getActivityTitle = (activity: Activity): React.ReactNode => {
    const { type, user, details, targetId } = activity;
    const userName = `${user.firstName} ${user.lastName}`;
    const colorClass = getActivityColor(type);

    switch (type) {
      case 'user_invited':
        return (
          <>
            {userName} invited{' '}
            <span className={colorClass}>{details.invitedEmail}</span> as{' '}
            {details.title}
          </>
        );

      case 'event_created':
        return (
          <>
            {userName} held an event{' '}
            <Link
              href={`/events/${targetId}`}
              className={`${colorClass} hover:underline`}
            >
              {details.eventTitle}
            </Link>{' '}
            at {details.siteName}
          </>
        );

      case 'event_updated':
        return (
          <>
            {userName} updated event details:{' '}
            <span className={colorClass}>{formatChanges(details.changes)}</span>
          </>
        );

      case 'event_deleted':
        return (
          <>
            {userName} deleted event{' '}
            <span className={colorClass}>{details.eventTitle}</span> at{' '}
            {details.siteName}
          </>
        );

      case 'activity_type_created':
        return (
          <>
            {userName} created activity type{' '}
            <span className={colorClass}>{details.activityTypeName}</span>
          </>
        );

      case 'activity_type_updated':
        return (
          <>
            {userName} updated activity type:{' '}
            <span className={colorClass}>{formatChanges(details.changes)}</span>
          </>
        );

      case 'activity_type_deleted':
        return (
          <>
            {userName} deleted activity type{' '}
            <span className={colorClass}>{details.activityTypeName}</span>
          </>
        );

      case 'site_created':
        return (
          <>
            {userName} created site{' '}
            <Link
              href={`/sites/${targetId}`}
              className={`${colorClass} hover:underline`}
            >
              {details.siteName}
            </Link>
          </>
        );

      case 'site_updated':
        return (
          <>
            {userName} updated site details:{' '}
            <span className={colorClass}>{formatChanges(details.changes)}</span>
          </>
        );

      case 'site_deleted':
        return (
          <>
            {userName} deleted site{' '}
            <span className={colorClass}>{details.siteName}</span>
          </>
        );

      case 'community_partner_added':
        return (
          <>
            {userName} added partner{' '}
            <span className={colorClass}>{details.partnerName}</span>
          </>
        );

      case 'community_partner_updated':
        return (
          <>
            {userName} updated community partner from{' '}
            <span className={colorClass}>{details.oldName}</span> to{' '}
            <span className={colorClass}>{details.newName}</span>
          </>
        );

      case 'community_partner_deleted':
        return (
          <>
            {userName} deleted community partner{' '}
            <span className={colorClass}>{details.partnerName}</span>
          </>
        );

      case 'program_goal_created':
        return (
          <>
            {userName} created program goal{' '}
            <span className={colorClass}>{details.programGoalName}</span>
          </>
        );

      case 'program_goal_updated':
        return (
          <>
            {userName} updated program goal from{' '}
            <span className={colorClass}>{details.oldName}</span> to{' '}
            <span className={colorClass}>{details.newName}</span>
          </>
        );

      case 'program_goal_deleted':
        return (
          <>
            {userName} deleted program goal{' '}
            <span className={colorClass}>{details.programGoalName}</span>
          </>
        );

      case 'supply_created':
        return (
          <>
            {userName} created supply{' '}
            <span className={colorClass}>{details.supplyName}</span>
          </>
        );

      case 'supply_updated':
        return (
          <>
            {userName} updated supply:{' '}
            <span className={colorClass}>{formatChanges(details.changes)}</span>
          </>
        );

      case 'supply_deleted':
        return (
          <>
            {userName} deleted supply{' '}
            <span className={colorClass}>{details.supplyName}</span>
          </>
        );

      case 'supplies_added_to_site':
        return (
          <>
            {userName} added{' '}
            <span className={colorClass}>
              {formatSupplyList(details.supplies)}
            </span>{' '}
            to {details.siteName}
          </>
        );

      case 'supplies_removed_from_site':
        return (
          <>
            {userName} removed{' '}
            <span className={colorClass}>
              {formatSupplyList(details.supplies)}
            </span>{' '}
            from {details.siteName}
          </>
        );

      case 'site_supply_updated':
        return (
          <>
            {userName} updated{' '}
            <span className={colorClass}>{details.supplyName}</span> at{' '}
            {details.siteName}
          </>
        );

      case 'supply_distribution_logged':
        return (
          <>
            {userName} distributed{' '}
            <span className={colorClass}>
              {formatSupplyList(details.supplies)}
            </span>{' '}
            at {details.siteName}
          </>
        );

      case 'supply_distribution_deleted':
        return (
          <>
            {userName} deleted a {details.distributionType} distribution at{' '}
            <span className={colorClass}>{details.siteName}</span>
          </>
        );

      case 'user_updated':
        return (
          <>
            {userName} updated user profile:{' '}
            <span className={colorClass}>{formatChanges(details.changes)}</span>
          </>
        );

      default:
        return 'Activity';
    }
  };

  const getActivitySubtitle = (activity: Activity): string | null => {
    const { type, details } = activity;

    switch (type) {
      case 'event_created':
        return `${details.totalParticipants} participants`;

      case 'activity_type_created':
        return details.programGoal;

      case 'site_created':
        return `${details.tenantCount} tenants`;

      case 'supply_created':
        return `${details.costPerUnit} per unit`;

      case 'site_supply_updated':
        return `${details.oldQuantity} → ${details.newQuantity} units`;

      case 'supply_distribution_logged':
        return `${details.totalCost.toFixed(2)} total cost`;

      case 'supply_distribution_deleted':
        return `${details.totalItems} items`;

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>Latest events and system activities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {currentActivities.map((activity: Activity) => {
            const subtitle = getActivitySubtitle(activity);
            return (
              <div
                key={activity.id}
                className="flex items-start justify-between gap-4"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarFallback className="bg-muted">
                      {getUserInitials(activity.user)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm mb-1">
                      {getActivityTitle(activity)}
                    </div>
                    {subtitle && (
                      <div className="text-xs text-muted-foreground">
                        {subtitle}
                      </div>
                    )}
                  </div>
                </div>
                <Badge variant="outline" className="flex-shrink-0">
                  {activity.timestamp}
                </Badge>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-9"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
