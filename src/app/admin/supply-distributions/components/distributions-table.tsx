// app/admin/supply-distributions/components/distributions-table.tsx
'use client';

import {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Trash2,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Truck,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Eye,
  Calendar,
  MapPin,
  User,
} from 'lucide-react';

import DeleteDistributionDialog from './delete-distribution-dialog';
import ViewDistributionDialog from './view-distribution-dialog';

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
  recipientNotes: string;
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

// Define the ref methods that the parent can call
export interface DistributionsTableRef {
  refreshData: () => void;
}

// Helper function to format dates in a human-readable way
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Helper function to format distribution type
const formatDistributionType = (type: string): string => {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Helper function to get distribution type badge variant
const getDistributionTypeBadge = (type: string) => {
  switch (type) {
    case 'door_to_door':
      return 'default';
    case 'community_room_pickup':
      return 'secondary';
    case 'event_distribution':
      return 'outline';
    case 'emergency_distribution':
      return 'destructive';
    default:
      return 'default';
  }
};

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
    const [viewOpen, setViewOpen] = useState(false);
    const [viewingDistribution, setViewingDistribution] =
      useState<Distribution | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deletingDistribution, setDeletingDistribution] =
      useState<Distribution | null>(null);

    // Internal message/error state for table-specific operations
    const [internalMessage, setInternalMessage] = useState('');
    const [internalError, setInternalError] = useState('');

    // Distribution type options matching the form
    const distributionTypeOptions = [
      { value: 'all', label: 'All Types' },
      { value: 'door_to_door', label: 'Door to Door' },
      { value: 'community_room_pickup', label: 'Community Room Pickup' },
      { value: 'event_distribution', label: 'Event Distribution' },
      { value: 'emergency_distribution', label: 'Emergency Distribution' },
    ];

    // Fetch sites for filter dropdown
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

    // Fetch distributions
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

    // Expose refresh method to parent component
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

    // Handle sorting
    const handleSort = (field: string) => {
      const newOrder: SortOrder =
        sortConfig.field === field && sortConfig.order === 'asc'
          ? 'desc'
          : 'asc';
      const newSortConfig = { field, order: newOrder };
      setSortConfig(newSortConfig);
      const filters = {
        siteId: siteFilter === 'all' ? '' : siteFilter,
        distributionType: distributionTypeFilter,
        userId: userFilter,
      };
      fetchDistributions(pagination.page, '', newSortConfig, filters);
    };

    // Handle view distribution
    const openViewDistribution = (distribution: Distribution) => {
      setViewingDistribution(distribution);
      setViewOpen(true);
    };

    // Handle delete distribution
    const openDeleteDistribution = (distribution: Distribution) => {
      setDeletingDistribution(distribution);
      setDeleteOpen(true);
    };

    // Refresh data after CRUD operations
    const refreshData = () => {
      const filters = {
        siteId: siteFilter === 'all' ? '' : siteFilter,
        distributionType: distributionTypeFilter,
        userId: userFilter,
      };
      fetchDistributions(pagination.page, '', sortConfig, filters);
      onRefresh();
    };

    // Handle success/error messages for internal operations
    const showInternalMessage = (msg: string) => {
      setInternalMessage(msg);
      setInternalError('');
      onSuccess(msg);
      // Clear message after 5 seconds
      setTimeout(() => setInternalMessage(''), 5000);
    };

    const showInternalError = (err: string) => {
      setInternalError(err);
      setInternalMessage('');
      onError(err);
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

        {/* Distributions Data Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Supply Distributions ({pagination.total})
                </CardTitle>
                <CardDescription>
                  Track supply distributions across sites and events
                </CardDescription>
              </div>

              {/* Compact Filters */}
              <div className="flex items-center gap-2">
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
                  <SelectTrigger className="w-48">
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
                  <SelectTrigger className="w-48">
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

                {(distributionTypeFilter !== 'all' ||
                  (siteFilter !== '' && siteFilter !== 'all')) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDistributionTypeFilter('all');
                      setSiteFilter('');
                      setUserFilter('');
                      fetchDistributions(1, '', sortConfig, {});
                    }}
                    className="text-xs"
                  >
                    Clear
                  </Button>
                )}
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
                            onClick={() => handleSort('distributionDate')}
                            className="h-auto p-0 font-semibold hover:bg-transparent"
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            Distribution Date
                            {sortConfig.field === 'distributionDate' ? (
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
                        <TableHead>
                          <Button
                            variant="ghost"
                            onClick={() => handleSort('siteName')}
                            className="h-auto p-0 font-semibold hover:bg-transparent"
                          >
                            <MapPin className="mr-2 h-4 w-4" />
                            Site
                            {sortConfig.field === 'siteName' ? (
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
                        <TableHead>
                          <Button
                            variant="ghost"
                            onClick={() => handleSort('distributionType')}
                            className="h-auto p-0 font-semibold hover:bg-transparent"
                          >
                            Type
                            {sortConfig.field === 'distributionType' ? (
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
                        <TableHead>
                          <Button
                            variant="ghost"
                            onClick={() => handleSort('userName')}
                            className="h-auto p-0 font-semibold hover:bg-transparent"
                          >
                            <User className="mr-2 h-4 w-4" />
                            Distributed By
                            {sortConfig.field === 'userName' ? (
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
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {distributions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            {(siteFilter && siteFilter !== 'all') ||
                            distributionTypeFilter !== 'all' ? (
                              <>
                                No distributions found with current filters.
                                <Button
                                  variant="link"
                                  onClick={() => {
                                    setSiteFilter('all');
                                    setDistributionTypeFilter('all');
                                    setUserFilter('');
                                    fetchDistributions(1, '', sortConfig, {});
                                  }}
                                  className="ml-2"
                                >
                                  Clear filters
                                </Button>
                              </>
                            ) : (
                              'No distributions found.'
                            )}
                          </TableCell>
                        </TableRow>
                      ) : (
                        distributions.map(distribution => (
                          <TableRow key={distribution.id}>
                            <TableCell className="font-medium">
                              {formatDate(distribution.distributionDate)}
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">
                                {distribution.siteName}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={getDistributionTypeBadge(
                                  distribution.distributionType
                                )}
                              >
                                {formatDistributionType(
                                  distribution.distributionType
                                )}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {distribution.userName}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    openViewDistribution(distribution)
                                  }
                                  title="View distribution details"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    openDeleteDistribution(distribution)
                                  }
                                  title="Delete distribution"
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
                        onClick={() => {
                          const filters = {
                            siteId: siteFilter === 'all' ? '' : siteFilter,
                            distributionType: distributionTypeFilter,
                            userId: userFilter,
                          };
                          fetchDistributions(1, '', sortConfig, filters);
                        }}
                        disabled={pagination.page <= 1}
                        className="hidden sm:inline-flex"
                      >
                        First
                      </Button>

                      {/* Previous page */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const filters = {
                            siteId: siteFilter === 'all' ? '' : siteFilter,
                            distributionType: distributionTypeFilter,
                            userId: userFilter,
                          };
                          fetchDistributions(
                            pagination.page - 1,
                            '',
                            sortConfig,
                            filters
                          );
                        }}
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
                                onClick={() => {
                                  const filters = {
                                    siteId:
                                      siteFilter === 'all' ? '' : siteFilter,
                                    distributionType: distributionTypeFilter,
                                    userId: userFilter,
                                  };
                                  fetchDistributions(
                                    1,
                                    '',
                                    sortConfig,
                                    filters
                                  );
                                }}
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
                                onClick={() => {
                                  const filters = {
                                    siteId:
                                      siteFilter === 'all' ? '' : siteFilter,
                                    distributionType: distributionTypeFilter,
                                    userId: userFilter,
                                  };
                                  fetchDistributions(
                                    i,
                                    '',
                                    sortConfig,
                                    filters
                                  );
                                }}
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
                                onClick={() => {
                                  const filters = {
                                    siteId:
                                      siteFilter === 'all' ? '' : siteFilter,
                                    distributionType: distributionTypeFilter,
                                    userId: userFilter,
                                  };
                                  fetchDistributions(
                                    totalPages,
                                    '',
                                    sortConfig,
                                    filters
                                  );
                                }}
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
                        onClick={() => {
                          const filters = {
                            siteId: siteFilter === 'all' ? '' : siteFilter,
                            distributionType: distributionTypeFilter,
                            userId: userFilter,
                          };
                          fetchDistributions(
                            pagination.page + 1,
                            '',
                            sortConfig,
                            filters
                          );
                        }}
                        disabled={pagination.page >= pagination.pages}
                      >
                        <span className="hidden sm:inline mr-1">Next</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>

                      {/* Last page */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const filters = {
                            siteId: siteFilter === 'all' ? '' : siteFilter,
                            distributionType: distributionTypeFilter,
                            userId: userFilter,
                          };
                          fetchDistributions(
                            pagination.pages,
                            '',
                            sortConfig,
                            filters
                          );
                        }}
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
        <ViewDistributionDialog
          open={viewOpen}
          onOpenChange={setViewOpen}
          distribution={viewingDistribution}
          onError={showInternalError}
        />

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
