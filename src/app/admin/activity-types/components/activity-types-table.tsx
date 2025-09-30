'use client';

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
  Edit,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Activity,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

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

// Define the ref methods that the parent can call
export interface ActivityTypesTableRef {
  refreshData: () => void;
}

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
    const [editingType, setEditingType] = useState<ActivityType | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deletingType, setDeletingType] = useState<ActivityType | null>(null);

    // Internal message/error state for table-specific operations
    const [internalMessage, setInternalMessage] = useState('');
    const [internalError, setInternalError] = useState('');

    // Fetch program goals for dropdown (fallback if server data is empty)
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

    // Fetch activity types
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

    // Expose refresh method to parent component
    useImperativeHandle(ref, () => ({
      refreshData: () => {
        fetchActivityTypes(pagination.page, search, sortConfig);
      },
    }));

    useEffect(() => {
      fetchProgramGoals();
      fetchActivityTypes();
    }, []);

    // Handle search
    const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      fetchActivityTypes(1, search, sortConfig);
    };

    // Handle sorting
    const handleSort = (field: string) => {
      const newOrder: SortOrder =
        sortConfig.field === field && sortConfig.order === 'asc'
          ? 'desc'
          : 'asc';
      const newSortConfig = { field, order: newOrder };
      setSortConfig(newSortConfig);
      fetchActivityTypes(pagination.page, search, newSortConfig);
    };

    // Handle edit activity type
    const openEditActivityType = (activityType: ActivityType) => {
      setEditingType(activityType);
      setEditOpen(true);
    };

    // Handle delete activity type
    const openDeleteActivityType = (activityType: ActivityType) => {
      setDeletingType(activityType);
      setDeleteOpen(true);
    };

    // Refresh data after CRUD operations
    const refreshData = () => {
      fetchActivityTypes(pagination.page, search, sortConfig);
    };

    // Handle success/error messages for internal operations
    const showInternalMessage = (msg: string) => {
      setInternalMessage(msg);
      setInternalError('');
      // Clear message after 5 seconds
      setTimeout(() => setInternalMessage(''), 5000);
    };

    const showInternalError = (err: string) => {
      setInternalError(err);
      setInternalMessage('');
      // Clear error after 5 seconds
      setTimeout(() => setInternalError(''), 5000);
    };

    // Determine which message/error to show (parent props take precedence)
    const displayMessage = message || internalMessage;
    const displayError = error || internalError;

    return (
      <>
        {/* Messages */}
        {displayMessage && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {displayMessage}
            </AlertDescription>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto"
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
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{displayError}</AlertDescription>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto"
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

        {/* Activity Types Data Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Activity Types ({pagination.total})
                </CardTitle>
                <CardDescription>
                  Manage and organize your activity types by program goals
                </CardDescription>
              </div>

              {/* Search Bar */}
              <div className="w-full md:w-80">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <Input
                    placeholder="Search by activity type name or program goal..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" variant="outline" size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          <Button
                            variant="ghost"
                            onClick={() => handleSort('name')}
                            className="h-auto p-0 font-semibold hover:bg-transparent"
                          >
                            Name
                            {sortConfig.field === 'name' ? (
                              sortConfig.order === 'asc' ? (
                                <ChevronUp className="ml-2 h-4 w-4" />
                              ) : (
                                <ChevronDown className="ml-2 h-4 w-4" />
                              )
                            ) : (
                              <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
                            )}
                          </Button>
                        </TableHead>
                        <TableHead>Program Goal</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Updated</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activityTypes.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            {search ? (
                              <>
                                No activity types found matching "{search}".
                                <Button
                                  variant="link"
                                  onClick={() => {
                                    setSearch('');
                                    fetchActivityTypes(1, '', sortConfig);
                                  }}
                                  className="ml-2"
                                >
                                  Clear search
                                </Button>
                              </>
                            ) : (
                              'No activity types found.'
                            )}
                          </TableCell>
                        </TableRow>
                      ) : (
                        activityTypes.map(activityType => (
                          <TableRow key={activityType.id}>
                            <TableCell className="font-medium">
                              {activityType.name}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {activityType.programGoalName}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(
                                activityType.createdAt
                              ).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {new Date(
                                activityType.updatedAt
                              ).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    openEditActivityType(activityType)
                                  }
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    openDeleteActivityType(activityType)
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Enhanced Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex flex-col space-y-4 mt-6 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div className="text-sm text-muted-foreground">
                      Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                      {Math.min(
                        pagination.page * pagination.limit,
                        pagination.total
                      )}{' '}
                      of {pagination.total} results
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* First page */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          fetchActivityTypes(1, search, sortConfig)
                        }
                        disabled={pagination.page <= 1}
                        className="hidden sm:inline-flex"
                      >
                        First
                      </Button>

                      {/* Previous page */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          fetchActivityTypes(
                            pagination.page - 1,
                            search,
                            sortConfig
                          )
                        }
                        disabled={pagination.page <= 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="hidden sm:inline ml-1">Previous</span>
                      </Button>

                      {/* Page numbers */}
                      <div className="flex items-center space-x-1">
                        {(() => {
                          const pages = [];
                          const currentPage = pagination.page;
                          const totalPages = pagination.pages;

                          // Always show first page
                          if (currentPage > 3) {
                            pages.push(
                              <Button
                                key={1}
                                variant={
                                  1 === currentPage ? 'default' : 'outline'
                                }
                                size="sm"
                                onClick={() =>
                                  fetchActivityTypes(1, search, sortConfig)
                                }
                                className="w-10"
                              >
                                1
                              </Button>
                            );

                            if (currentPage > 4) {
                              pages.push(
                                <span key="ellipsis1" className="px-2">
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
                                variant={
                                  i === currentPage ? 'default' : 'outline'
                                }
                                size="sm"
                                onClick={() =>
                                  fetchActivityTypes(i, search, sortConfig)
                                }
                                className="w-10"
                              >
                                {i}
                              </Button>
                            );
                          }

                          // Always show last page
                          if (currentPage < totalPages - 2) {
                            if (currentPage < totalPages - 3) {
                              pages.push(
                                <span key="ellipsis2" className="px-2">
                                  ...
                                </span>
                              );
                            }

                            pages.push(
                              <Button
                                key={totalPages}
                                variant={
                                  totalPages === currentPage
                                    ? 'default'
                                    : 'outline'
                                }
                                size="sm"
                                onClick={() =>
                                  fetchActivityTypes(
                                    totalPages,
                                    search,
                                    sortConfig
                                  )
                                }
                                className="w-10"
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
                          fetchActivityTypes(
                            pagination.page + 1,
                            search,
                            sortConfig
                          )
                        }
                        disabled={pagination.page >= pagination.pages}
                      >
                        <span className="hidden sm:inline mr-1">Next</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>

                      {/* Last page */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          fetchActivityTypes(
                            pagination.pages,
                            search,
                            sortConfig
                          )
                        }
                        disabled={pagination.page >= pagination.pages}
                        className="hidden sm:inline-flex"
                      >
                        Last
                      </Button>
                    </div>
                  </div>
                )}

                {/* Show pagination info even when only one page */}
                {pagination.pages <= 1 && pagination.total > 0 && (
                  <div className="mt-4 text-sm text-muted-foreground text-center">
                    Showing all {pagination.total} results
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

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
