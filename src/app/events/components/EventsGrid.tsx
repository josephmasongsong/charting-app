// app/events/components/EventsGrid.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Eye,
  MapPin,
  Activity,
  Users,
  UserCheck,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

interface Event {
  id: string;
  title: string;
  eventDate: string;
  activityTypeName: string | null;
  siteName: string | null;
  userName: string | null;
  newParticipants: number;
  returningParticipants: number;
  eventIsYouthFocused: boolean;
}

interface EventsGridProps {
  events: Event[];
  currentPage: number;
  totalPages: number;
  search: string;
}

export default function EventsGrid({
  events,
  currentPage,
  totalPages,
  search,
}: EventsGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAdmin = true; // This should come from your auth context/session

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (eventDate: string) => {
    const today = new Date();
    const eventDateObj = new Date(eventDate);

    if (eventDateObj < today) {
      return (
        <Badge
          variant="outline"
          className="text-green-700 border-green-300 bg-green-50"
        >
          Completed
        </Badge>
      );
    } else {
      return (
        <Badge
          variant="outline"
          className="text-blue-700 border-blue-300 bg-blue-50"
        >
          Upcoming
        </Badge>
      );
    }
  };

  const getTotalParticipants = (event: Event) => {
    return event.newParticipants + event.returningParticipants;
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    if (newPage > 1) {
      params.set('page', newPage.toString());
    } else {
      params.delete('page');
    }

    const queryString = params.toString();
    router.push(`/events${queryString ? `?${queryString}` : ''}`);
  };

  return (
    <>
      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(event => (
          <Card
            key={event.id}
            className="hover:shadow-md transition-shadow duration-200"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg leading-tight">
                  {event.title}
                </CardTitle>
                {event.eventIsYouthFocused && (
                  <Badge variant="secondary" className="text-xs shrink-0">
                    Youth
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <CardDescription className="text-sm">
                    {formatDate(event.eventDate)}
                  </CardDescription>
                </div>
                {getStatusBadge(event.eventDate)}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Activity className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {event.activityTypeName || 'Unknown Activity'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {event.siteName || 'Unknown Site'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {getTotalParticipants(event)} participants
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <UserCheck className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {event.userName || 'Unknown Organizer'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t">
                <Link href={`/events/${event.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </Link>
                {isAdmin && (
                  <>
                    <Link href={`/events/${event.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        // Handle delete - you can implement this
                        console.log('Delete event:', event.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
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
                      onClick={() => handlePageChange(pageNum)}
                      className="w-10"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
