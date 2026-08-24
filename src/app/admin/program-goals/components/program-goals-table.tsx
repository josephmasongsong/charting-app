'use client';

import {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { PaginationFooter } from '@/components/ui/pagination-footer';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  PenLine,
  Trash2,
  Search,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

import EditGoalDialog from './edit-goal-dialog';
import DeleteGoalDialog from './delete-goal-dialog';

interface ProgramGoal {
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

interface ProgramGoalsTableProps {
  message?: string;
  error?: string;
  onClearMessage?: () => void;
  onClearError?: () => void;
}

export interface ProgramGoalsTableRef {
  refreshData: () => void;
}

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
const alertClass = 'border-y-0 border-r-0 px-3.5 py-3';
const successAlertClass =
  'rounded-[2px] border-l-[5px] border-l-(--success) bg-[var(--bch-green-50,#EDF6EF)] text-foreground';

const ProgramGoalsTable = forwardRef<
  ProgramGoalsTableRef,
  ProgramGoalsTableProps
>(({ message, error, onClearMessage, onClearError }, ref) => {
  const [goals, setGoals] = useState<ProgramGoal[]>([]);
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
  const [editingGoal, setEditingGoal] = useState<ProgramGoal | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingGoal, setDeletingGoal] = useState<ProgramGoal | null>(null);

  // Internal message/error state for table-specific operations
  const [internalMessage, setInternalMessage] = useState('');
  const [internalError, setInternalError] = useState('');

  const fetchGoals = useCallback(
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

        const response = await fetch(`/api/admin/program-goals?${params}`);
        const data = await response.json();

        if (response.ok) {
          setGoals(data.programGoals);
          setPagination(data.pagination);
          setInternalError('');
        } else {
          setInternalError(data.error || 'Failed to fetch program goals');
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
      fetchGoals(pagination.page, search, sortConfig);
    },
  }));

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchGoals(1, search, sortConfig);
  };

  const handleSort = (field: string) => {
    const newOrder: SortOrder =
      sortConfig.field === field && sortConfig.order === 'asc' ? 'desc' : 'asc';
    const newSortConfig = { field, order: newOrder };
    setSortConfig(newSortConfig);
    fetchGoals(pagination.page, search, newSortConfig);
  };

  const openEditGoal = (goal: ProgramGoal) => {
    setEditingGoal(goal);
    setEditOpen(true);
  };

  const openDeleteGoal = (goal: ProgramGoal) => {
    setDeletingGoal(goal);
    setDeleteOpen(true);
  };

  const refreshData = () => {
    fetchGoals(pagination.page, search, sortConfig);
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
              className="h-9 rounded-(--radius-control) border-(--border-input) bg-(--surface-card) pl-8 text-sm shadow-none md:text-sm"
            />
          </form>
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
            <div className="overflow-x-auto">
              <Table className="min-w-[720px] border-collapse bg-(--surface-card) text-sm">
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
                          <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 opacity-60" />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead className={headCellClass}>Created</TableHead>
                    <TableHead className={headCellClass}>Updated</TableHead>
                    <TableHead className={cn(headCellClass, 'text-right')}>
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {goals.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className={cn(
                          bodyCellClass,
                          'py-10 text-center whitespace-normal text-(--text-muted)'
                        )}
                      >
                        {search ? (
                          <>
                            No program goals found matching "{search}".
                            <Button
                              variant="link"
                              onClick={() => {
                                setSearch('');
                                fetchGoals(1, '', sortConfig);
                              }}
                              className="ml-1 h-auto p-0 text-[14px] text-(--action-primary)"
                            >
                              Clear search
                            </Button>
                          </>
                        ) : (
                          'No program goals found.'
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    goals.map(goal => (
                      <TableRow key={goal.id} className={bodyRowClass}>
                        <TableCell className={cn(bodyCellClass, 'font-semibold')}>
                          {goal.name}
                        </TableCell>
                        <TableCell
                          className={cn(bodyCellClass, 'text-(--text-muted)')}
                        >
                          {new Date(goal.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell
                          className={cn(bodyCellClass, 'text-(--text-muted)')}
                        >
                          {new Date(goal.updatedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className={cn(bodyCellClass, 'text-right')}>
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Edit program goal"
                              aria-label="Edit program goal"
                              onClick={() => openEditGoal(goal)}
                              className={rowActionClass}
                            >
                              <PenLine className="size-[17px]" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Delete program goal"
                              aria-label="Delete program goal"
                              onClick={() => openDeleteGoal(goal)}
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
            </div>

            <PaginationFooter
              page={pagination.page}
              pages={pagination.pages}
              total={pagination.total}
              limit={pagination.limit}
              onPageChange={page => fetchGoals(page, search, sortConfig)}
            />
          </>
        )}
      </div>

      {/* Dialogs */}
      <EditGoalDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        goal={editingGoal}
        onSuccess={showInternalMessage}
        onError={showInternalError}
        onRefresh={refreshData}
      />

      <DeleteGoalDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        goal={deletingGoal}
        onSuccess={showInternalMessage}
        onError={showInternalError}
        onRefresh={refreshData}
      />
    </>
  );
});

ProgramGoalsTable.displayName = 'ProgramGoalsTable';

export default ProgramGoalsTable;
