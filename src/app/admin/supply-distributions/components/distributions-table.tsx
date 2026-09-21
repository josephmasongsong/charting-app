'use client';

import {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { Button } from '@/components/ui/button';
import { listSelectTriggerClass } from '@/components/ui/list-controls';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { PaginationFooter } from '@/components/ui/pagination-footer';
import { DirectoryRow } from '@/components/ui/directory-row';
import { RowActions } from '@/components/ui/row-actions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Truck } from 'lucide-react';
import { cn } from '@/lib/utils';

import { useRouter } from 'next/navigation';

import DeleteDistributionDialog from './delete-distribution-dialog';
import { DISTRIBUTION_TYPES } from '@/lib/distribution-types';

interface Distribution {
  id: string;
  eventId: string | null;
  eventTitle: string | null;
  siteId: string;
  siteName: string;
  userId: string;
  userName: string;
  distributionDate: string;
  distributionType: string;
  totalCost: string;
  notes: string | null;
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

interface FilterConfig {
  siteId?: string;
  distributionType?: string;
  userId?: string;
}

interface DistributionsTableProps {
  message?: string;
  error?: string;
  onClearMessage?: () => void;
  onClearError?: () => void;
  onSuccess: (message: string) => void;
  onError: (error: string) => void;
  onRefresh: () => void;
}

export interface DistributionsTableRef {
  refreshData: () => void;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const alertClass = 'border-y-0 border-r-0 px-3.5 py-3';
const successAlertClass =
  'rounded-[2px] border-l-[5px] border-l-(--success) bg-[var(--bch-green-50,#EDF6EF)] text-foreground';
// Same hard-colour tile as the sites index.
const rowTileClass =
  'grid size-11 shrink-0 place-items-center rounded-(--radius-avatar) bg-(--bch-teal-600) text-white';

const DistributionsTable = forwardRef<
  DistributionsTableRef,
  DistributionsTableProps
>(
  (
    {
      message,
      error,
      onClearMessage,
      onClearError,
      onSuccess,
      onError,
      onRefresh,
    },
    ref
  ) => {
    const router = useRouter();
    const [distributions, setDistributions] = useState<Distribution[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState<SortConfig>({
      field: 'distributionDate',
      order: 'desc',
    });
    const [pagination, setPagination] = useState<PaginationInfo>({
      page: 1,
      limit: 10,
      total: 0,
      pages: 0,
    });

    // Filter states
    const [siteFilter, setSiteFilter] = useState('all');
    const [distributionTypeFilter, setDistributionTypeFilter] = useState('all');
    const [userFilter, setUserFilter] = useState('');
    const [sites, setSites] = useState<{ id: string; name: string }[]>([]);

    // Dialog states
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deletingDistribution, setDeletingDistribution] =
      useState<Distribution | null>(null);

    // Internal message/error state for table-specific operations
    const [internalMessage, setInternalMessage] = useState('');
    const [internalError, setInternalError] = useState('');

    const distributionTypeOptions = [
      { value: 'all', label: 'All Types' },
      ...DISTRIBUTION_TYPES,
    ];

    const fetchSites = useCallback(async () => {
      try {
        const response = await fetch('/api/admin/supply-distributions/options');
        const data = await response.json();
        if (response.ok) {
          setSites(data.sites || []);
        }
      } catch (error) {
        console.error('Failed to fetch sites:', error);
      }
    }, []);

    const fetchDistributions = useCallback(
      async (
        page = 1,
        searchTerm = '',
        sort = sortConfig,
        filters: FilterConfig = {}
      ) => {
        try {
          setLoading(true);
          const params = new URLSearchParams({
            page: page.toString(),
            limit: '10',
            sortBy: sort.field,
            sortOrder: sort.order,
            ...(searchTerm && { search: searchTerm }),
            ...(filters.siteId &&
              filters.siteId !== 'all' && { siteId: filters.siteId }),
            ...(filters.distributionType &&
              filters.distributionType !== 'all' && {
                distributionType: filters.distributionType,
              }),
            ...(filters.userId && { userId: filters.userId }),
          });

          const response = await fetch(
            `/api/admin/supply-distributions?${params}`
          );
          const data = await response.json();

          if (response.ok) {
            setDistributions(data.distributions);
            setPagination(data.pagination);
            setInternalError('');
          } else {
            setInternalError(data.error || 'Failed to fetch distributions');
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
        fetchDistributions(pagination.page, '', sortConfig, {
          siteId: siteFilter === 'all' ? '' : siteFilter,
          distributionType: distributionTypeFilter,
          userId: userFilter,
        });
      },
    }));

    useEffect(() => {
      fetchDistributions();
      fetchSites();
    }, [fetchDistributions, fetchSites]);

    const currentFilters = (): FilterConfig => ({
      siteId: siteFilter === 'all' ? '' : siteFilter,
      distributionType: distributionTypeFilter,
      userId: userFilter,
    });


    // Sorting moved from column headers to a Select with the table.
    const handleSortChange = (value: string) => {
      const [field, order] = value.split(':');
      const next = { field, order: order as SortOrder };
      setSortConfig(next);
      fetchDistributions(1, '', next, currentFilters());
    };

    const openDeleteDistribution = (distribution: Distribution) => {
      setDeletingDistribution(distribution);
      setDeleteOpen(true);
    };

    const refreshData = () => {
      fetchDistributions(pagination.page, '', sortConfig, currentFilters());
      onRefresh();
    };

    const showInternalMessage = (msg: string) => {
      setInternalMessage(msg);
      setInternalError('');
      onSuccess(msg);
      setTimeout(() => setInternalMessage(''), 5000);
    };

    const showInternalError = (err: string) => {
      setInternalError(err);
      setInternalMessage('');
      onError(err);
      setTimeout(() => setInternalError(''), 5000);
    };

    // Parent props take precedence over internal state
    const displayMessage = message || internalMessage;
    const displayError = error || internalError;

    const hasFilters =
      distributionTypeFilter !== 'all' ||
      (siteFilter !== '' && siteFilter !== 'all');


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
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-(--border-default) px-5 py-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <Select
                value={distributionTypeFilter}
                onValueChange={value => {
                  setDistributionTypeFilter(value);
                  const filters = {
                    siteId: siteFilter,
                    distributionType: value,
                    userId: userFilter,
                  };
                  fetchDistributions(1, '', sortConfig, filters);
                }}
              >
                <SelectTrigger
                  aria-label="Type"
                  className={cn(listSelectTriggerClass, 'w-48')}
                >
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  {distributionTypeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={siteFilter}
                onValueChange={value => {
                  setSiteFilter(value);
                  const filters = {
                    siteId: value === 'all' ? '' : value,
                    distributionType: distributionTypeFilter,
                    userId: userFilter,
                  };
                  fetchDistributions(1, '', sortConfig, filters);
                }}
              >
                <SelectTrigger
                  aria-label="Site"
                  className={cn(listSelectTriggerClass, 'w-48')}
                >
                  <SelectValue placeholder="Filter by site" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sites</SelectItem>
                  {sites.map(site => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={`${sortConfig.field}:${sortConfig.order}`}
                onValueChange={handleSortChange}
              >
                <SelectTrigger
                  aria-label="Sort by"
                  className={cn(listSelectTriggerClass, 'w-[190px]')}
                >
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="distributionDate:desc">
                    Newest first
                  </SelectItem>
                  <SelectItem value="distributionDate:asc">
                    Oldest first
                  </SelectItem>
                  <SelectItem value="siteName:asc">Site (A–Z)</SelectItem>
                  <SelectItem value="totalCost:desc">
                    Cost (high–low)
                  </SelectItem>
                </SelectContent>
              </Select>

              {hasFilters && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => {
                    setDistributionTypeFilter('all');
                    setSiteFilter('');
                    setUserFilter('');
                    fetchDistributions(1, '', sortConfig, {});
                  }}
                  className="h-auto p-0 text-[13.5px] text-(--action-primary) underline"
                >
                  Clear filters
                </Button>
              )}
            </div>
            <span className="text-[13.5px] text-(--text-muted)">
              {pagination.total} distribution{pagination.total === 1 ? '' : 's'}
            </span>
          </div>

          {loading ? (
            <div className="space-y-2 p-5">
              <Skeleton className="h-10 rounded-none bg-(--bch-gray-200)" />
              {Array.from({ length: 5 }, (_, i) => (
                <Skeleton
                  key={i}
                  className="h-9 rounded-none bg-(--surface-muted)"
                />
              ))}
            </div>
          ) : (
            <>
              <div>
                {distributions.length === 0 ? (
                  <div className="px-4 py-10 text-center text-(--text-muted)">
                    {hasFilters ? (
                      <>
                        No distributions match these filters.{' '}
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => {
                            setDistributionTypeFilter('all');
                            setSiteFilter('');
                            setUserFilter('');
                            fetchDistributions(1, '', sortConfig, {});
                          }}
                          className="h-auto p-0 text-[13.5px] text-(--action-primary) underline"
                        >
                          Clear filters
                        </Button>
                      </>
                    ) : (
                      'No distributions found.'
                    )}
                  </div>
                ) : (
                  distributions.map(distribution => (
                    <DirectoryRow
                      key={distribution.id}
                      leading={
                        <div className={rowTileClass}>
                          <Truck size={19} />
                        </div>
                      }
                      title={distribution.siteName}
                      sub={`${formatDate(distribution.distributionDate)} · ${distribution.userName}`}
                      actions={
                        <RowActions
                          label={`Actions for the ${distribution.siteName} distribution`}
                          actions={[
                            {
                              label: 'View',
                              href: `/supply-distributions/${distribution.id}`,
                            },
                            {
                              label: 'Delete',
                              danger: true,
                              onSelect: () =>
                                openDeleteDistribution(distribution),
                            },
                          ]}
                        />
                      }
                    />
                  ))
                )}
              </div>

              <PaginationFooter
                page={pagination.page}
                pages={pagination.pages}
                total={pagination.total}
                limit={pagination.limit}
                onPageChange={page =>
                  fetchDistributions(page, '', sortConfig, currentFilters())
                }
              />
            </>
          )}
        </div>

        {/* Dialogs */}
        <DeleteDistributionDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          distribution={deletingDistribution}
          onSuccess={showInternalMessage}
          onError={showInternalError}
          onRefresh={refreshData}
        />
      </>
    );
  }
);

DistributionsTable.displayName = 'DistributionsTable';

export default DistributionsTable;
