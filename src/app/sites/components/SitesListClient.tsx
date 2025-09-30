// app/sites/components/SitesListClient.tsx
'use client';
import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
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
import {
  Search,
  MapPin,
  Users,
  Building2,
  Eye,
  Edit,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Filter,
} from 'lucide-react';

interface Site {
  id: string;
  name: string;
  address: string;
  numberOfTenants: number;
  hasCommunityPartner: boolean;
  communityPartnerName: string | null;
  userName: string;
  isSingleSeniorOnly?: boolean;
  hasCommunityRoom?: boolean;
  userId?: string;
}

interface OrganizerOption {
  id: string;
  name: string;
}

interface InitialFilters {
  search: string;
  page: number;
  isSingleSeniorOnly: 'true' | 'false' | 'all';
  hasCommunityRoom: 'true' | 'false' | 'all';
  userId: string; // 'all' or id
}

interface SitesListClientProps {
  initialSites: Site[];
  initialFilters: InitialFilters;
  totalCount: number;
  isAdmin: boolean;
  filterOptions: { organizers: OrganizerOption[] };
}

export default function SitesListClient({
  initialSites,
  initialFilters,
  totalCount,
  isAdmin,
  filterOptions,
}: SitesListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchText, setSearchText] = useState(initialFilters.search);
  const [currentPage, setCurrentPage] = useState(initialFilters.page);
  const [filterSeniorOnly, setFilterSeniorOnly] = useState<
    'true' | 'false' | 'all'
  >(initialFilters.isSingleSeniorOnly);
  const [filterCommunityRoom, setFilterCommunityRoom] = useState<
    'true' | 'false' | 'all'
  >(initialFilters.hasCommunityRoom);
  const [filterUserId, setFilterUserId] = useState<string>(
    initialFilters.userId || 'all'
  );

  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));

  const updateURL = (updates: Partial<InitialFilters>) => {
    const params = new URLSearchParams(searchParams);

    if (updates.search !== undefined) {
      if (updates.search) params.set('search', updates.search);
      else params.delete('search');
    }

    if (updates.isSingleSeniorOnly !== undefined) {
      if (updates.isSingleSeniorOnly !== 'all')
        params.set('isSingleSeniorOnly', updates.isSingleSeniorOnly);
      else params.delete('isSingleSeniorOnly');
    }

    if (updates.hasCommunityRoom !== undefined) {
      if (updates.hasCommunityRoom !== 'all')
        params.set('hasCommunityRoom', updates.hasCommunityRoom);
      else params.delete('hasCommunityRoom');
    }

    if (updates.userId !== undefined) {
      if (updates.userId && updates.userId !== 'all')
        params.set('userId', updates.userId);
      else params.delete('userId');
    }

    if (updates.page !== undefined) {
      if (updates.page > 1) params.set('page', String(updates.page));
      else params.delete('page');
    }

    router.push(`/sites?${params.toString()}`);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    setCurrentPage(1);
    updateURL({ search: value, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateURL({ page });
  };

  const handleSeniorOnlyChange = (value: 'true' | 'false' | 'all') => {
    setFilterSeniorOnly(value);
    setCurrentPage(1);
    updateURL({ isSingleSeniorOnly: value, page: 1 });
  };

  const handleCommunityRoomChange = (value: 'true' | 'false' | 'all') => {
    setFilterCommunityRoom(value);
    setCurrentPage(1);
    updateURL({ hasCommunityRoom: value, page: 1 });
  };

  const handleUserChange = (value: string) => {
    setFilterUserId(value);
    setCurrentPage(1);
    updateURL({ userId: value, page: 1 });
  };

  const clearFilters = () => {
    setSearchText('');
    setFilterSeniorOnly('all');
    setFilterCommunityRoom('all');
    setFilterUserId('all');
    setCurrentPage(1);
    router.push('/sites');
  };

  const activeFiltersCount = [
    Boolean(searchText),
    filterSeniorOnly !== 'all',
    filterCommunityRoom !== 'all',
    filterUserId !== 'all',
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sites</h1>
            <p className="text-muted-foreground">Browse all locations</p>
          </div>
          <Link href="/sites/new">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create New Site
            </Button>
          </Link>
        </div>

        {/* Search & Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by site name, address, or partner..."
                  value={searchText}
                  onChange={e => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Senior Only */}
              <Select
                value={filterSeniorOnly}
                onValueChange={handleSeniorOnlyChange}
              >
                <SelectTrigger className="w-full lg:w-52">
                  <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Senior-Only" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Residencies</SelectItem>
                  <SelectItem value="true">Single Seniors Only</SelectItem>
                  <SelectItem value="false">Mixed Tenancy</SelectItem>
                </SelectContent>
              </Select>

              {/* Community Room */}
              <Select
                value={filterCommunityRoom}
                onValueChange={handleCommunityRoomChange}
              >
                <SelectTrigger className="w-full lg:w-56">
                  <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Community Room" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Room Options</SelectItem>
                  <SelectItem value="true">Has Community Room</SelectItem>
                  <SelectItem value="false">No Community Room</SelectItem>
                </SelectContent>
              </Select>

              {/* Assigned Staff (only owners, supplied from server) */}
              <Select value={filterUserId} onValueChange={handleUserChange}>
                <SelectTrigger className="w-full lg:w-56">
                  <UserCheck className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Assigned Staff" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Staff</SelectItem>
                  {filterOptions.organizers.map(u => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {activeFiltersCount > 0 && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear ({activeFiltersCount})
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          Showing {totalCount} site{totalCount !== 1 ? 's' : ''}
        </div>

        {/* Sites List (row cards) */}
        {initialSites.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No sites found</h3>
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
            {initialSites.map(site => (
              <Card key={site.id} className="hover:shadow-sm transition-shadow">
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          {site.name}
                        </h3>
                        {site.hasCommunityPartner &&
                          site.communityPartnerName && (
                            <Badge
                              variant="secondary"
                              className="text-xs shrink-0"
                            >
                              {site.communityPartnerName}
                            </Badge>
                          )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate max-w-[22ch] md:max-w-xs">
                            {site.address}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {site.numberOfTenants}{' '}
                          {site.numberOfTenants === 1 ? 'tenant' : 'tenants'}
                        </div>
                        <div className="flex items-center gap-1">
                          <UserCheck className="h-3 w-3" />
                          {site.userName}
                        </div>
                        {/* Removed badges for isSingleSeniorOnly and hasCommunityRoom as requested */}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Link href={`/sites/${site.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      {isAdmin && (
                        <>
                          <Link href={`/admin/sites/${site.id}/edit`}>
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
                let pageNum: number;
                if (totalPages <= 7) pageNum = i + 1;
                else if (currentPage <= 4) pageNum = i + 1;
                else if (currentPage >= totalPages - 3)
                  pageNum = totalPages - 6 + i;
                else pageNum = currentPage - 3 + i;

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
}
