'use client';

import {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Edit,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Eye,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

interface Event {
  id: string;
  title: string;
  eventDate: string;
  description: string;
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

interface EventsTableProps {
  message?: string;
  error?: string;
  onClearMessage?: () => void;
  onClearError?: () => void;
  onDelete: (event: Event) => void;
}

// Define the ref methods that the parent can call
export interface EventsTableRef {
  refreshData: () => void;
}

const EventsTable = forwardRef<EventsTableRef, EventsTableProps>(
  ({ message, error, onClearMessage, onClearError, onDelete }, ref) => {
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
    const [internalMessage, setInternalMessage] = useState('');
    const [internalError, setInternalError] = useState('');

    // Fetch events
    const fetchEvents = useCallback(
      async (page = 1, searchTerm = '', sort = sortConfig) => {
        try {
          setLoading(true);
          const params = new URLSearchParams({
            page: page.toString(),
            limit: '10',
            sortField: sort.field,
            sortOrder: sort.order,
            ...(searchTerm && { search: searchTerm }),
          });

          const response = await fetch(`/api/admin/events?${params}`);
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

    // Expose refresh method to parent component
    useImperativeHandle(ref, () => ({
      refreshData: () => {
        fetchEvents(pagination.page, search, sortConfig);
      },
    }));

    useEffect(() => {
      fetchEvents();
    }, [fetchEvents]);

    // Handle search
    const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      fetchEvents(1, search, sortConfig);
    };

    // Handle sorting
    const handleSort = (field: string) => {
      const newOrder: SortOrder =
        sortConfig.field === field && sortConfig.order === 'asc'
          ? 'desc'
          : 'asc';
      const newSortConfig = { field, order: newOrder };
      setSortConfig(newSortConfig);
      fetchEvents(pagination.page, search, newSortConfig);
    };

    // Format date for display
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    };

    // Determine which message/error to show (parent props take precedence)
    const displayMessage = message || internalMessage;
    const displayError = error || internalError;

    return (
      <>
        {/* Messages */}
        {displayMessage && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {displayMessage}
            </AlertDescription>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto"
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
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{displayError}</AlertDescription>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto"
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

        {/* Events Data Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Events ({pagination.total})
                </CardTitle>
                <CardDescription>
                  Manage and organize community events and activities
                </CardDescription>
              </div>

              {/* Search Bar */}
              <div className="w-full md:w-80">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <Input
                    placeholder="Search by title, description, site, or activity type..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" variant="outline" size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <>
                <div className="rounded-md border">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>
                            <Button
                              variant="ghost"
                              onClick={() => handleSort('title')}
                              className="h-auto p-0 font-semibold hover:bg-transparent"
                            >
                              Title
                              {sortConfig.field === 'title' ? (
                                sortConfig.order === 'asc' ? (
                                  <ChevronUp className="ml-2 h-4 w-4" />
                                ) : (
                                  <ChevronDown className="ml-2 h-4 w-4" />
                                )
                              ) : (
                                <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
                              )}
                            </Button>
                          </TableHead>
                          <TableHead>
                            <Button
                              variant="ghost"
                              onClick={() => handleSort('eventDate')}
                              className="h-auto p-0 font-semibold hover:bg-transparent"
                            >
                              Date
                              {sortConfig.field === 'eventDate' ? (
                                sortConfig.order === 'asc' ? (
                                  <ChevronUp className="ml-2 h-4 w-4" />
                                ) : (
                                  <ChevronDown className="ml-2 h-4 w-4" />
                                )
                              ) : (
                                <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
                              )}
                            </Button>
                          </TableHead>
                          <TableHead>Site</TableHead>
                          <TableHead>Activity Type</TableHead>
                          <TableHead>Organizer</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {events.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8">
                              {search ? (
                                <>
                                  No events found matching "{search}".
                                  <Button
                                    variant="link"
                                    onClick={() => {
                                      setSearch('');
                                      fetchEvents(1, '', sortConfig);
                                    }}
                                    className="ml-2"
                                  >
                                    Clear search
                                  </Button>
                                </>
                              ) : (
                                'No events found.'
                              )}
                            </TableCell>
                          </TableRow>
                        ) : (
                          events.map(event => (
                            <TableRow key={event.id}>
                              <TableCell className="font-medium">
                                {event.title}
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  {formatDate(event.eventDate)}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">{event.siteName}</div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">
                                  {event.activityTypeName}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">{event.userName}</div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      router.push(`/events/${event.id}`)
                                    }
                                    title="View event"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      router.push(
                                        `/admin/events/${event.id}/edit`
                                      )
                                    }
                                    title="Edit event"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onDelete(event)}
                                    title="Delete event"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Enhanced Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex flex-col space-y-4 mt-6 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div className="text-sm text-muted-foreground">
                      Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                      {Math.min(
                        pagination.page * pagination.limit,
                        pagination.total
                      )}{' '}
                      of {pagination.total} results
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* First page */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchEvents(1, search, sortConfig)}
                        disabled={pagination.page <= 1}
                        className="hidden sm:inline-flex"
                      >
                        First
                      </Button>

                      {/* Previous page */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          fetchEvents(pagination.page - 1, search, sortConfig)
                        }
                        disabled={pagination.page <= 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="hidden sm:inline ml-1">Previous</span>
                      </Button>

                      {/* Page numbers */}
                      <div className="flex items-center space-x-1">
                        {(() => {
                          const pages = [];
                          const currentPage = pagination.page;
                          const totalPages = pagination.pages;

                          // Always show first page
                          if (currentPage > 3) {
                            pages.push(
                              <Button
                                key={1}
                                variant={
                                  1 === currentPage ? 'default' : 'outline'
                                }
                                size="sm"
                                onClick={() =>
                                  fetchEvents(1, search, sortConfig)
                                }
                                className="w-10"
                              >
                                1
                              </Button>
                            );

                            if (currentPage > 4) {
                              pages.push(
                                <span key="ellipsis1" className="px-2">
                                  ...
                                </span>
                              );
                            }
                          }

                          // Show pages around current page
                          for (
                            let i = Math.max(1, currentPage - 2);
                            i <= Math.min(totalPages, currentPage + 2);
                            i++
                          ) {
                            pages.push(
                              <Button
                                key={i}
                                variant={
                                  i === currentPage ? 'default' : 'outline'
                                }
                                size="sm"
                                onClick={() =>
                                  fetchEvents(i, search, sortConfig)
                                }
                                className="w-10"
                              >
                                {i}
                              </Button>
                            );
                          }

                          // Always show last page
                          if (currentPage < totalPages - 2) {
                            if (currentPage < totalPages - 3) {
                              pages.push(
                                <span key="ellipsis2" className="px-2">
                                  ...
                                </span>
                              );
                            }

                            pages.push(
                              <Button
                                key={totalPages}
                                variant={
                                  totalPages === currentPage
                                    ? 'default'
                                    : 'outline'
                                }
                                size="sm"
                                onClick={() =>
                                  fetchEvents(totalPages, search, sortConfig)
                                }
                                className="w-10"
                              >
                                {totalPages}
                              </Button>
                            );
                          }

                          return pages;
                        })()}
                      </div>

                      {/* Next page */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          fetchEvents(pagination.page + 1, search, sortConfig)
                        }
                        disabled={pagination.page >= pagination.pages}
                      >
                        <span className="hidden sm:inline mr-1">Next</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>

                      {/* Last page */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          fetchEvents(pagination.pages, search, sortConfig)
                        }
                        disabled={pagination.page >= pagination.pages}
                        className="hidden sm:inline-flex"
                      >
                        Last
                      </Button>
                    </div>
                  </div>
                )}

                {/* Show pagination info even when only one page */}
                {pagination.pages <= 1 && pagination.total > 0 && (
                  <div className="mt-4 text-sm text-muted-foreground text-center">
                    Showing all {pagination.total} results
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </>
    );
  }
);

EventsTable.displayName = 'EventsTable';

export default EventsTable;
