'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Users,
} from 'lucide-react';

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

export default function AdminCommunityPartners() {
  const [partners, setPartners] = useState<CommunityPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // Create partner state
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '' });
  const [createLoading, setCreateLoading] = useState(false);

  // Edit partner state
  const [editOpen, setEditOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<CommunityPartner | null>(
    null
  );
  const [editForm, setEditForm] = useState({ name: '' });
  const [editLoading, setEditLoading] = useState(false);

  // Delete partner state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingPartner, setDeletingPartner] =
    useState<CommunityPartner | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Fetch partners
  const fetchPartners = async (page = 1, searchTerm = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`/api/admin/community-partners?${params}`);
      const data = await response.json();

      if (response.ok) {
        setPartners(data.communityPartners);
        setPagination(data.pagination);
      } else {
        setError(data.error || 'Failed to fetch community partners');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPartners(1, search);
  };

  // Handle create partner
  const handleCreatePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/admin/community-partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(
          `Community partner "${createForm.name}" created successfully!`
        );
        setCreateForm({ name: '' });
        setCreateOpen(false);
        fetchPartners(pagination.page, search);
      } else {
        setError(data.error || 'Failed to create community partner');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setCreateLoading(false);
    }
  };

  // Handle edit partner
  const openEditPartner = (partner: CommunityPartner) => {
    setEditingPartner(partner);
    setEditForm({ name: partner.name });
    setEditOpen(true);
  };

  const handleEditPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPartner) return;

    setEditLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(
        `/api/admin/community-partners/${editingPartner.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editForm),
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage(
          `Community partner "${editForm.name}" updated successfully!`
        );
        setEditOpen(false);
        fetchPartners(pagination.page, search);
      } else {
        setError(data.error || 'Failed to update community partner');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setEditLoading(false);
    }
  };

  // Handle delete partner
  const openDeletePartner = (partner: CommunityPartner) => {
    setDeletingPartner(partner);
    setDeleteOpen(true);
  };

  const handleDeletePartner = async () => {
    if (!deletingPartner) return;

    setDeleteLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(
        `/api/admin/community-partners/${deletingPartner.id}`,
        {
          method: 'DELETE',
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage(
          `Community partner "${deletingPartner.name}" deleted successfully!`
        );
        setDeleteOpen(false);
        fetchPartners(pagination.page, search);
      } else {
        setError(data.error || 'Failed to delete community partner');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Community Partners Management</h1>
          <p className="text-muted-foreground">
            Manage community partners for your application
          </p>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Community Partner
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Community Partner</DialogTitle>
              <DialogDescription>
                Add a new community partner to your system.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreatePartner} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="createName">Name</Label>
                <Input
                  id="createName"
                  value={createForm.name}
                  onChange={e => setCreateForm({ name: e.target.value })}
                  placeholder="Enter community partner name"
                  required
                  disabled={createLoading}
                  maxLength={255}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateOpen(false)}
                  disabled={createLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createLoading}>
                  {createLoading ? 'Creating...' : 'Create Partner'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
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
          <CardTitle>Search Community Partners</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Search by name..."
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

      {/* Partners Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Community Partners ({pagination.total})
          </CardTitle>
          <CardDescription>
            Manage and organize your community partners
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partners.map(partner => (
                    <TableRow key={partner.id}>
                      <TableCell className="font-medium">
                        {partner.name}
                      </TableCell>
                      <TableCell>
                        {new Date(partner.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(partner.updatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditPartner(partner)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeletePartner(partner)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

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
                      onClick={() => fetchPartners(pagination.page - 1, search)}
                      disabled={pagination.page <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchPartners(pagination.page + 1, search)}
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

      {/* Edit Partner Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Community Partner</DialogTitle>
            <DialogDescription>
              Update the community partner information.
            </DialogDescription>
          </DialogHeader>
          {editingPartner && (
            <form onSubmit={handleEditPartner} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editName">Name</Label>
                <Input
                  id="editName"
                  value={editForm.name}
                  onChange={e => setEditForm({ name: e.target.value })}
                  placeholder="Enter community partner name"
                  required
                  disabled={editLoading}
                  maxLength={255}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditOpen(false)}
                  disabled={editLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={editLoading}>
                  {editLoading ? 'Updating...' : 'Update Partner'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Partner Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Community Partner</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this community partner? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deletingPartner && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">
                  <strong>Partner to delete:</strong> {deletingPartner.name}
                </p>
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
                  onClick={handleDeletePartner}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? 'Deleting...' : 'Delete Partner'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
