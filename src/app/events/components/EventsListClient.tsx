'use client';
import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calendar,
  Users,
  MapPin,
  Activity,
  Search,
  X,
  Trash2,
  PenLine,
  Copy,
  ChevronLeft,
  ChevronRight,
  Contact,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { DuplicateEventDialog } from './DuplicateEventDialog';

interface Event {
  id: string;
  title: string;
  eventDate: string;
  activityTypeName: string | null;
  siteName: string | null;
  organizerName: string | null;
  totalParticipants: number;
  eventIsYouthFocused: boolean;
  activityTypeId: string;
  siteId: string;
  userId: string;
}

interface FilterOption {
  id: string;
  name: string;
}

interface FilterOptions {
  activityTypes: FilterOption[];
  sites: FilterOption[];
  organizers: FilterOption[];
}

interface InitialFilters {
  search: string;
  activityType: string;
  site: string;
  organizer: string;
  page: number;
}

interface EventsListClientProps {
  initialEvents: Event[];
  filterOptions: FilterOptions;
  initialFilters: InitialFilters;
  totalCount: number;
  isAdmin: boolean;
}

const DOW = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

// event_date is a DATE column serialised as YYYY-MM-DD; reading the parts
// avoids the previous-day shift that new Date('YYYY-MM-DD') gives in Pacific time.
const dateParts = (dateStr: string) => {
  const [y, m, d] = dateStr.slice(0, 10).split('-').map(Number);
  return { y, m: m - 1, d, dow: new Date(Date.UTC(y, m - 1, d)).getUTCDay() };
};

const monthLabel = (dateStr: string) => {
  const { y, m } = dateParts(dateStr);
  return `${MONTHS[m]} ${y}`;
};

const selectTriggerClass =
  'h-9 rounded-(--radius-control) border-(--border-input) bg-(--surface-card) text-sm shadow-none';
const primaryButtonClass =
  'h-auto rounded-(--radius-control) bg-(--action-primary) px-[18px] py-[9px] text-[15px] font-normal text-(--text-on-chrome) shadow-none hover:bg-(--action-primary-hover)';
const outlineButtonClass =
  'h-8 rounded-(--radius-control) border-(--action-primary) bg-(--surface-card) text-(--action-primary) shadow-none hover:bg-(--action-selected) hover:text-(--action-primary) disabled:border-(--bch-gray-300) disabled:text-(--bch-gray-500) disabled:opacity-100';
const pagerActiveClass =
  'h-8 rounded-(--radius-control) bg-(--action-primary) text-(--text-on-chrome) shadow-none hover:bg-(--action-primary-hover)';
const rowActionClass =
  'size-8 rounded-(--radius-control) text-(--action-primary) hover:bg-(--action-selected) hover:text-(--action-primary)';
const destructiveActionClass =
  'size-8 rounded-(--radius-control) text-(--danger) hover:bg-(--danger-surface) hover:text-(--danger)';

const EventsListClient: React.FC<EventsListClientProps> = ({
  initialEvents,
  filterOptions,
  initialFilters,
  totalCount,
  isAdmin,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTitle, setSearchTitle] = useState(initialFilters.search);
  const [filterActivityType, setFilterActivityType] = useState(
    initialFilters.activityType
  );
  const [filterSite, setFilterSite] = useState(initialFilters.site);
  const [filterOrganizer, setFilterOrganizer] = useState(
    initialFilters.organizer
  );
  const [currentPage, setCurrentPage] = useState(initialFilters.page);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const updateURL = (newFilters: Partial<InitialFilters>) => {
    const params = new URLSearchParams(searchParams);

    if (newFilters.search !== undefined) {
      if (newFilters.search) {
        params.set('search', newFilters.search);
      } else {
        params.delete('search');
      }
    }

    if (newFilters.activityType !== undefined) {
      if (newFilters.activityType && newFilters.activityType !== 'all') {
        params.set('activityType', newFilters.activityType);
      } else {
        params.delete('activityType');
      }
    }

    if (newFilters.site !== undefined) {
      if (newFilters.site && newFilters.site !== 'all') {
        params.set('site', newFilters.site);
      } else {
        params.delete('site');
      }
    }

    if (newFilters.organizer !== undefined) {
      if (newFilters.organizer && newFilters.organizer !== 'all') {
        params.set('organizer', newFilters.organizer);
      } else {
        params.delete('organizer');
      }
    }

    if (newFilters.page !== undefined) {
      if (newFilters.page > 1) {
        params.set('page', newFilters.page.toString());
      } else {
        params.delete('page');
      }
    }

    router.push(`/events?${params.toString()}`);
  };

  const handleSearchChange = (value: string) => {
    setSearchTitle(value);
    setCurrentPage(1);
    updateURL({ search: value, page: 1 });
  };

  const handleActivityTypeChange = (value: string) => {
    setFilterActivityType(value);
    setCurrentPage(1);
    updateURL({ activityType: value, page: 1 });
  };

  const handleSiteChange = (value: string) => {
    setFilterSite(value);
    setCurrentPage(1);
    updateURL({ site: value, page: 1 });
  };

  const handleOrganizerChange = (value: string) => {
    setFilterOrganizer(value);
    setCurrentPage(1);
    updateURL({ organizer: value, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateURL({ page });
  };

  const clearFilters = () => {
    setSearchTitle('');
    setFilterActivityType('all');
    setFilterSite('all');
    setFilterOrganizer('all');
    setCurrentPage(1);
    router.push('/events');
  };

  const activeFiltersCount = [
    searchTitle,
    filterActivityType !== 'all',
    filterSite !== 'all',
    filterOrganizer !== 'all',
  ].filter(Boolean).length;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Rows arrive ordered by event_date desc, so buckets are already in order.
  const groups = initialEvents.reduce<Array<{ label: string; events: Event[] }>>(
    (acc, event) => {
      const label = monthLabel(event.eventDate);
      const last = acc[acc.length - 1];
      if (last && last.label === label) {
        last.events.push(event);
      } else {
        acc.push({ label, events: [event] });
      }
      return acc;
    },
    []
  );

  const span =
    groups.length === 0
      ? ''
      : groups.length === 1
        ? groups[0].label
        : `${groups[groups.length - 1].label} – ${groups[0].label}`;
  const rangeStart = totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const rangeEnd = Math.min(currentPage * itemsPerPage, totalCount);

  return (
    <div className="min-h-screen bg-(--surface-page) px-6 pt-6 pb-12">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[30px] leading-tight font-bold tracking-[-.2px]">
              Events
            </h1>
            <p className="mt-1.5 text-[15px] text-(--text-muted)">
              {totalCount} event{totalCount !== 1 ? 's' : ''} · {initialEvents.length}{' '}
              shown{span ? ` · ${span}` : ''}
            </p>
          </div>
          <Button asChild className={primaryButtonClass}>
            <Link href="/events/new">
              <Calendar className="h-4 w-4" />
              Log New Event
            </Link>
          </Button>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 rounded-(--radius-card) border border-(--border-default) bg-(--surface-card) px-4 py-3.5">
          <div className="relative min-w-60 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-(--bch-gray-500)" />
            <Input
              placeholder="Search by title..."
              value={searchTitle}
              onChange={e => handleSearchChange(e.target.value)}
              className="h-9 rounded-(--radius-control) border-(--border-input) bg-(--surface-card) pl-8 text-sm shadow-none md:text-sm"
            />
          </div>

          <Select value={filterSite} onValueChange={handleSiteChange}>
            <SelectTrigger aria-label="Site" className={cn(selectTriggerClass, 'w-44')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sites</SelectItem>
              {filterOptions.sites.map(site => (
                <SelectItem key={site.id} value={site.id}>
                  {site.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filterActivityType}
            onValueChange={handleActivityTypeChange}
          >
            <SelectTrigger
              aria-label="Activity type"
              className={cn(selectTriggerClass, 'w-44')}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {filterOptions.activityTypes.map(type => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filterOrganizer}
            onValueChange={handleOrganizerChange}
          >
            <SelectTrigger
              aria-label="Organizer"
              className={cn(selectTriggerClass, 'w-44')}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Organizers</SelectItem>
              {filterOptions.organizers.map(organizer => (
                <SelectItem key={organizer.id} value={organizer.id}>
                  {organizer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* TODO: /events — not wired: date-range filter has no search param
              or event_date condition in getEvents(). */}
          <Select value="all" disabled>
            <SelectTrigger
              aria-label="Date range"
              className={cn(selectTriggerClass, 'w-36')}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>

          {activeFiltersCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              aria-label="Clear filters"
              className={outlineButtonClass}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="mt-4 overflow-hidden rounded-(--radius-card) border border-(--border-default) bg-(--surface-card)">
          {initialEvents.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No events found"
              description="Try adjusting your search or filters"
              action={
                activeFiltersCount > 0
                  ? { label: 'Clear all filters', onClick: clearFilters }
                  : undefined
              }
              className="border-0"
            />
          ) : (
            groups.map(group => (
              <React.Fragment key={group.label}>
                <div className="flex items-center justify-between gap-3 bg-(--surface-chrome) px-5 py-3.5 text-(--text-on-chrome)">
                  <span className="flex items-center gap-2">
                    <Calendar className="size-[15px]" />
                    <span className="text-[13px] font-bold tracking-[.3px] uppercase">
                      {group.label}
                    </span>
                  </span>
                  <span className="text-[12.5px] opacity-85">
                    {group.events.length} shown
                  </span>
                </div>
                {group.events.map(event => {
                  const { d, dow } = dateParts(event.eventDate);
                  return (
                    <div
                      key={event.id}
                      className="flex items-center gap-4 border-b border-(--bch-gray-200) px-4 py-3 last:border-b-0 hover:bg-(--surface-muted)"
                    >
                      <div
                        className="w-[52px] shrink-0 border-r border-(--bch-gray-200) pr-3.5 text-center"
                        title={formatDate(event.eventDate)}
                      >
                        <div className="text-[11px] font-bold tracking-[.6px] text-(--text-muted)">
                          {DOW[dow]}
                        </div>
                        <div className="text-xl leading-[1.15] font-bold">{d}</div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/events/${event.id}`}
                            className="truncate text-[14.5px] font-semibold text-(--text-body) hover:text-(--action-primary)"
                          >
                            {event.title}
                          </Link>
                          {event.eventIsYouthFocused && (
                            <Badge
                              variant="secondary"
                              className="shrink-0 rounded-full border-transparent bg-(--action-selected) text-[11px] font-semibold text-(--action-primary)"
                            >
                              Youth
                            </Badge>
                          )}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-3.5 text-[12.5px] text-(--text-muted)">
                          <span className="inline-flex items-center gap-1.5">
                            <Contact className="size-[13px]" />
                            {event.organizerName}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="size-[13px]" />
                            {event.siteName}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Users className="size-[13px]" />
                            {event.totalParticipants} participants
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Activity className="size-[13px]" />
                            {event.activityTypeName}
                          </span>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        {isAdmin && (
                          <>
                            <Button
                              asChild
                              variant="ghost"
                              size="icon"
                              className={rowActionClass}
                            >
                              <Link
                                href={`/events/${event.id}/edit`}
                                aria-label="Edit"
                                title="Edit"
                              >
                                <PenLine className="size-[17px]" />
                              </Link>
                            </Button>
                            {/* TODO: /events — not wired: delete has no handler. */}
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Delete"
                              title="Delete"
                              className={destructiveActionClass}
                            >
                              <Trash2 className="size-[17px]" />
                            </Button>
                          </>
                        )}
                        <DuplicateEventDialog
                          eventId={event.id}
                          eventTitle={event.title}
                          trigger={
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Duplicate"
                              title="Duplicate"
                              className={rowActionClass}
                            >
                              <Copy className="size-[17px]" />
                            </Button>
                          }
                        />
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            ))
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-3.5">
            <span className="text-[13.5px] text-(--text-muted)">
              Showing {rangeStart} to {rangeEnd} of {totalCount} event
              {totalCount !== 1 ? 's' : ''}
            </span>

            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={outlineButtonClass}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 7) {
                      pageNum = i + 1;
                    } else if (currentPage <= 4) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 3) {
                      pageNum = totalPages - 6 + i;
                    } else {
                      pageNum = currentPage - 3 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className={cn(
                          'w-9',
                          currentPage === pageNum
                            ? pagerActiveClass
                            : outlineButtonClass
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
                  onClick={() =>
                    handlePageChange(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className={outlineButtonClass}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsListClient;
