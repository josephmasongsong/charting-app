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

export default function AdminSites() {
  const router = useRouter();
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
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
  const fetchSites = async (page = 1, searchTerm = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
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
    fetchSites(1, search);
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
        fetchSites(pagination.page, search);
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
  }: {
    value: boolean;
    trueText: string;
    falseText: string;
  }) => (
    <Badge
      variant={value ? 'default' : 'secondary'}
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

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Sites</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Search by name, address, user, or community partner..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Sites Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Sites ({pagination.total})
          </CardTitle>
          <CardDescription>
            Manage and organize your sites and their properties
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Tenants</TableHead>
                      <TableHead>Manager</TableHead>
                      <TableHead>Community Room</TableHead>
                      <TableHead>Community Partner</TableHead>
                      <TableHead>Senior Only</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sites.map(site => (
                      <TableRow key={site.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div>{site.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {site.latitude}, {site.longitude}
                            </div>
                          </div>
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
                          {site.hasCommunityPartner ? (
                            <Badge variant="default">
                              {site.communityPartnerName}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">None</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <BooleanBadge
                            value={site.isSingleSeniorOnly}
                            trueText="Yes"
                            falseText="No"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/sites/${site.id}`)}
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
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {pagination.page} of {pagination.pages} (
                    {pagination.total} total)
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchSites(pagination.page - 1, search)}
                      disabled={pagination.page <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchSites(pagination.page + 1, search)}
                      disabled={pagination.page >= pagination.pages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
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
