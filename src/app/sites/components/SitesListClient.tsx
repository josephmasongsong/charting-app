'use client';
import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Building2,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  PenLine,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

const headCellClass =
  'h-auto whitespace-nowrap border border-[#0a7276] bg-(--surface-chrome) px-3.5 py-2.5 text-left text-xs font-bold tracking-[.04em] text-(--text-on-chrome) uppercase';
const bodyCellClass =
  'whitespace-nowrap border border-(--bch-gray-200) px-3.5 py-[9px]';
const bodyRowClass =
  'border-0 even:bg-(--surface-muted) hover:bg-(--action-selected)';
const selectTriggerClass =
  'h-9 rounded-(--radius-control) border-(--border-input) bg-(--surface-card) text-sm shadow-none';
const primaryButtonClass =
  'h-auto rounded-(--radius-control) bg-(--action-primary) px-[18px] py-[9px] text-[15px] font-normal text-(--text-on-chrome) shadow-none hover:bg-(--action-primary-hover)';
const outlineButtonClass =
  'h-8 rounded-(--radius-control) border-(--border-default) bg-(--surface-card) text-[13.5px] text-(--action-primary) shadow-none hover:bg-(--action-selected) hover:text-(--action-primary) disabled:border-(--bch-gray-300) disabled:text-(--bch-gray-500) disabled:opacity-100';
const pagerActiveClass =
  'h-8 rounded-(--radius-control) border border-(--action-primary) bg-(--action-primary) text-[13.5px] text-(--text-on-chrome) shadow-none hover:bg-(--action-primary-hover)';
const rowActionClass =
  'size-8 rounded-(--radius-control) text-(--action-primary) hover:bg-(--action-selected) hover:text-(--action-primary)';
const destructiveActionClass =
  'size-8 rounded-(--radius-control) text-(--danger) hover:bg-(--danger-surface) hover:text-(--danger)';

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

  const rangeStart = totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const rangeEnd = Math.min(currentPage * itemsPerPage, totalCount);

  return (
    <div className="min-h-screen bg-(--surface-page) px-6 pt-6 pb-12">
      <div className="mx-auto max-w-[1280px]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-[30px] leading-tight font-bold tracking-[-.2px]">
              Sites
            </h1>
            <p className="mt-1.5 text-[15px] text-(--text-muted)">
              Browse all locations
            </p>
          </div>
          {/* TODO: /sites — not wired: /sites/new does not exist (creation
              lives at /admin/sites/new, admin-only); target kept as-is. */}
          <Button asChild className={primaryButtonClass}>
            <Link href="/sites/new">
              <Plus className="h-4 w-4" />
              Create New Site
            </Link>
          </Button>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 rounded-(--radius-card) border border-(--border-default) bg-(--surface-card) px-4 py-3.5">
          <div className="relative min-w-60 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-(--bch-gray-500)" />
            <Input
              placeholder="Search by site name, address, or partner..."
              value={searchText}
              onChange={e => handleSearch(e.target.value)}
              className="h-9 rounded-(--radius-control) border-(--border-input) bg-(--surface-card) pl-8 text-sm shadow-none md:text-sm"
            />
          </div>

          <Select
            value={filterSeniorOnly}
            onValueChange={handleSeniorOnlyChange}
          >
            <SelectTrigger
              aria-label="Senior-Only"
              className={cn(selectTriggerClass, 'w-full lg:w-48')}
            >
              <SelectValue placeholder="Senior-Only" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Residencies</SelectItem>
              <SelectItem value="true">Single Seniors Only</SelectItem>
              <SelectItem value="false">Mixed Tenancy</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filterCommunityRoom}
            onValueChange={handleCommunityRoomChange}
          >
            <SelectTrigger
              aria-label="Community Room"
              className={cn(selectTriggerClass, 'w-full lg:w-52')}
            >
              <SelectValue placeholder="Community Room" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Room Options</SelectItem>
              <SelectItem value="true">Has Community Room</SelectItem>
              <SelectItem value="false">No Community Room</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterUserId} onValueChange={handleUserChange}>
            <SelectTrigger
              aria-label="Assigned Staff"
              className={cn(selectTriggerClass, 'w-full lg:w-52')}
            >
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
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className={outlineButtonClass}
            >
              Clear ({activeFiltersCount})
            </Button>
          )}
        </div>

        <div className="mt-4 overflow-hidden rounded-(--radius-card) border border-(--border-default) bg-(--surface-card) shadow-(--shadow-card)">
          {initialSites.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="No sites found"
              description="Try adjusting your search or filters"
              action={
                activeFiltersCount > 0
                  ? { label: 'Clear all filters', onClick: clearFilters }
                  : undefined
              }
              className="border-0"
            />
          ) : (
            <Table className="min-w-[900px] border-collapse bg-(--surface-card) text-sm">
              <TableHeader>
                <TableRow className="border-0 hover:bg-transparent">
                  <TableHead className={headCellClass}>Name</TableHead>
                  <TableHead className={headCellClass}>Address</TableHead>
                  <TableHead className={headCellClass}>Tenants</TableHead>
                  <TableHead className={headCellClass}>
                    Assigned Worker
                  </TableHead>
                  <TableHead className={headCellClass}>
                    Community Partner
                  </TableHead>
                  {isAdmin && (
                    <TableHead className={cn(headCellClass, 'text-right')}>
                      Actions
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {initialSites.map(site => (
                  <TableRow key={site.id} className={bodyRowClass}>
                    <TableCell className={cn(bodyCellClass, 'font-bold')}>
                      <Link
                        href={`/sites/${site.id}`}
                        className="text-(--text-body) hover:text-(--action-primary) hover:underline"
                      >
                        {site.name}
                      </Link>
                    </TableCell>
                    <TableCell
                      className={cn(bodyCellClass, 'text-(--text-muted)')}
                    >
                      <div
                        className="max-w-[220px] truncate"
                        title={site.address}
                      >
                        {site.address}
                      </div>
                    </TableCell>
                    <TableCell className={bodyCellClass}>
                      {site.numberOfTenants}{' '}
                      {site.numberOfTenants === 1 ? 'tenant' : 'tenants'}
                    </TableCell>
                    <TableCell className={bodyCellClass}>
                      {site.userName}
                    </TableCell>
                    <TableCell className={bodyCellClass}>
                      {site.hasCommunityPartner && site.communityPartnerName ? (
                        <Badge
                          variant="secondary"
                          className="rounded-(--radius-control) border-transparent bg-(--action-selected) text-xs font-semibold text-(--action-primary)"
                        >
                          {site.communityPartnerName}
                        </Badge>
                      ) : (
                        <span className="text-(--text-muted)">—</span>
                      )}
                    </TableCell>
                    {isAdmin && (
                      <TableCell className={cn(bodyCellClass, 'text-right')}>
                        <div className="flex justify-end gap-1">
                          <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            className={rowActionClass}
                          >
                            <Link
                              href={`/admin/sites/${site.id}/edit`}
                              aria-label="Edit site"
                              title="Edit site"
                            >
                              <PenLine className="size-[17px]" />
                            </Link>
                          </Button>
                          {/* TODO: /sites — not wired: delete has no handler;
                              DeleteSiteDialog is only wired into /admin/sites. */}
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Delete site"
                            title="Delete site"
                            className={destructiveActionClass}
                          >
                            <Trash2 className="size-[17px]" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-3.5">
            <span className="text-[13.5px] text-(--text-muted)">
              {totalCount === 0
                ? 'No results'
                : totalPages > 1
                  ? `Showing ${rangeStart} to ${rangeEnd} of ${totalCount} site${totalCount !== 1 ? 's' : ''}`
                  : `Showing ${totalCount} site${totalCount !== 1 ? 's' : ''}`}
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
                    let pageNum: number;
                    if (totalPages <= 7) pageNum = i + 1;
                    else if (currentPage <= 4) pageNum = i + 1;
                    else if (currentPage >= totalPages - 3)
                      pageNum = totalPages - 6 + i;
                    else pageNum = currentPage - 3 + i;

                    return (
                      <Button
                        key={pageNum}
                        variant={
                          currentPage === pageNum ? 'default' : 'outline'
                        }
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
}
