'use client';

import {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { Button } from '@/components/ui/button';
import {
  listSearchInputClass,
  listSelectTriggerClass,
} from '@/components/ui/list-controls';
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
import { DirectoryRow } from '@/components/ui/directory-row';
import { RowActions } from '@/components/ui/row-actions';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

import EditPartnerDialog from './edit-partner-dialog';
import DeletePartnerDialog from './delete-partner-dialog';

interface CommunityPartner {
  id: string;
  name: string;
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

interface CommunityPartnersTableProps {
  message?: string;
  error?: string;
  onClearMessage?: () => void;
  onClearError?: () => void;
}

export interface CommunityPartnersTableRef {
  refreshData: () => void;
}

const alertClass = 'border-y-0 border-r-0 px-3.5 py-3';
const successAlertClass =
  'rounded-[2px] border-l-[5px] border-l-(--success) bg-[var(--bch-green-50,#EDF6EF)] text-foreground';

const CommunityPartnersTable = forwardRef<
  CommunityPartnersTableRef,
  CommunityPartnersTableProps
>(({ message, error, onClearMessage, onClearError }, ref) => {
  const [partners, setPartners] = useState<CommunityPartner[]>([]);
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

  // Dialog states
  const [editOpen, setEditOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<CommunityPartner | null>(
    null
  );
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingPartner, setDeletingPartner] =
    useState<CommunityPartner | null>(null);

  // Internal message/error state for table-specific operations
  const [internalMessage, setInternalMessage] = useState('');
  const [internalError, setInternalError] = useState('');

  const fetchPartners = useCallback(
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

        const response = await fetch(`/api/admin/community-partners?${params}`);
        const data = await response.json();

        if (response.ok) {
          setPartners(data.communityPartners);
          setPagination(data.pagination);
          setInternalError('');
        } else {
          setInternalError(data.error || 'Failed to fetch community partners');
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
      fetchPartners(pagination.page, search, sortConfig);
    },
  }));

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPartners(1, search, sortConfig);
  };

  const handleSort = (field: string) => {
    const newOrder: SortOrder =
      sortConfig.field === field && sortConfig.order === 'asc' ? 'desc' : 'asc';
    const newSortConfig = { field, order: newOrder };
    setSortConfig(newSortConfig);
    fetchPartners(pagination.page, search, newSortConfig);
  };

  // Sorting moved from clickable column headers to this Select when the
  // table became a responsive list — there are no headers to click now.
  const handleSortChange = (value: string) => {
    const [field, order] = value.split(':');
    const next = { field, order: order as SortOrder };
    setSortConfig(next);
    fetchPartners(1, search, next);
  };

  const openEditPartner = (partner: CommunityPartner) => {
    setEditingPartner(partner);
    setEditOpen(true);
  };

  const openDeletePartner = (partner: CommunityPartner) => {
    setDeletingPartner(partner);
    setDeleteOpen(true);
  };

  const refreshData = () => {
    fetchPartners(pagination.page, search, sortConfig);
  };

  const showInternalMessage = (msg: string) => {
    setInternalMessage(msg);
    setInternalError('');
    setTimeout(() => setInternalMessage(''), 5000);
  };

  const showInternalError = (err: string) => {
    setInternalError(err);
    setInternalMessage('');
    setTimeout(() => setInternalError(''), 5000);
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
              placeholder="Search by name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={listSearchInputClass}
            />
          </form>
          <Select
            value={`${sortConfig.field}:${sortConfig.order}`}
            onValueChange={handleSortChange}
          >
            <SelectTrigger
              aria-label="Sort by"
              className={cn(listSelectTriggerClass, "w-[190px]")}
            >
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name:asc">Name (A–Z)</SelectItem>
              <SelectItem value="name:desc">Name (Z–A)</SelectItem>
              <SelectItem value="createdAt:desc">Newest first</SelectItem>
              <SelectItem value="createdAt:asc">Oldest first</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="space-y-2 p-5">
                        {Array.from({ length: 5 }, (_, i) => (
              <Skeleton
                key={i}
                className="h-[62px] rounded-none bg-(--surface-muted)"
              />
            ))}
          </div>
        ) : (
          <>
            <div>
              {partners.length === 0 ? (
                <div className="px-4 py-10 text-center text-(--text-muted)">
                  {search ? (
                    <>
                      No community partners found matching &quot;{search}&quot;.
                      <Button
                        variant="link"
                        onClick={() => {
                          setSearch('');
                          fetchPartners(1, '', sortConfig);
                        }}
                        className="ml-1 h-auto p-0 text-[14px] text-(--action-primary)"
                      >
                        Clear search
                      </Button>
                    </>
                  ) : (
                    'No community partners found.'
                  )}
                </div>
              ) : (
                partners.map(partner => (
                  <DirectoryRow
                    key={partner.id}
                    title={partner.name}
                    actions={
                      <RowActions
                        label={`Actions for ${partner.name}`}
                        actions={[
                          { label: 'Edit', onSelect: () => openEditPartner(partner) },
                          {
                            label: 'Delete',
                            danger: true,
                            onSelect: () => openDeletePartner(partner),
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
              onPageChange={page => fetchPartners(page, search, sortConfig)}
            />
          </>
        )}
      </div>

      {/* Dialogs */}
      <EditPartnerDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        partner={editingPartner}
        onSuccess={showInternalMessage}
        onError={showInternalError}
        onRefresh={refreshData}
      />

      <DeletePartnerDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        partner={deletingPartner}
        onSuccess={showInternalMessage}
        onError={showInternalError}
        onRefresh={refreshData}
      />
    </>
  );
});

CommunityPartnersTable.displayName = 'CommunityPartnersTable';

export default CommunityPartnersTable;
