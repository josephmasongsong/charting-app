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
  Search,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

import EditUserDialog from './EditUserDialog';
import RoleBadge from './RoleBadge';
import JobTitleBadge from './JobTitleBadge';
import RegionBadge from './RegionBadge';
import StatusBadge from './StatusBadge';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'partner';
  region?: string;
  jobTitle?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
  firstName?: string;
  lastName?: string;
}

interface UserSession {
  id: string;
  role: 'admin' | 'user' | 'partner';
  email: string;
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

interface UsersTableProps {
  currentUser: UserSession;
  message?: string;
  error?: string;
  onClearMessage?: () => void;
  onClearError?: () => void;
}

export interface UsersTableRef {
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
const alertClass = 'border-y-0 border-r-0 px-3.5 py-3';
const successAlertClass =
  'rounded-[2px] border-l-[5px] border-l-(--success) bg-[var(--bch-green-50,#EDF6EF)] text-foreground';

function userInitials(name: string) {
  return name
    .split(/\s+/)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

const UsersTable = forwardRef<UsersTableRef, UsersTableProps>(
  ({ currentUser, message, error, onClearMessage, onClearError }, ref) => {
    const [users, setUsers] = useState<User[]>([]);
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
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // Internal message/error state for table-specific operations
    const [internalMessage, setInternalMessage] = useState('');
    const [internalError, setInternalError] = useState('');

    const isAdmin = currentUser?.role === 'admin';

    const fetchUsers = useCallback(
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

          const response = await fetch(`/api/admin/users?${params}`);
          const data = await response.json();

          if (response.ok) {
            setUsers(data.users);
            setPagination(data.pagination);
            setInternalError('');
          } else {
            setInternalError(data.error || 'Failed to fetch users');
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
        fetchUsers(pagination.page, search, sortConfig);
      },
    }));

    useEffect(() => {
      fetchUsers();
    }, [fetchUsers]);

    const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      fetchUsers(1, search, sortConfig);
    };

    const handleSort = (field: string) => {
      const newOrder: SortOrder =
        sortConfig.field === field && sortConfig.order === 'asc'
          ? 'desc'
          : 'asc';
      const newSortConfig = { field, order: newOrder };
      setSortConfig(newSortConfig);
      fetchUsers(pagination.page, search, newSortConfig);
    };

    const openEditUser = (user: User) => {
      setEditingUser(user);
      setEditOpen(true);
    };

    const refreshData = () => {
      fetchUsers(pagination.page, search, sortConfig);
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

    const sortableHead = (field: string, label: string) => (
      <Button
        variant="ghost"
        onClick={() => handleSort(field)}
        className="h-auto p-0 text-xs font-bold tracking-[.04em] text-(--text-on-chrome) uppercase hover:bg-transparent hover:text-(--text-on-chrome)"
      >
        <span
          className={cn(
            sortConfig.field === field ? 'font-extrabold' : 'opacity-85'
          )}
        >
          {label}
        </span>
        {sortConfig.field === field ? (
          sortConfig.order === 'asc' ? (
            <ChevronUp className="ml-1.5 h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="ml-1.5 h-3.5 w-3.5" />
          )
        ) : (
          <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 opacity-60" />
        )}
      </Button>
    );

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
                placeholder="Search by name or email..."
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
                <Table className="min-w-[1080px] border-collapse bg-(--surface-card) text-sm">
                  <TableHeader>
                    <TableRow className="border-0 hover:bg-transparent">
                      <TableHead className={headCellClass}>
                        {sortableHead('name', 'Name')}
                      </TableHead>
                      <TableHead className={headCellClass}>
                        {sortableHead('email', 'Email')}
                      </TableHead>
                      <TableHead className={headCellClass}>Role</TableHead>
                      <TableHead className={headCellClass}>Job Title</TableHead>
                      <TableHead className={headCellClass}>Region</TableHead>
                      <TableHead className={headCellClass}>Status</TableHead>
                      <TableHead className={headCellClass}>Created</TableHead>
                      <TableHead className={cn(headCellClass, 'text-right')}>
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className={cn(
                            bodyCellClass,
                            'py-10 text-center whitespace-normal text-(--text-muted)'
                          )}
                        >
                          {search ? (
                            <>
                              No users found matching "{search}".
                              <Button
                                variant="link"
                                onClick={() => {
                                  setSearch('');
                                  fetchUsers(1, '', sortConfig);
                                }}
                                className="ml-1 h-auto p-0 text-[14px] text-(--action-primary)"
                              >
                                Clear search
                              </Button>
                            </>
                          ) : (
                            'No users found.'
                          )}
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map(user => (
                        <TableRow key={user.id} className={bodyRowClass}>
                          <TableCell className={bodyCellClass}>
                            <div className="flex items-center gap-2.5">
                              <div className="grid size-9 shrink-0 place-items-center rounded-(--radius-avatar) bg-[linear-gradient(160deg,#8FA6B5,#6B8496)] text-xs font-bold text-white">
                                {userInitials(user.name)}
                              </div>
                              <span className="font-semibold">{user.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className={bodyCellClass}>
                            {user.email}
                          </TableCell>
                          <TableCell className={bodyCellClass}>
                            <RoleBadge role={user.role} />
                          </TableCell>
                          <TableCell className={bodyCellClass}>
                            <JobTitleBadge jobTitle={user.jobTitle} />
                          </TableCell>
                          <TableCell className={bodyCellClass}>
                            <RegionBadge region={user.region} />
                          </TableCell>
                          <TableCell className={bodyCellClass}>
                            <StatusBadge isActive={user.isActive} />
                          </TableCell>
                          <TableCell
                            className={cn(bodyCellClass, 'text-(--text-muted)')}
                          >
                            {new Date(user.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell
                            className={cn(bodyCellClass, 'text-right')}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Edit user"
                              aria-label="Edit user"
                              onClick={() => openEditUser(user)}
                              className={rowActionClass}
                            >
                              <PenLine className="size-[17px]" />
                            </Button>
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
                onPageChange={page => fetchUsers(page, search, sortConfig)}
              />
            </>
          )}
        </div>

        {/* Edit User Dialog */}
        <EditUserDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          user={editingUser}
          isAdmin={isAdmin}
          onSuccess={showInternalMessage}
          onError={showInternalError}
          onRefresh={refreshData}
        />
      </>
    );
  }
);

UsersTable.displayName = 'UsersTable';

export default UsersTable;
