'use client';

import React, { useState } from 'react';
import { useActivityFeed } from '@/hooks/useActivityFeed';
import { AvatarTile } from '@/components/ui/avatar-tile';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import Link from 'next/link';
import { channelLabel, referredToLabel } from '@/lib/referral-options';

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
  | 'referral_logged'
  | 'referral_deleted'
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
  createdAt: string;
  details: any;
  targetId?: string;
  targetExists?: boolean;
}

const emphasisClass = 'font-semibold text-(--text-body)';
const linkClass = 'font-semibold text-(--action-primary) hover:underline';
const loadMoreClass =
  'h-auto w-full rounded-(--radius-control) border-(--action-primary) bg-(--surface-card) px-3.5 py-2 text-[13.5px] font-semibold text-(--action-primary) shadow-none hover:bg-(--action-selected) hover:text-(--action-primary)';

const ActivityFeed: React.FC = () => {
  const { activities } = useActivityFeed();
  const PAGE_SIZE = 8;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filteredActivities = activities as Activity[];
  const visibleActivities = filteredActivities.slice(0, visibleCount);

  const dayLabel = (iso: string) => {
    const date = new Date(iso);
    const now = new Date();
    const startOfDay = (d: Date) =>
      new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const diffDays = Math.round(
      (startOfDay(now) - startOfDay(date)) / 86400000
    );
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      ...(date.getFullYear() !== now.getFullYear()
        ? { year: 'numeric' as const }
        : {}),
    });
  };

  // Consecutive rows sharing a calendar day sit under one date rule.
  const groups: Array<{ label: string; items: Activity[] }> = [];
  for (const activity of visibleActivities as Activity[]) {
    const label = activity.createdAt ? dayLabel(activity.createdAt) : '';
    const last = groups[groups.length - 1];
    if (last && last.label === label) {
      last.items.push(activity);
    } else {
      groups.push({ label, items: [activity] });
    }
  }

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
    const actor = <span className={emphasisClass}>{userName}</span>;

    // An event title is the only link in the feed. People, sites, supplies,
    // distributions and referrals are named in plain emphasis instead, so the
    // feed reads as a record rather than a wall of navigation.
    const target = (children: React.ReactNode) => (
      <span className={emphasisClass}>{children}</span>
    );

    // Events still link, except once deleted — a dead link is worse than none.
    const eventLink = (title: React.ReactNode) =>
      activity.targetExists === false ? (
        <span className={emphasisClass}>{title}</span>
      ) : (
        <Link href={`/events/${targetId}`} className={linkClass}>
          {title}
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
            {eventLink(details.eventTitle)} at{' '}
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
            {target(details.siteName)}
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
            to {target(details.siteName)}
          </>
        );

      case 'supplies_removed_from_site':
        return (
          <>
            {actor}{' '}removed{' '}
            <span className={emphasisClass}>
              {formatSupplyList(details.supplies)}
            </span>{' '}
            from {target(details.siteName)}
          </>
        );

      case 'site_supply_updated':
        return (
          <>
            {actor}{' '}updated{' '}
            <span className={emphasisClass}>{details.supplyName}</span> at{' '}
            {target(details.siteName)}
          </>
        );

      case 'supply_distribution_logged':
        return (
          <>
            {actor}{' '}distributed{' '}
            {target(formatSupplyList(details.supplies)
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

      case 'referral_logged':
        return (
          <>
            {actor}{' '}referred a tenant to{' '}
            {target(referredToLabel(String(details.referredTo))
            )}{' '}
            at {details.siteName} · via{' '}
            {channelLabel(String(details.channel))}
          </>
        );

      case 'referral_deleted':
        return (
          <>
            {actor}{' '}deleted a referral at{' '}
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

  return (
    <div
      data-slot="activity-feed"
      className="overflow-hidden rounded-(--radius-card) border border-(--border-default) bg-(--surface-card)"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-(--border-default) px-4 pt-4 pb-3">
        <h4 className="text-[17px] font-bold text-(--text-body)">
          Recent Activity
        </h4>
      </div>

      {filteredActivities.length === 0 ? (
        <EmptyState title="You're all caught up" className="border-0" />
      ) : (
        <>
          {groups.map(group => (
            <div key={`${group.label}-${group.items[0]?.id}`}>
              {group.label && (
                <div className="border-b border-(--border-default) bg-(--surface-muted) px-4 py-2">
                  <span className="text-[11.5px] font-bold tracking-[.03em] text-(--text-muted) uppercase">
                    {group.label}
                  </span>
                </div>
              )}
              {group.items.map(activity => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 border-b border-(--bch-gray-200) px-4 py-3 hover:bg-(--action-selected)"
                >
                  {/* 44px matches the avatars on the index pages (users,
                      sites) so a person reads the same size everywhere. */}
                  <AvatarTile
                    initials={getUserInitials(activity.user)}
                    size={44}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-[13.5px] text-(--text-body) [text-wrap:pretty]">
                      {getActivityTitle(activity)}
                    </div>
                    <div className="mt-[3px] text-[12px] text-(--text-muted)">
                      {activity.timestamp}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {filteredActivities.length > visibleCount ? (
            <div className="flex flex-col items-center gap-1.5 px-4 py-3">
              <Button
                variant="outline"
                onClick={() => setVisibleCount(count => count + PAGE_SIZE)}
                className={loadMoreClass}
              >
                Load more
              </Button>
              <span className="text-[12px] text-(--text-muted)">
                Showing {visibleActivities.length} of{' '}
                {filteredActivities.length}
              </span>
            </div>
          ) : (
            <div className="px-4 py-3.5 text-center text-[12.5px] text-(--text-muted)">
              You&apos;re all caught up
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ActivityFeed;
