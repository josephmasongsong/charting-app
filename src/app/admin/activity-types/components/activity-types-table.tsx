'use client';

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
  listSearchInputClass,
  listSelectTriggerClass,
} from '@/components/ui/list-controls';
import { Button } from '@/components/ui/button';
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

import EditActivityTypeDialog from './edit-activity-type-dialog';
import DeleteActivityTypeDialog from './delete-activity-type-dialog';

interface ActivityType {
  id: string;
  name: string;
  programGoalId: string;
  programGoalName: string;
  createdAt: string;
  updatedAt: string;
}

interface ProgramGoal {
  id: string;
  name: string;
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

interface ActivityTypesTableProps {
  initialProgramGoals: ProgramGoal[];
  message?: string;
  error?: string;
  onClearMessage?: () => void;
  onClearError?: () => void;
}

export interface ActivityTypesTableRef {
  refreshData: () => void;
}

const alertClass = 'border-y-0 border-r-0 px-3.5 py-3';
const successAlertClass =
  'rounded-[2px] border-l-[5px] border-l-(--success) bg-[var(--bch-green-50,#EDF6EF)] text-foreground';

const ActivityTypesTable = forwardRef<
  ActivityTypesTableRef,
  ActivityTypesTableProps
>(
  (
    { initialProgramGoals, message, error, onClearMessage, onClearError },
    ref
  ) => {
    const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
    const [programGoals, setProgramGoals] =
      useState<ProgramGoal[]>(initialProgramGoals);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig>({
      field: 'name',
      order: 'asc',
    });
    const [pagination, setPagination] = useState<PaginationInfo>({
      page: 1,
      limit: 10,
      total: 0,
      pages: 0,
    });

    // Dialog states
    const [editOpen, setEditOpen] = useState(false);
    const [editingType, setEditingType] = useState<ActivityType | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deletingType, setDeletingType] = useState<ActivityType | null>(null);

    // Internal message/error state for table-specific operations
    const [internalMessage, setInternalMessage] = useState('');
    const [internalError, setInternalError] = useState('');

    const fetchProgramGoals = async () => {
      if (programGoals.length > 0) return;

      try {
        const response = await fetch('/api/admin/program-goals/options');
        const data = await response.json();

        if (response.ok) {
          setProgramGoals(data.programGoals);
        }
      } catch (error) {
        console.error('Failed to fetch program goals:', error);
      }
    };

    const fetchActivityTypes = async (
      page = 1,
      searchTerm = '',
      sort = sortConfig
    ) => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '10',
          sortBy: sort.field,
          sortOrder: sort.order,
          ...(searchTerm && { search: searchTerm }),
        });

        const response = await fetch(`/api/admin/activity-types?${params}`);
        const data = await response.json();

        if (response.ok) {
          setActivityTypes(data.activityTypes);
          setPagination(data.pagination);
          setInternalError('');
        } else {
          setInternalError(data.error || 'Failed to fetch activity types');
        }
      } catch (error) {
        setInternalError('Network error occurred');
      } finally {
        setLoading(false);
      }
    };

    useImperativeHandle(ref, () => ({
      refreshData: () => {
        fetchActivityTypes(pagination.page, search, sortConfig);
      },
    }));

    useEffect(() => {
      fetchProgramGoals();
      fetchActivityTypes();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      fetchActivityTypes(1, search, sortConfig);
    };

    const handleSort = (field: string) => {
      const newOrder: SortOrder =
        sortConfig.field === field && sortConfig.order === 'asc'
          ? 'desc'
          : 'asc';
      const newSortConfig = { field, order: newOrder };
      setSortConfig(newSortConfig);
      fetchActivityTypes(pagination.page, search, newSortConfig);
    };

    // Sorting moved from clickable column headers to a Select when the
    // table became a responsive list — there are no headers to click now.
    const handleSortChange = (value: string) => {
      const [field, order] = value.split(':');
      const next = { field, order: order as SortOrder };
      setSortConfig(next);
      fetchActivityTypes(1, search, next);
    };

    const openEditActivityType = (activityType: ActivityType) => {
      setEditingType(activityType);
      setEditOpen(true);
    };

    const openDeleteActivityType = (activityType: ActivityType) => {
      setDeletingType(activityType);
      setDeleteOpen(true);
    };

    const refreshData = () => {
      fetchActivityTypes(pagination.page, search, sortConfig);
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
                placeholder="Search by name or program goal..."
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
                {activityTypes.length === 0 ? (
                  <div className="px-4 py-10 text-center text-(--text-muted)">
                    {search ? (
                      <>
                        No activity types found matching &quot;{search}&quot;.
                        <Button
                          variant="link"
                          onClick={() => {
                            setSearch('');
                            fetchActivityTypes(1, '', sortConfig);
                          }}
                          className="ml-1 h-auto p-0 text-[14px] text-(--action-primary)"
                        >
                          Clear search
                        </Button>
                      </>
                    ) : (
                      'No activity types found.'
                    )}
                  </div>
                ) : (
                  activityTypes.map(activityType => (
                    <DirectoryRow
                      key={activityType.id}
                      title={activityType.name}
                      actions={
                        <RowActions
                          label={`Actions for ${activityType.name}`}
                          actions={[
                            { label: 'Edit', onSelect: () => openEditActivityType(activityType) },
                            {
                              label: 'Delete',
                              danger: true,
                              onSelect: () => openDeleteActivityType(activityType),
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
                  fetchActivityTypes(page, search, sortConfig)
                }
              />
            </>
          )}
        </div>

        {/* Dialogs */}
        <EditActivityTypeDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          activityType={editingType}
          programGoals={programGoals}
          onSuccess={showInternalMessage}
          onError={showInternalError}
          onRefresh={refreshData}
        />

        <DeleteActivityTypeDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          activityType={deletingType}
          onSuccess={showInternalMessage}
          onError={showInternalError}
          onRefresh={refreshData}
        />
      </>
    );
  }
);

ActivityTypesTable.displayName = 'ActivityTypesTable';

export default ActivityTypesTable;
