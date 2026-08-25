'use client';

import React, { useState } from 'react';
import { useActivityFeed } from '@/hooks/useActivityFeed';
import { AvatarTile } from '@/components/ui/avatar-tile';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

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
  userId: string;
  timestamp: string;
  details: any;
  targetId?: string;
  targetExists?: boolean;
}

const emphasisClass = 'font-semibold text-(--text-body)';
const linkClass = 'font-semibold text-(--action-primary) hover:underline';
const pagerButtonClass =
  'h-8 rounded-(--radius-control) border-(--action-primary) bg-(--surface-card) text-(--action-primary) shadow-none hover:bg-(--action-selected) hover:text-(--action-primary) disabled:border-(--bch-gray-300) disabled:text-(--bch-gray-500) disabled:opacity-100';
const pagerActiveClass =
  'h-8 rounded-(--radius-control) bg-(--action-primary) text-(--text-on-chrome) shadow-none hover:bg-(--action-primary-hover)';

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
    const { type, user, userId, details, targetId } = activity;
    const userName = `${user.firstName} ${user.lastName}`;
    const actor = (
      <Link href={`/users/${userId}`} className={linkClass}>
        {userName}
      </Link>
    );
    // Link only targets that still exist; deleted ones render as plain
    // emphasis instead of a dead link.
    const target = (href: string, children: React.ReactNode) =>
      activity.targetExists === false ? (
        <span className={emphasisClass}>{children}</span>
      ) : (
        <Link href={href} className={linkClass}>
          {children}
        </Link>
      );

    switch (type) {
      case 'user_invited':
        return (
          <>
            {actor}{' '}invited{' '}
            <span className={emphasisClass}>{details.invitedEmail}</span> as{' '}
            {details.title}
          </>
        );

      case 'event_created':
        return (
          <>
            {actor}{' '}held an event{' '}
            {target(`/events/${targetId}`, details.eventTitle)} at{' '}
            {details.siteName}
          </>
        );

      case 'event_updated':
        return (
          <>
            {actor}{' '}updated event details:{' '}
            <span className={emphasisClass}>{formatChanges(details.changes)}</span>
          </>
        );

      case 'event_deleted':
        return (
          <>
            {actor}{' '}deleted event{' '}
            <span className={emphasisClass}>{details.eventTitle}</span> at{' '}
            {details.siteName}
          </>
        );

      case 'activity_type_created':
        return (
          <>
            {actor}{' '}created activity type{' '}
            <span className={emphasisClass}>{details.activityTypeName}</span>
          </>
        );

      case 'activity_type_updated':
        return (
          <>
            {actor}{' '}updated activity type:{' '}
            <span className={emphasisClass}>{formatChanges(details.changes)}</span>
          </>
        );

      case 'activity_type_deleted':
        return (
          <>
            {actor}{' '}deleted activity type{' '}
            <span className={emphasisClass}>{details.activityTypeName}</span>
          </>
        );

      case 'site_created':
        return (
          <>
            {actor}{' '}created site{' '}
            {target(`/sites/${targetId}`, details.siteName)}
          </>
        );

      case 'site_updated':
        return (
          <>
            {actor}{' '}updated site details:{' '}
            <span className={emphasisClass}>{formatChanges(details.changes)}</span>
          </>
        );

      case 'site_deleted':
        return (
          <>
            {actor}{' '}deleted site{' '}
            <span className={emphasisClass}>{details.siteName}</span>
          </>
        );

      case 'community_partner_added':
        return (
          <>
            {actor}{' '}added partner{' '}
            <span className={emphasisClass}>{details.partnerName}</span>
          </>
        );

      case 'community_partner_updated':
        return (
          <>
            {actor}{' '}updated community partner from{' '}
            <span className={emphasisClass}>{details.oldName}</span> to{' '}
            <span className={emphasisClass}>{details.newName}</span>
          </>
        );

      case 'community_partner_deleted':
        return (
          <>
            {actor}{' '}deleted community partner{' '}
            <span className={emphasisClass}>{details.partnerName}</span>
          </>
        );

      case 'program_goal_created':
        return (
          <>
            {actor}{' '}created program goal{' '}
            <span className={emphasisClass}>{details.programGoalName}</span>
          </>
        );

      case 'program_goal_updated':
        return (
          <>
            {actor}{' '}updated program goal from{' '}
            <span className={emphasisClass}>{details.oldName}</span> to{' '}
            <span className={emphasisClass}>{details.newName}</span>
          </>
        );

      case 'program_goal_deleted':
        return (
          <>
            {actor}{' '}deleted program goal{' '}
            <span className={emphasisClass}>{details.programGoalName}</span>
          </>
        );

      case 'supply_created':
        return (
          <>
            {actor}{' '}created supply{' '}
            <span className={emphasisClass}>{details.supplyName}</span>
          </>
        );

      case 'supply_updated':
        return (
          <>
            {actor}{' '}updated supply:{' '}
            <span className={emphasisClass}>{formatChanges(details.changes)}</span>
          </>
        );

      case 'supply_deleted':
        return (
          <>
            {actor}{' '}deleted supply{' '}
            <span className={emphasisClass}>{details.supplyName}</span>
          </>
        );

      case 'supplies_added_to_site':
        return (
          <>
            {actor}{' '}added{' '}
            <span className={emphasisClass}>
              {formatSupplyList(details.supplies)}
            </span>{' '}
            to {target(`/sites/${targetId}`, details.siteName)}
          </>
        );

      case 'supplies_removed_from_site':
        return (
          <>
            {actor}{' '}removed{' '}
            <span className={emphasisClass}>
              {formatSupplyList(details.supplies)}
            </span>{' '}
            from {target(`/sites/${targetId}`, details.siteName)}
          </>
        );

      case 'site_supply_updated':
        return (
          <>
            {actor}{' '}updated{' '}
            <span className={emphasisClass}>{details.supplyName}</span> at{' '}
            {target(`/sites/${targetId}`, details.siteName)}
          </>
        );

      case 'supply_distribution_logged':
        return (
          <>
            {actor}{' '}distributed{' '}
            {target(
              `/supply-distributions/${targetId}`,
              formatSupplyList(details.supplies)
            )}{' '}
            at {details.siteName}
          </>
        );

      case 'supply_distribution_deleted':
        return (
          <>
            {actor}{' '}deleted a {details.distributionType} distribution at{' '}
            <span className={emphasisClass}>{details.siteName}</span>
          </>
        );

      case 'user_updated':
        return (
          <>
            {actor}{' '}updated user profile:{' '}
            <span className={emphasisClass}>{formatChanges(details.changes)}</span>
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
    <div
      data-slot="activity-feed"
      className="overflow-hidden rounded-(--radius-card) border border-(--border-default) bg-(--surface-card)"
    >
      <div className="border-b border-(--bch-gray-200) px-4 py-3.5">
        <h4 className="text-[17px] font-bold">Recent Activity</h4>
      </div>

      {activities.length === 0 ? (
        <EmptyState title="You're all caught up" className="m-4" />
      ) : (
        <div>
          {currentActivities.map((activity: Activity) => {
            const subtitle = getActivitySubtitle(activity);
            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 border-b border-(--bch-gray-200) px-4 py-3 last:border-b-0"
              >
                <AvatarTile initials={getUserInitials(activity.user)} size={38} />
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] text-(--text-body)">
                    {getActivityTitle(activity)}
                  </div>
                  <div className="mt-[3px] text-xs text-(--text-muted)">
                    {subtitle ? `${subtitle} · ` : ''}
                    {activity.timestamp}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-2 border-t border-(--bch-gray-200) px-4 py-3.5">
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className={pagerButtonClass}
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
                    className={cn(
                      'w-9',
                      currentPage === pageNum ? pagerActiveClass : pagerButtonClass
                    )}
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
              className={pagerButtonClass}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <span className="text-xs text-(--text-muted)">
            Showing {startIndex + 1}–{Math.min(endIndex, activities.length)} of{' '}
            {activities.length}
          </span>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
