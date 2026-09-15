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
import { Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

import { useRouter } from 'next/navigation';

import DeleteReferralDialog from './delete-referral-dialog';
import { CHANNELS, REFERRED_TO } from '@/lib/referral-options';

interface Referral {
  id: string;
  siteId: string;
  siteName: string;
  userId: string;
  userName: string;
  referralDate: string;
  channel: string;
  referredTo: string;
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

interface ReferralStats {
  totalReferrals: number;
  inPerson: number;
  phoneCall: number;
  email: number;
}

interface FilterConfig {
  siteId?: string;
  channel?: string;
  referredTo?: string;
}

interface ReferralsTableProps {
  message?: string;
  error?: string;
  onClearMessage?: () => void;
  onClearError?: () => void;
  onSuccess: (message: string) => void;
  onError: (error: string) => void;
  onRefresh: () => void;
}

export interface ReferralsTableRef {
  refreshData: () => void;
}

// referral_date is a DATE column serialised as YYYY-MM-DD; parse the parts to
// avoid the UTC shift that new Date(dateString) introduces.
const formatDate = (dateString: string): string => {
  const [y, m, d] = dateString.slice(0, 10).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
};

const alertClass = 'border-y-0 border-r-0 px-3.5 py-3';
const successAlertClass =
  'rounded-[2px] border-l-[5px] border-l-(--success) bg-[var(--bch-green-50,#EDF6EF)] text-foreground';
// Same hard-colour tile as the sites index.
const rowTileClass =
  'grid size-11 shrink-0 place-items-center rounded-(--radius-avatar) bg-(--bch-teal-600) text-white';
const statTileClass =
  'rounded-(--radius-card) border border-(--border-default) border-t-[3px] bg-(--surface-card) px-4 py-3.5';
const statLabelClass =
  'text-[11.5px] font-bold tracking-[.7px] text-(--text-muted) uppercase';
const statValueClass = 'mt-1 text-[28px] leading-[1.2] font-bold';

const ReferralsTable = forwardRef<ReferralsTableRef, ReferralsTableProps>(
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

    const [referrals, setReferrals] = useState<Referral[]>([]);
    const [sites, setSites] = useState<Array<{ id: string; name: string }>>([]);
    const [stats, setStats] = useState<ReferralStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<PaginationInfo>({
      page: 1,
      limit: 10,
      total: 0,
      pages: 0,
    });
    const [sortConfig, setSortConfig] = useState<SortConfig>({
      field: 'referralDate',
      order: 'desc',
    });

    const [channelFilter, setChannelFilter] = useState('all');
    const [referredToFilter, setReferredToFilter] = useState('all');
    const [siteFilter, setSiteFilter] = useState('all');

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deletingReferral, setDeletingReferral] = useState<Referral | null>(
      null
    );

    const [internalMessage, setInternalMessage] = useState('');
    const [internalError, setInternalError] = useState('');

    const channelOptions = [{ value: 'all', label: 'All Channels' }, ...CHANNELS];
    const referredToOptions = [
      { value: 'all', label: 'All Destinations' },
      ...REFERRED_TO,
    ];

    const fetchSites = useCallback(async () => {
      try {
        const response = await fetch('/api/referrals/options');
        if (response.ok) {
          const data = await response.json();
          setSites(data.sites || []);
        }
      } catch (err) {
        console.error('Failed to fetch sites:', err);
      }
    }, []);

    const fetchReferrals = useCallback(
      async (
        page = 1,
        searchTerm = '',
        sort: SortConfig = { field: 'referralDate', order: 'desc' },
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
            ...(filters.channel &&
              filters.channel !== 'all' && { channel: filters.channel }),
            ...(filters.referredTo &&
              filters.referredTo !== 'all' && {
                referredTo: filters.referredTo,
              }),
          });

          const response = await fetch(`/api/referrals?${params}`);

          if (!response.ok) {
            throw new Error('Failed to fetch referrals');
          }

          const data = await response.json();
          setReferrals(data.referrals || []);
          setPagination(
            data.pagination || { page: 1, limit: 10, total: 0, pages: 0 }
          );
          setStats(data.stats || null);
        } catch (err) {
          console.error('Failed to fetch referrals:', err);
          onError('Failed to load referrals');
        } finally {
          setLoading(false);
        }
      },
      [onError]
    );

    const currentFilters = (): FilterConfig => ({
      siteId: siteFilter,
      channel: channelFilter,
      referredTo: referredToFilter,
    });

    useImperativeHandle(ref, () => ({
      refreshData: () => {
        fetchReferrals(pagination.page, '', sortConfig, {
          siteId: siteFilter,
          channel: channelFilter,
          referredTo: referredToFilter,
        });
      },
    }));

    useEffect(() => {
      fetchReferrals();
      fetchSites();
    }, [fetchReferrals, fetchSites]);


    // Sorting moved from column headers to a Select with the table.
    const handleSortChange = (value: string) => {
      const [field, order] = value.split(':');
      const next = { field, order: order as SortOrder };
      setSortConfig(next);
      fetchReferrals(1, '', next, currentFilters());
    };

    const openDeleteReferral = (referral: Referral) => {
      setDeletingReferral(referral);
      setDeleteOpen(true);
    };

    const refreshData = () => {
      fetchReferrals(pagination.page, '', sortConfig, currentFilters());
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
      channelFilter !== 'all' ||
      referredToFilter !== 'all' ||
      siteFilter !== 'all';

    const clearFilters = () => {
      setChannelFilter('all');
      setReferredToFilter('all');
      setSiteFilter('all');
      fetchReferrals(1, '', sortConfig, {});
    };


    return (
      <>
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

        <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className={cn(statTileClass, 'border-t-(--surface-chrome)')}>
            <div className={statLabelClass}>Total referrals</div>
            <div className={statValueClass}>
              {(stats?.totalReferrals ?? pagination.total).toLocaleString()}
            </div>
          </div>
          <div className={cn(statTileClass, 'border-t-(--action-primary)')}>
            <div className={statLabelClass}>In person</div>
            <div className={cn(statValueClass, !stats && 'text-(--text-muted)')}>
              {stats ? stats.inPerson.toLocaleString() : '—'}
            </div>
          </div>
          <div className={cn(statTileClass, 'border-t-(--bch-seafoam)')}>
            <div className={statLabelClass}>Phone call</div>
            <div className={cn(statValueClass, !stats && 'text-(--text-muted)')}>
              {stats ? stats.phoneCall.toLocaleString() : '—'}
            </div>
          </div>
          <div className={cn(statTileClass, 'border-t-(--bch-gold-500)')}>
            <div className={statLabelClass}>Email</div>
            <div className={cn(statValueClass, !stats && 'text-(--text-muted)')}>
              {stats ? stats.email.toLocaleString() : '—'}
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-(--radius-card) border border-(--border-default) bg-(--surface-card) shadow-(--shadow-card)">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-(--border-default) px-5 py-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <Select
                value={channelFilter}
                onValueChange={value => {
                  setChannelFilter(value);
                  fetchReferrals(1, '', sortConfig, {
                    siteId: siteFilter,
                    channel: value,
                    referredTo: referredToFilter,
                  });
                }}
              >
                <SelectTrigger
                  aria-label="Channel"
                  className={cn(listSelectTriggerClass, 'w-44')}
                >
                  <SelectValue placeholder="Filter by channel" />
                </SelectTrigger>
                <SelectContent>
                  {channelOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={referredToFilter}
                onValueChange={value => {
                  setReferredToFilter(value);
                  fetchReferrals(1, '', sortConfig, {
                    siteId: siteFilter,
                    channel: channelFilter,
                    referredTo: value,
                  });
                }}
              >
                <SelectTrigger
                  aria-label="Referred to"
                  className={cn(listSelectTriggerClass, 'w-52')}
                >
                  <SelectValue placeholder="Filter by destination" />
                </SelectTrigger>
                <SelectContent>
                  {referredToOptions.map(option => (
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
                  fetchReferrals(1, '', sortConfig, {
                    siteId: value,
                    channel: channelFilter,
                    referredTo: referredToFilter,
                  });
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
                  <SelectItem value="referralDate:desc">Newest first</SelectItem>
                  <SelectItem value="referralDate:asc">Oldest first</SelectItem>
                  <SelectItem value="siteName:asc">Site (A–Z)</SelectItem>
                </SelectContent>
              </Select>

              {hasFilters && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={clearFilters}
                  className="h-auto p-0 text-[13.5px] text-(--action-primary) underline"
                >
                  Clear filters
                </Button>
              )}
            </div>
            <span className="text-[13.5px] text-(--text-muted)">
              {pagination.total} referral{pagination.total === 1 ? '' : 's'}
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
                {referrals.length === 0 ? (
                  <div className="px-4 py-10 text-center text-(--text-muted)">
                    {hasFilters ? (
                      <>
                        No referrals match these filters.{' '}
                        <Button
                          variant="link"
                          size="sm"
                          onClick={clearFilters}
                          className="h-auto p-0 text-[13.5px] text-(--action-primary) underline"
                        >
                          Clear filters
                        </Button>
                      </>
                    ) : (
                      'No referrals found.'
                    )}
                  </div>
                ) : (
                  referrals.map(referral => (
                    <DirectoryRow
                      key={referral.id}
                      leading={
                        <div className={rowTileClass}>
                          <Share2 size={19} />
                        </div>
                      }
                      title={referral.siteName}
                      sub={`${formatDate(referral.referralDate)} · ${referral.userName}`}
                      actions={
                        <RowActions
                          label={`Actions for the ${referral.siteName} referral`}
                          actions={[
                            {
                              label: 'View',
                              href: `/referrals/${referral.id}`,
                            },
                            {
                              label: 'Delete',
                              danger: true,
                              onSelect: () => openDeleteReferral(referral),
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
                  fetchReferrals(page, '', sortConfig, currentFilters())
                }
              />
            </>
          )}
        </div>

        {/* Dialogs */}
        <DeleteReferralDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          referral={deletingReferral}
          onSuccess={showInternalMessage}
          onError={showInternalError}
          onRefresh={refreshData}
        />
      </>
    );
  }
);

ReferralsTable.displayName = 'ReferralsTable';

export default ReferralsTable;
