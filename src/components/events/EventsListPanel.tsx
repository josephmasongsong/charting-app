'use client';

import {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { useRouter } from 'next/navigation';
import { listSearchInputClass, listSelectTriggerClass } from '@/components/ui/list-controls';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { PaginationFooter } from '@/components/ui/pagination-footer';
import { EventListRows } from '@/components/events/EventListRows';
import { RowActions } from '@/components/ui/row-actions';
import { DuplicateEventDialog } from '@/components/events/DuplicateEventDialog';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Event {
  id: string;
  title: string;
  eventDate: string;
  successes: string | null;
  challenges: string | null;
  eventDuration: number;
  adminDuration: number;
  newParticipants: number;
  returningParticipants: number;
  eventIsYouthFocused: boolean;
  hasCoHost: boolean;
  totalCost: string;
  activityTypeName: string;
  siteName: string;
  userName: string;
  communityPartnerName: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

type SortOrder = 'asc' | 'desc';

interface SortConfig {
  field: string;
  order: SortOrder;
}

interface EventsListPanelProps {
  message?: string;
  error?: string;
  onClearMessage?: () => void;
  onClearError?: () => void;
  /** Admin only. Omit and the Edit action is hidden. */
  canEdit?: boolean;
  /** Site and organizer filters. Off leaves search as the only control. */
  showFilters?: boolean;
  /** Admin only. Omit and the Delete action is hidden. */
  onDelete?: (event: Event) => void;
}

export interface EventsListPanelRef {
  refreshData: () => void;
}

const alertClass = 'border-y-0 border-r-0 px-3.5 py-3';
const successAlertClass =
  'rounded-[2px] border-l-[5px] border-l-(--success) bg-[var(--bch-green-50,#EDF6EF)] text-foreground';

const EventsListPanel = forwardRef<EventsListPanelRef, EventsListPanelProps>(
  (
    {
      message,
      error,
      onClearMessage,
      onClearError,
      canEdit = false,
      showFilters = true,
      onDelete,
    },
    ref
  ) => {
    const router = useRouter();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig>({
      field: 'eventDate',
      order: 'desc',
    });
    const [pagination, setPagination] = useState<PaginationInfo>({
      page: 1,
      limit: 10,
      total: 0,
      pages: 0,
    });

    // Internal message/error state for table-specific operations
    const [cloningEvent, setCloningEvent] = useState<{
      id: string;
      title: string;
    } | null>(null);

    const [internalMessage, setInternalMessage] = useState('');
    const [internalError, setInternalError] = useState('');

    // The same three filters /events offers. Its date-range filter is
    // deliberately absent: the list is grouped by month, which already gives
    // the reader the period without a control.
    const [filterOptions, setFilterOptions] = useState<{
      sites: Array<{ id: string; name: string }>;
      organizers: Array<{ id: string; name: string }>;
    }>({ sites: [], organizers: [] });
    const [filterSite, setFilterSite] = useState('all');
    const [filterOrganizer, setFilterOrganizer] = useState('all');

    const fetchEvents = useCallback(
      async (
        page = 1,
        searchTerm = '',
        sort = sortConfig,
        filters: {
          site?: string;
          organizer?: string;
        } = {}
      ) => {
        try {
          setLoading(true);
          const params = new URLSearchParams({
            page: page.toString(),
            limit: '10',
            sortField: sort.field,
            sortOrder: sort.order,
            ...(searchTerm && { search: searchTerm }),
            ...(filters.site &&
              filters.site !== 'all' && { site: filters.site }),
            ...(filters.organizer &&
              filters.organizer !== 'all' && { organizer: filters.organizer }),
          });

          const response = await fetch(`/api/events?${params}`);
          const data = await response.json();

          if (response.ok) {
            setEvents(data.events);
            setPagination(data.pagination);
            setInternalError('');
          } else {
            setInternalError(data.error || 'Failed to fetch events');
          }
        } catch (error) {
          setInternalError('Network error occurred');
        } finally {
          setLoading(false);
        }
      },
      [sortConfig]
    );

    useImperativeHandle(ref, () => ({
      refreshData: () => {
        fetchEvents(pagination.page, search, sortConfig, currentFilters());
      },
    }));

    useEffect(() => {
      fetchEvents();
    }, [fetchEvents]);

    useEffect(() => {
      if (!showFilters) return;
      fetch('/api/events/options')
        .then(res => (res.ok ? res.json() : null))
        .then(data => data && setFilterOptions(data))
        .catch(() => {
          /* filters stay empty; the list still works */
        });
    }, [showFilters]);

    const currentFilters = () => ({
      site: filterSite,
      organizer: filterOrganizer,
    });

    const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      fetchEvents(1, search, sortConfig, currentFilters());
    };

    const handleFilterChange = (key: 'site' | 'organizer', value: string) => {
      const next = { ...currentFilters(), [key]: value };
      if (key === 'site') setFilterSite(value);
      if (key === 'organizer') setFilterOrganizer(value);
      fetchEvents(1, search, sortConfig, next);
    };

    const activeFiltersCount = [
      filterSite !== 'all',
      filterOrganizer !== 'all',
    ].filter(Boolean).length;

    const clearFilters = () => {
      setFilterSite('all');
      setFilterOrganizer('all');
      fetchEvents(1, search, sortConfig, {});
    };



    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    };

    // Parent props take precedence over internal state
    const displayMessage = message || internalMessage;
    const displayError = error || internalError;


    return (
      <>
        {/* Messages */}
        {displayMessage && (
          <Alert className={cn(alertClass, successAlertClass, 'mb-4')}>
            <AlertDescription className="text-[14px] text-foreground">
              {displayMessage}
            </AlertDescription>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto h-7 px-2"
              onClick={() => {
                if (message && onClearMessage) {
                  onClearMessage();
                } else {
                  setInternalMessage('');
                }
              }}
            >
              ×
            </Button>
          </Alert>
        )}

        {displayError && (
          <Alert variant="destructive" className={cn(alertClass, 'mb-4')}>
            <AlertDescription className="text-[14px]">
              {displayError}
            </AlertDescription>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto h-7 px-2 text-(--danger) hover:bg-(--danger-surface) hover:text-(--danger)"
              onClick={() => {
                if (error && onClearError) {
                  onClearError();
                } else {
                  setInternalError('');
                }
              }}
            >
              ×
            </Button>
          </Alert>
        )}

        <div className="overflow-hidden rounded-(--radius-card) border border-(--border-default) bg-(--surface-card) shadow-(--shadow-card)">
          <div className="flex flex-wrap items-center gap-4 border-b border-(--border-default) px-5 py-4">
            <form
              onSubmit={handleSearch}
              className="relative flex w-[340px] max-w-full items-center"
            >
              <button
                type="submit"
                aria-label="Search"
                className="absolute left-2.5 flex cursor-pointer text-(--bch-gray-500)"
              >
                <Search className="size-4" />
              </button>
              <Input
                placeholder="Search by title, description, site, or activity type..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className={listSearchInputClass}
              />
            </form>
            {showFilters && (
              <>
              <Select
                value={filterSite}
                onValueChange={value => handleFilterChange('site', value)}
              >
                <SelectTrigger
                  aria-label="Site"
                  className={cn(listSelectTriggerClass, "w-44")}
                >
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
                value={filterOrganizer}
                onValueChange={value => handleFilterChange('organizer', value)}
              >
                <SelectTrigger
                  aria-label="Organizer"
                  className={cn(listSelectTriggerClass, "w-44")}
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

              {activeFiltersCount > 0 && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={clearFilters}
                  className="h-auto p-0 text-[13.5px] text-(--action-primary) underline"
                >
                  Clear filters
                </Button>
              )}
              </>
            )}
          </div>

          {loading ? (
            <div className="space-y-2 p-5">
                            {Array.from({ length: 5 }, (_, i) => (
                <Skeleton
                  key={i}
                  className="h-[68px] rounded-none bg-(--surface-muted)"
                />
              ))}
            </div>
          ) : (
            <>
              <div>
                {events.length === 0 ? (
                  <div className="px-4 py-10 text-center text-(--text-muted)">
                    {search ? (
                      <>
                        No events found matching &quot;{search}&quot;.
                        <Button
                          variant="link"
                          onClick={() => {
                            setSearch('');
                            fetchEvents(1, '', sortConfig, currentFilters());
                          }}
                          className="ml-1 h-auto p-0 text-[14px] text-(--action-primary)"
                        >
                          Clear search
                        </Button>
                      </>
                    ) : (
                      'No events found.'
                    )}
                  </div>
                ) : (
                  <EventListRows
                    events={events}
                    renderActions={event => (
                      <RowActions
                        label={`Actions for ${event.title}`}
                        actions={[
                          { label: 'View', href: `/events/${event.id}` },
                          ...(canEdit
                            ? [
                                {
                                  label: 'Edit',
                                  onSelect: () =>
                                    router.push(
                                      `/admin/events/${event.id}/edit`
                                    ),
                                },
                              ]
                            : []),
                          {
                            label: 'Clone',
                            onSelect: () =>
                              setCloningEvent({
                                id: event.id,
                                title: event.title,
                              }),
                          },
                          ...(onDelete
                            ? [
                                {
                                  label: 'Delete',
                                  danger: true,
                                  onSelect: () => {
                                    const full = events.find(
                                      e => e.id === event.id
                                    );
                                    if (full) onDelete(full);
                                  },
                                },
                              ]
                            : []),
                        ]}
                      />
                    )}
                  />
                )}
              </div>

              <PaginationFooter
                page={pagination.page}
                pages={pagination.pages}
                total={pagination.total}
                limit={pagination.limit}
                onPageChange={page => fetchEvents(page, search, sortConfig)}
              />
            </>
          )}
        </div>

        {cloningEvent && (
          <DuplicateEventDialog
            eventId={cloningEvent.id}
            eventTitle={cloningEvent.title}
            open
            onOpenChange={next => !next && setCloningEvent(null)}
          />
        )}
      </>
    );
  }
);

EventsListPanel.displayName = 'EventsListPanel';

export default EventsListPanel;
