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
  Target,
} from 'lucide-react';

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

export default function AdminProgramGoals() {
  const [goals, setGoals] = useState<ProgramGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // Create goal state
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '' });
  const [createLoading, setCreateLoading] = useState(false);

  // Edit goal state
  const [editOpen, setEditOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<ProgramGoal | null>(null);
  const [editForm, setEditForm] = useState({ name: '' });
  const [editLoading, setEditLoading] = useState(false);

  // Delete goal state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingGoal, setDeletingGoal] = useState<ProgramGoal | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Fetch goals
  const fetchGoals = async (page = 1, searchTerm = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`/api/admin/program-goals?${params}`);
      const data = await response.json();

      if (response.ok) {
        setGoals(data.programGoals);
        setPagination(data.pagination);
      } else {
        setError(data.error || 'Failed to fetch program goals');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchGoals(1, search);
  };

  // Handle create goal
  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/admin/program-goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`Program goal "${createForm.name}" created successfully!`);
        setCreateForm({ name: '' });
        setCreateOpen(false);
        fetchGoals(pagination.page, search);
      } else {
        setError(data.error || 'Failed to create program goal');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setCreateLoading(false);
    }
  };

  // Handle edit goal
  const openEditGoal = (goal: ProgramGoal) => {
    setEditingGoal(goal);
    setEditForm({ name: goal.name });
    setEditOpen(true);
  };

  const handleEditGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGoal) return;

    setEditLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(
        `/api/admin/program-goals/${editingGoal.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editForm),
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage(`Program goal "${editForm.name}" updated successfully!`);
        setEditOpen(false);
        fetchGoals(pagination.page, search);
      } else {
        setError(data.error || 'Failed to update program goal');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setEditLoading(false);
    }
  };

  // Handle delete goal
  const openDeleteGoal = (goal: ProgramGoal) => {
    setDeletingGoal(goal);
    setDeleteOpen(true);
  };

  const handleDeleteGoal = async () => {
    if (!deletingGoal) return;

    setDeleteLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(
        `/api/admin/program-goals/${deletingGoal.id}`,
        {
          method: 'DELETE',
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage(`Program goal "${deletingGoal.name}" deleted successfully!`);
        setDeleteOpen(false);
        fetchGoals(pagination.page, search);
      } else {
        setError(data.error || 'Failed to delete program goal');
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
          <h1 className="text-3xl font-bold">Program Goals Management</h1>
          <p className="text-muted-foreground">
            Manage program goals for your application
          </p>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Program Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Program Goal</DialogTitle>
              <DialogDescription>
                Add a new program goal to your system.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="createName">Name</Label>
                <Input
                  id="createName"
                  value={createForm.name}
                  onChange={e => setCreateForm({ name: e.target.value })}
                  placeholder="Enter program goal name"
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
                  {createLoading ? 'Creating...' : 'Create Goal'}
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
          <CardTitle>Search Program Goals</CardTitle>
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

      {/* Goals Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Program Goals ({pagination.total})
          </CardTitle>
          <CardDescription>
            Manage and organize your program goals
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
                  {goals.map(goal => (
                    <TableRow key={goal.id}>
                      <TableCell className="font-medium">{goal.name}</TableCell>
                      <TableCell>
                        {new Date(goal.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(goal.updatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditGoal(goal)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteGoal(goal)}
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
                      onClick={() => fetchGoals(pagination.page - 1, search)}
                      disabled={pagination.page <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchGoals(pagination.page + 1, search)}
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

      {/* Edit Goal Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Program Goal</DialogTitle>
            <DialogDescription>
              Update the program goal information.
            </DialogDescription>
          </DialogHeader>
          {editingGoal && (
            <form onSubmit={handleEditGoal} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editName">Name</Label>
                <Input
                  id="editName"
                  value={editForm.name}
                  onChange={e => setEditForm({ name: e.target.value })}
                  placeholder="Enter program goal name"
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
                  {editLoading ? 'Updating...' : 'Update Goal'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Goal Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Program Goal</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this program goal? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deletingGoal && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">
                  <strong>Goal to delete:</strong> {deletingGoal.name}
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
                  onClick={handleDeleteGoal}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? 'Deleting...' : 'Delete Goal'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
