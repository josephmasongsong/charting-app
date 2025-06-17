'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Users,
  Home,
  Check,
  Eye,
  X,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

interface Site {
  id: string;
  name: string;
  latitude: string;
  longitude: string;
  address: string;
  numberOfTenants: number;
  hasCommunityRoom: boolean;
  hasCommunityPartner: boolean;
  communityPartnerId: string | null;
  communityPartnerName: string | null;
  isSingleSeniorOnly: boolean;
  userId: string;
  userName: string;
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

export default function AdminSites() {
  const router = useRouter();
  const [sites, setSites] = useState<Site[]>([]);
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

  // Delete site state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingSite, setDeletingSite] = useState<Site | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Fetch sites
  const fetchSites = async (page = 1, searchTerm = '', sort = sortConfig) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        sortBy: sort.field,
        sortOrder: sort.order,
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`/api/admin/sites?${params}`);
      const data = await response.json();

      if (response.ok) {
        setSites(data.sites);
        setPagination(data.pagination);
      } else {
        setError(data.error || 'Failed to fetch sites');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  // Clear messages after some time
  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, error]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSites(1, search, sortConfig);
  };

  // Handle sorting
  const handleSort = (field: string) => {
    const newOrder: SortOrder =
      sortConfig.field === field && sortConfig.order === 'asc' ? 'desc' : 'asc';
    const newSortConfig = { field, order: newOrder };
    setSortConfig(newSortConfig);
    fetchSites(pagination.page, search, newSortConfig);
  };

  // Handle delete site
  const openDeleteSite = (site: Site) => {
    setDeletingSite(site);
    setDeleteOpen(true);
  };

  const handleDeleteSite = async () => {
    if (!deletingSite) return;

    setDeleteLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`/api/admin/sites/${deletingSite.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`Site "${deletingSite.name}" deleted successfully!`);
        setDeleteOpen(false);
        fetchSites(pagination.page, search, sortConfig);
      } else {
        setError(data.error || 'Failed to delete site');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Boolean display component
  const BooleanBadge = ({
    value,
    trueText,
    falseText,
    trueVariant = 'default',
    falseVariant = 'secondary',
  }: {
    value: boolean;
    trueText: string;
    falseText: string;
    trueVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
    falseVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  }) => (
    <Badge
      variant={value ? trueVariant : falseVariant}
      className="flex items-center gap-1"
    >
      {value ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      {value ? trueText : falseText}
    </Badge>
  );

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Sites Management</h1>
          <p className="text-muted-foreground">
            Manage sites, locations, and their properties
          </p>
        </div>

        <Button onClick={() => router.push('/admin/sites/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Site
        </Button>
      </div>

      {/* Messages */}
      {message && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {message}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Sites Data Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Sites ({pagination.total})
              </CardTitle>
              <CardDescription>
                Manage and organize your sites and their properties
              </CardDescription>
            </div>

            {/* Search Bar */}
            <div className="w-full md:w-80">
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  placeholder="Search by name, address, user, or community partner..."
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
                <div className="overflow-x-auto">
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
                        <TableHead>Address</TableHead>
                        <TableHead>Tenants</TableHead>
                        <TableHead>Manager</TableHead>
                        <TableHead>Community Room</TableHead>
                        <TableHead>Community Partner</TableHead>
                        <TableHead>Senior Only</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sites.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            {search ? (
                              <>
                                No sites found matching "{search}".
                                <Button
                                  variant="link"
                                  onClick={() => {
                                    setSearch('');
                                    fetchSites(1, '', sortConfig);
                                  }}
                                  className="ml-2"
                                >
                                  Clear search
                                </Button>
                              </>
                            ) : (
                              'No sites found.'
                            )}
                          </TableCell>
                        </TableRow>
                      ) : (
                        sites.map(site => (
                          <TableRow key={site.id}>
                            <TableCell className="font-medium">
                              {site.name}
                            </TableCell>
                            <TableCell>
                              <div
                                className="max-w-[200px] truncate"
                                title={site.address}
                              >
                                {site.address}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="flex items-center gap-1 w-fit"
                              >
                                <Users className="h-3 w-3" />
                                {site.numberOfTenants}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">{site.userName}</div>
                            </TableCell>
                            <TableCell>
                              <BooleanBadge
                                value={site.hasCommunityRoom}
                                trueText="Yes"
                                falseText="No"
                              />
                            </TableCell>
                            <TableCell>
                              <BooleanBadge
                                value={site.hasCommunityPartner}
                                trueText="Yes"
                                falseText="No"
                              />
                            </TableCell>
                            <TableCell>
                              <BooleanBadge
                                value={site.isSingleSeniorOnly}
                                trueText="Yes"
                                falseText="No"
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    router.push(`/sites/${site.id}`)
                                  }
                                  title="View site"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    router.push(`/admin/sites/${site.id}/edit`)
                                  }
                                  title="Edit site"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openDeleteSite(site)}
                                  title="Delete site"
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
                      onClick={() => fetchSites(1, search, sortConfig)}
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
                        fetchSites(pagination.page - 1, search, sortConfig)
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
                              onClick={() => fetchSites(1, search, sortConfig)}
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
                              onClick={() => fetchSites(i, search, sortConfig)}
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
                                fetchSites(totalPages, search, sortConfig)
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
                        fetchSites(pagination.page + 1, search, sortConfig)
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
                        fetchSites(pagination.pages, search, sortConfig)
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

      {/* Delete Site Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Site</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this site? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          {deletingSite && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="text-sm text-red-800">
                  <p>
                    <strong>Site:</strong> {deletingSite.name}
                  </p>
                  <p>
                    <strong>Address:</strong> {deletingSite.address}
                  </p>
                  <p>
                    <strong>Manager:</strong> {deletingSite.userName}
                  </p>
                  <p>
                    <strong>Tenants:</strong> {deletingSite.numberOfTenants}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDeleteOpen(false)}
                  disabled={deleteLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteSite}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? 'Deleting...' : 'Delete Site'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
