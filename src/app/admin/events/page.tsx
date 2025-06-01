// app/admin/events/page.tsx
'use client';

import { useState, useEffect } from 'react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Plus,
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
  ArrowUp,
  ArrowDown,
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

type SortField = 'title' | 'eventDate';
type SortOrder = 'asc' | 'desc';

export default function AdminEvents() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('eventDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // Delete event state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState<Event | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Fetch events
  const fetchEvents = async (
    page = 1,
    searchTerm = '',
    field = sortField,
    order = sortOrder
  ) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        sortField: field,
        sortOrder: order,
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`/api/admin/events?${params}`);
      const data = await response.json();

      if (response.ok) {
        setEvents(data.events);
        setPagination(data.pagination);
      } else {
        setError(data.error || 'Failed to fetch events');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Clear messages after some time
  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, error]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEvents(1, search, sortField, sortOrder);
  };

  // Handle sorting
  const handleSort = (field: SortField) => {
    const newOrder =
      sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(newOrder);
    fetchEvents(pagination.page, search, field, newOrder);
  };

  // Handle delete event
  const openDeleteEvent = (event: Event) => {
    setDeletingEvent(event);
    setDeleteOpen(true);
  };

  const handleDeleteEvent = async () => {
    if (!deletingEvent) return;

    setDeleteLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`/api/admin/events/${deletingEvent.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`Event "${deletingEvent.title}" deleted successfully!`);
        setDeleteOpen(false);
        fetchEvents(pagination.page, search, sortField, sortOrder);
      } else {
        setError(data.error || 'Failed to delete event');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setDeleteLoading(false);
    }
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

  // Get sort icon
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortOrder === 'asc' ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Events Management</h1>
          <p className="text-muted-foreground">
            Manage community events and activities
          </p>
        </div>

        <Button onClick={() => router.push('/events/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>

      {/* Messages */}
      {message && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {message}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Events</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Search by title, description, site, or activity type..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Events Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Events ({pagination.total})
          </CardTitle>
          <CardDescription>
            Manage and organize community events and activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <Button
                          variant="ghost"
                          className="h-auto p-0 font-semibold"
                          onClick={() => handleSort('title')}
                        >
                          Title {getSortIcon('title')}
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          className="h-auto p-0 font-semibold"
                          onClick={() => handleSort('eventDate')}
                        >
                          Date {getSortIcon('eventDate')}
                        </Button>
                      </TableHead>
                      <TableHead>Site</TableHead>
                      <TableHead>Activity Type</TableHead>
                      <TableHead>Organizer</TableHead>
                      <TableHead>Participants</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map(event => (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-medium">{event.title}</div>
                            {event.eventIsYouthFocused && (
                              <Badge
                                variant="secondary"
                                className="text-xs mt-1"
                              >
                                Youth Focused
                              </Badge>
                            )}
                          </div>
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
                        <TableCell>
                          <div className="text-sm">
                            <div>New: {event.newParticipants}</div>
                            <div>Returning: {event.returningParticipants}</div>
                            <div className="font-medium">
                              Total:{' '}
                              {event.newParticipants +
                                event.returningParticipants}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{event.eventDuration} min</div>
                            {event.adminDuration > 0 && (
                              <div className="text-muted-foreground">
                                +{event.adminDuration} admin
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">
                            ${event.totalCost}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/events/${event.id}`)}
                              title="View event"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                router.push(`/admin/events/${event.id}/edit`)
                              }
                              title="Edit event"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDeleteEvent(event)}
                              title="Delete event"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {pagination.page} of {pagination.pages} (
                    {pagination.total} total)
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        fetchEvents(
                          pagination.page - 1,
                          search,
                          sortField,
                          sortOrder
                        )
                      }
                      disabled={pagination.page <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        fetchEvents(
                          pagination.page + 1,
                          search,
                          sortField,
                          sortOrder
                        )
                      }
                      disabled={pagination.page >= pagination.pages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Event Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this event? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          {deletingEvent && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="text-sm text-red-800">
                  <p>
                    <strong>Event:</strong> {deletingEvent.title}
                  </p>
                  <p>
                    <strong>Date:</strong> {formatDate(deletingEvent.eventDate)}
                  </p>
                  <p>
                    <strong>Site:</strong> {deletingEvent.siteName}
                  </p>
                  <p>
                    <strong>Organizer:</strong> {deletingEvent.userName}
                  </p>
                  <p>
                    <strong>Participants:</strong>{' '}
                    {deletingEvent.newParticipants +
                      deletingEvent.returningParticipants}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDeleteOpen(false)}
                  disabled={deleteLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteEvent}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? 'Deleting...' : 'Delete Event'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
