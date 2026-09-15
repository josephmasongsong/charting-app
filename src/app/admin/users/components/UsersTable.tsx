'use client';

import {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { Button } from '@/components/ui/button';
import { listSearchInputClass, listSelectTriggerClass } from '@/components/ui/list-controls';
import { Input } from '@/components/ui/input';
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
import { Search } from 'lucide-react';
import { AvatarTile } from '@/components/ui/avatar-tile';
import { cn } from '@/lib/utils';

import EditUserDialog from './EditUserDialog';
import StatusBadge from './StatusBadge';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  jobTitle?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
  firstName?: string;
  lastName?: string;
}

interface UserSession {
  id: string;
  role: 'admin' | 'user';
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

    const handleSortChange = (value: string) => {
      const [field, order] = value.split(':');
      const newSortConfig = { field, order: order as SortOrder };
      setSortConfig(newSortConfig);
      fetchUsers(1, search, newSortConfig);
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
                className={listSearchInputClass}
              />
            </form>
            <Select
              value={`${sortConfig.field}:${sortConfig.order}`}
              onValueChange={handleSortChange}
            >
              <SelectTrigger aria-label="Sort by" className={listSelectTriggerClass}>
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
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }, (_, i) => (
                <Skeleton
                  key={i}
                  className="h-[68px] rounded-none bg-(--surface-muted)"
                />
              ))}
            </div>
          ) : (
            <>
              <div>
                {users.length === 0 ? (
                  <div className="px-4 py-10 text-center text-(--text-muted)">
                    {search ? (
                      <>
                        No users found matching &quot;{search}&quot;.
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
                  </div>
                ) : (
                  users.map(user => (
                    <DirectoryRow
                      key={user.id}
                      leading={
                        <AvatarTile initials={userInitials(user.name)} size={44} />
                      }
                      title={
                        <span className="flex flex-wrap items-center gap-2">
                          {user.name}
                          {/* Only the exception is worth a pill — an active
                              account is the norm and says nothing. */}
                          {user.isActive === false && (
                            <StatusBadge isActive={false} />
                          )}
                        </span>
                      }
                      actions={
                        <RowActions
                          label={`Actions for ${user.name}`}
                          actions={[
                            { label: 'View', href: `/users/${user.id}` },
                            {
                              label: 'Edit',
                              onSelect: () => openEditUser(user),
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
