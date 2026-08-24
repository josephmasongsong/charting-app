'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Loader2,
  PenLine,
} from 'lucide-react';
import { cn } from '@/lib/utils';

import DeleteSiteDialog from './DeleteSiteDialog';
import BooleanBadge from './BooleanBadge';

interface Site {
  id: string;
  name: string;
  latitude: string;
  longitude: string;
  address: string;
  numberOfTenants: number;
  hasCommunityRoom: boolean;
  hasCommunityPartner: boolean;
  communityPartnerId: string | null;
  communityPartnerName: string | null;
  isSingleSeniorOnly: boolean;
  userId: string;
  userName: string;
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

// Dense government-software table treatment — the reference for every admin
// table: teal header band, full cell grid, zebra rows, selection-blue hover.
const headCellClass =
  'h-auto whitespace-nowrap border border-[#0a7276] bg-(--surface-chrome) px-3.5 py-2.5 text-left text-xs font-bold tracking-[.04em] text-(--text-on-chrome) uppercase';
const bodyCellClass =
  'whitespace-nowrap border border-(--bch-gray-200) px-3.5 py-[9px]';
const bodyRowClass =
  'border-0 even:bg-(--surface-muted) hover:bg-(--action-selected)';
const rowActionClass =
  'size-8 rounded-(--radius-control) text-(--action-primary) hover:bg-(--action-selected) hover:text-(--action-primary)';
const destructiveActionClass =
  'size-8 rounded-(--radius-control) text-(--danger) hover:bg-(--danger-surface) hover:text-(--danger)';
const pagerButtonClass =
  'h-8 rounded-(--radius-control) border-(--border-default) bg-(--surface-card) text-[13.5px] text-(--action-primary) shadow-none hover:bg-(--action-selected) hover:text-(--action-primary) disabled:border-(--bch-gray-300) disabled:text-(--bch-gray-500) disabled:opacity-100';
const pagerActiveClass =
  'h-8 rounded-(--radius-control) border border-(--action-primary) bg-(--action-primary) text-[13.5px] text-(--text-on-chrome) shadow-none hover:bg-(--action-primary-hover)';
const alertClass = 'border-y-0 border-r-0 px-3.5 py-3';
const successAlertClass =
  'rounded-[2px] border-l-[5px] border-l-(--success) bg-[var(--bch-green-50,#EDF6EF)] text-foreground';

export default function SitesTable() {
  const router = useRouter();
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'createdAt',
    order: 'desc',
  });
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // Delete site state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingSite, setDeletingSite] = useState<Site | null>(null);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Fetch sites
  const fetchSites = useCallback(
    async (page = 1, searchTerm = '', sort = sortConfig) => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '10',
          sortBy: sort.field,
          sortOrder: sort.order,
          ...(searchTerm && { search: searchTerm }),
        });

        const response = await fetch(`/api/admin/sites?${params}`);
        const data = await response.json();

        if (response.ok) {
          setSites(data.sites);
          setPagination(data.pagination);
          setError('');
        } else {
          setError(data.error || 'Failed to fetch sites');
        }
      } catch (error) {
        setError('Network error occurred');
      } finally {
        setLoading(false);
      }
    },
    [sortConfig]
  );

  useEffect(() => {
    fetchSites();
  }, [fetchSites]);

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
    fetchSites(1, search, sortConfig);
  };

  // Handle sorting
  const handleSort = (field: string) => {
    const newOrder: SortOrder =
      sortConfig.field === field && sortConfig.order === 'asc' ? 'desc' : 'asc';
    const newSortConfig = { field, order: newOrder };
    setSortConfig(newSortConfig);
    fetchSites(pagination.page, search, newSortConfig);
  };

  // Handle delete site
  const openDeleteSite = (site: Site) => {
    setDeletingSite(site);
    setDeleteOpen(true);
  };

  // Refresh data after CRUD operations
  const refreshData = () => {
    fetchSites(pagination.page, search, sortConfig);
  };

  // Handle success/error messages
  const showMessage = (msg: string) => {
    setMessage(msg);
    setError('');
  };

  const showError = (err: string) => {
    setError(err);
    setMessage('');
  };

  const rangeStart =
    pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const rangeEnd = Math.min(
    pagination.page * pagination.limit,
    pagination.total
  );

  return (
    <>
      {/* Messages */}
      {message && (
        <Alert className={cn(alertClass, successAlertClass, 'mb-4')}>
          <AlertDescription className="text-[14px] text-foreground">
            {message}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className={cn(alertClass, 'mb-4')}>
          <AlertDescription className="text-[14px]">{error}</AlertDescription>
        </Alert>
      )}

      {/* Sites Data Table */}
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
              placeholder="Search by name, address, user, or community partner..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-9 rounded-(--radius-control) border-(--border-input) bg-(--surface-card) pl-8 text-sm shadow-none md:text-sm"
            />
          </form>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8 text-(--text-muted)">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading...
          </div>
        ) : (
          <>
            <Table className="min-w-[1080px] border-collapse bg-(--surface-card) text-sm">
              <TableHeader>
                <TableRow className="border-0 hover:bg-transparent">
                  <TableHead className={headCellClass}>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('name')}
                      className="h-auto p-0 text-xs font-bold tracking-[.04em] text-(--text-on-chrome) uppercase hover:bg-transparent hover:text-(--text-on-chrome)"
                    >
                      <span
                        className={
                          sortConfig.field === 'name'
                            ? 'font-extrabold'
                            : 'opacity-85'
                        }
                      >
                        Name
                      </span>
                      {sortConfig.field === 'name' ? (
                        sortConfig.order === 'asc' ? (
                          <ChevronUp className="ml-1.5 h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="ml-1.5 h-3.5 w-3.5" />
                        )
                      ) : (
                        <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 opacity-55" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead className={headCellClass}>Address</TableHead>
                  <TableHead className={headCellClass}>Tenants</TableHead>
                  <TableHead className={headCellClass}>
                    Assigned Worker
                  </TableHead>
                  <TableHead className={headCellClass}>
                    Community Room
                  </TableHead>
                  <TableHead className={headCellClass}>
                    Community Partner
                  </TableHead>
                  <TableHead className={headCellClass}>Senior Only</TableHead>
                  <TableHead className={cn(headCellClass, 'text-right')}>
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sites.length === 0 ? (
                  <TableRow className="border-0 hover:bg-transparent">
                    <TableCell
                      colSpan={8}
                      className={cn(
                        bodyCellClass,
                        'py-10 text-center whitespace-normal text-(--text-muted)'
                      )}
                    >
                      {search ? (
                        <>
                          No sites found matching &quot;{search}&quot;.
                          <Button
                            variant="link"
                            onClick={() => {
                              setSearch('');
                              fetchSites(1, '', sortConfig);
                            }}
                            className="ml-2 text-(--action-primary)"
                          >
                            Clear search
                          </Button>
                        </>
                      ) : (
                        'No sites found.'
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  sites.map(site => (
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
                        <Badge
                          variant="outline"
                          className="flex w-fit items-center gap-1 rounded-(--radius-control) border-(--border-default) text-(--text-body)"
                        >
                          <Users className="h-3 w-3" />
                          {site.numberOfTenants}
                        </Badge>
                      </TableCell>
                      <TableCell className={bodyCellClass}>
                        <div className="text-sm">{site.userName}</div>
                      </TableCell>
                      <TableCell className={bodyCellClass}>
                        <BooleanBadge
                          value={site.hasCommunityRoom}
                          trueText="Yes"
                          falseText="No"
                        />
                      </TableCell>
                      <TableCell className={bodyCellClass}>
                        <BooleanBadge
                          value={site.hasCommunityPartner}
                          trueText="Yes"
                          falseText="No"
                        />
                      </TableCell>
                      <TableCell className={bodyCellClass}>
                        <BooleanBadge
                          value={site.isSingleSeniorOnly}
                          trueText="Yes"
                          falseText="No"
                        />
                      </TableCell>
                      <TableCell className={cn(bodyCellClass, 'text-right')}>
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              router.push(`/admin/sites/${site.id}/edit`)
                            }
                            title="Edit site"
                            aria-label="Edit site"
                            className={rowActionClass}
                          >
                            <PenLine className="size-[17px]" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteSite(site)}
                            title="Delete site"
                            aria-label="Delete site"
                            className={destructiveActionClass}
                          >
                            <Trash2 className="size-[17px]" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-3.5">
              <div className="text-[13.5px] text-(--text-muted)">
                {pagination.total === 0
                  ? 'No results'
                  : pagination.pages > 1
                    ? `Showing ${rangeStart} to ${rangeEnd} of ${pagination.total} results`
                    : `Showing all ${pagination.total} results`}
              </div>

              {pagination.pages > 1 && (
                <div className="flex items-center gap-1.5">
                  {/* First page */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchSites(1, search, sortConfig)}
                    disabled={pagination.page <= 1}
                    className={cn(pagerButtonClass, 'hidden sm:inline-flex')}
                  >
                    First
                  </Button>

                  {/* Previous page */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      fetchSites(pagination.page - 1, search, sortConfig)
                    }
                    disabled={pagination.page <= 1}
                    className={pagerButtonClass}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="ml-1 hidden sm:inline">Previous</span>
                  </Button>

                  {/* Page numbers */}
                  <div className="flex items-center gap-1">
                    {(() => {
                      const pages = [];
                      const currentPage = pagination.page;
                      const totalPages = pagination.pages;

                      // Always show first page
                      if (currentPage > 3) {
                        pages.push(
                          <Button
                            key={1}
                            variant={1 === currentPage ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => fetchSites(1, search, sortConfig)}
                            className={cn(
                              'w-10',
                              1 === currentPage
                                ? pagerActiveClass
                                : pagerButtonClass
                            )}
                          >
                            1
                          </Button>
                        );

                        if (currentPage > 4) {
                          pages.push(
                            <span
                              key="ellipsis1"
                              className="px-1 text-[13.5px] text-(--text-muted)"
                            >
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
                            variant={i === currentPage ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => fetchSites(i, search, sortConfig)}
                            className={cn(
                              'w-10',
                              i === currentPage
                                ? pagerActiveClass
                                : pagerButtonClass
                            )}
                          >
                            {i}
                          </Button>
                        );
                      }

                      // Always show last page
                      if (currentPage < totalPages - 2) {
                        if (currentPage < totalPages - 3) {
                          pages.push(
                            <span
                              key="ellipsis2"
                              className="px-1 text-[13.5px] text-(--text-muted)"
                            >
                              ...
                            </span>
                          );
                        }

                        pages.push(
                          <Button
                            key={totalPages}
                            variant={
                              totalPages === currentPage ? 'default' : 'outline'
                            }
                            size="sm"
                            onClick={() =>
                              fetchSites(totalPages, search, sortConfig)
                            }
                            className={cn(
                              'w-10',
                              totalPages === currentPage
                                ? pagerActiveClass
                                : pagerButtonClass
                            )}
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
                      fetchSites(pagination.page + 1, search, sortConfig)
                    }
                    disabled={pagination.page >= pagination.pages}
                    className={pagerButtonClass}
                  >
                    <span className="mr-1 hidden sm:inline">Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>

                  {/* Last page */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      fetchSites(pagination.pages, search, sortConfig)
                    }
                    disabled={pagination.page >= pagination.pages}
                    className={cn(pagerButtonClass, 'hidden sm:inline-flex')}
                  >
                    Last
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Delete Site Dialog */}
      <DeleteSiteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        site={deletingSite}
        onSuccess={showMessage}
        onError={showError}
        onRefresh={refreshData}
      />
    </>
  );
}
