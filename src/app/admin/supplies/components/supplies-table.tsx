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

import EditSupplyDialog from './edit-supply-dialog';
import DeleteSupplyDialog from './delete-supply-dialog';
import ViewSupplyDialog from './view-supply-dialog';

interface Supply {
  id: string;
  name: string;
  costPerUnit: string;
  quantity: number;
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

interface SuppliesTableProps {
  message?: string;
  error?: string;
  onClearMessage?: () => void;
  onClearError?: () => void;
}

export interface SuppliesTableRef {
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

const SuppliesTable = forwardRef<SuppliesTableRef, SuppliesTableProps>(
  ({ message, error, onClearMessage, onClearError }, ref) => {
    const [supplies, setSupplies] = useState<Supply[]>([]);
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
    const [viewOpen, setViewOpen] = useState(false);
    const [viewingSupply, setViewingSupply] = useState<Supply | null>(null);
    const [editOpen, setEditOpen] = useState(false);
    const [editingSupply, setEditingSupply] = useState<Supply | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deletingSupply, setDeletingSupply] = useState<Supply | null>(null);

    // Internal message/error state for table-specific operations
    const [internalMessage, setInternalMessage] = useState('');
    const [internalError, setInternalError] = useState('');

    const fetchSupplies = useCallback(
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

          const response = await fetch(`/api/admin/supplies?${params}`);
          const data = await response.json();

          if (response.ok) {
            setSupplies(data.supplies);
            setPagination(data.pagination);
            setInternalError('');
          } else {
            setInternalError(data.error || 'Failed to fetch supplies');
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
        fetchSupplies(pagination.page, search, sortConfig);
      },
    }));

    useEffect(() => {
      fetchSupplies();
    }, [fetchSupplies]);

    const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      fetchSupplies(1, search, sortConfig);
    };

    const handleSort = (field: string) => {
      const newOrder: SortOrder =
        sortConfig.field === field && sortConfig.order === 'asc'
          ? 'desc'
          : 'asc';
      const newSortConfig = { field, order: newOrder };
      setSortConfig(newSortConfig);
      fetchSupplies(pagination.page, search, newSortConfig);
    };

    // Sorting moved from clickable column headers to a Select when the
    // table became a responsive list — there are no headers to click now.
    const handleSortChange = (value: string) => {
      const [field, order] = value.split(':');
      const next = { field, order: order as SortOrder };
      setSortConfig(next);
      fetchSupplies(1, search, next);
    };

    const openViewSupply = (supply: Supply) => {
      setViewingSupply(supply);
      setViewOpen(true);
    };

    const openEditSupply = (supply: Supply) => {
      setEditingSupply(supply);
      setEditOpen(true);
    };

    const openDeleteSupply = (supply: Supply) => {
      setDeletingSupply(supply);
      setDeleteOpen(true);
    };

    const refreshData = () => {
      fetchSupplies(pagination.page, search, sortConfig);
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
                className={cn(listSelectTriggerClass, "w-[210px]")}
              >
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name:asc">Name (A–Z)</SelectItem>
                <SelectItem value="name:desc">Name (Z–A)</SelectItem>
                <SelectItem value="costPerUnit:asc">Cost (low–high)</SelectItem>
                <SelectItem value="costPerUnit:desc">Cost (high–low)</SelectItem>
                <SelectItem value="quantity:desc">Quantity (high–low)</SelectItem>
                <SelectItem value="quantity:asc">Quantity (low–high)</SelectItem>
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
                {supplies.length === 0 ? (
                  <div className="px-4 py-10 text-center text-(--text-muted)">
                    {search ? (
                      <>
                        No supplies found matching &quot;{search}&quot;.
                        <Button
                          variant="link"
                          onClick={() => {
                            setSearch('');
                            fetchSupplies(1, '', sortConfig);
                          }}
                          className="ml-1 h-auto p-0 text-[14px] text-(--action-primary)"
                        >
                          Clear search
                        </Button>
                      </>
                    ) : (
                      'No supplies found.'
                    )}
                  </div>
                ) : (
                  supplies.map(supply => (
                    <DirectoryRow
                      key={supply.id}
                      title={
                        <Button
                          variant="link"
                          onClick={() => openViewSupply(supply)}
                          title="View supply details"
                          className="h-auto p-0 text-[14.5px] font-semibold text-(--text-body) hover:text-(--action-primary)"
                        >
                          {supply.name}
                        </Button>
                      }
                      actions={
                        <RowActions
                          label={`Actions for ${supply.name}`}
                          actions={[
                            {
                              label: 'View',
                              onSelect: () => openViewSupply(supply),
                            },
                            {
                              label: 'Edit',
                              onSelect: () => openEditSupply(supply),
                            },
                            {
                              label: 'Delete',
                              danger: true,
                              onSelect: () => openDeleteSupply(supply),
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
                onPageChange={page => fetchSupplies(page, search, sortConfig)}
              />
            </>
          )}
        </div>

        {/* Dialogs */}
        <ViewSupplyDialog
          open={viewOpen}
          onOpenChange={setViewOpen}
          supply={viewingSupply}
          onError={showInternalError}
        />

        <EditSupplyDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          supply={editingSupply}
          onSuccess={showInternalMessage}
          onError={showInternalError}
          onRefresh={refreshData}
        />

        <DeleteSupplyDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          supply={deletingSupply}
          onSuccess={showInternalMessage}
          onError={showInternalError}
          onRefresh={refreshData}
        />
      </>
    );
  }
);

SuppliesTable.displayName = 'SuppliesTable';

export default SuppliesTable;
