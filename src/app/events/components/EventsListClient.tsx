// app/events/components/EventsListClient.tsx
'use client';
import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from 'lucide-react';
import { Users } from 'lucide-react';
import { MapPin } from 'lucide-react';
import { Activity } from 'lucide-react';
import { Search } from 'lucide-react';
import { X } from 'lucide-react';
import { Trash2 } from 'lucide-react';
import { Edit } from 'lucide-react';
import { Eye } from 'lucide-react';
import { Copy } from 'lucide-react';
import { ChevronLeft } from 'lucide-react';
import { ChevronRight } from 'lucide-react';
import { UserCheck } from 'lucide-react';
import Link from 'next/link';
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

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Events</h1>
            <p className="text-muted-foreground">Browse all community events</p>
          </div>
          <Link href="/events/new">
            <Button className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Log New Event
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title..."
                  value={searchTitle}
                  onChange={e => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <Select
                value={filterActivityType}
                onValueChange={handleActivityTypeChange}
              >
                <SelectTrigger className="w-48">
                  <Activity className="h-4 w-4 mr-2 text-muted-foreground" />
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

              <Select value={filterSite} onValueChange={handleSiteChange}>
                <SelectTrigger className="w-48">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
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
                onValueChange={handleOrganizerChange}
              >
                <SelectTrigger className="w-48">
                  <UserCheck className="h-4 w-4 mr-2 text-muted-foreground" />
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
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          Showing {totalCount} event{totalCount !== 1 ? 's' : ''}
        </div>

        {/* Events List */}
        {initialEvents.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No events found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Try adjusting your search or filters
              </p>
              {activeFiltersCount > 0 && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear all filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {initialEvents.map(event => (
              <Card
                key={event.id}
                className="hover:shadow-sm transition-shadow"
              >
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">
                          {event.title}
                        </h3>
                        {event.eventIsYouthFocused && (
                          <Badge
                            variant="secondary"
                            className="text-xs shrink-0"
                          >
                            Youth
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(event.eventDate)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Activity className="h-3 w-3" />
                          {event.activityTypeName}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.siteName}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {event.totalParticipants} participants
                        </div>
                        <div className="flex items-center gap-1">
                          <UserCheck className="h-3 w-3" />
                          {event.organizerName}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Link href={`/events/${event.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
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
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <DuplicateEventDialog
                        eventId={event.id}
                        eventTitle={event.title}
                        trigger={
                          <Button variant="outline" size="sm">
                            <Copy className="h-4 w-4" />
                          </Button>
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
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
              onClick={() =>
                handlePageChange(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsListClient;
