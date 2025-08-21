'use client';

import { useState, useEffect, useCallback } from 'react';
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
import {
  Plus,
  Edit,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Package,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

import CreateSupplyDialog from './create-supply-dialog';
import EditSupplyDialog from './edit-supply-dialog';
import DeleteSupplyDialog from './delete-supply-dialog';

interface Supply {
  id: string;
  name: string;
  costPerUnit: string;
  quantity: number;
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

export default function SuppliesTable() {
  const [supplies, setSupplies] = useState<Supply[]>([]);
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
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingSupply, setEditingSupply] = useState<Supply | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingSupply, setDeletingSupply] = useState<Supply | null>(null);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Fetch supplies
  const fetchSupplies = useCallback(
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

        const response = await fetch(`/api/admin/supplies?${params}`);
        const data = await response.json();

        if (response.ok) {
          setSupplies(data.supplies);
          setPagination(data.pagination);
          setError('');
        } else {
          setError(data.error || 'Failed to fetch supplies');
        }
      } catch (error) {
        setError('Network error occurred');
      } finally {
        setLoading(false);
      }
    },
    [sortConfig]
  );

  useEffect(() => {
    fetchSupplies();
  }, [fetchSupplies]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSupplies(1, search, sortConfig);
  };

  // Handle sorting
  const handleSort = (field: string) => {
    const newOrder: SortOrder =
      sortConfig.field === field && sortConfig.order === 'asc' ? 'desc' : 'asc';
    const newSortConfig = { field, order: newOrder };
    setSortConfig(newSortConfig);
    fetchSupplies(pagination.page, search, newSortConfig);
  };

  // Handle edit supply
  const openEditSupply = (supply: Supply) => {
    setEditingSupply(supply);
    setEditOpen(true);
  };

  // Handle delete supply
  const openDeleteSupply = (supply: Supply) => {
    setDeletingSupply(supply);
    setDeleteOpen(true);
  };

  // Refresh data after CRUD operations
  const refreshData = () => {
    fetchSupplies(pagination.page, search, sortConfig);
  };

  // Handle success/error messages
  const showMessage = (msg: string) => {
    setMessage(msg);
    setError('');
  };

  const showError = (err: string) => {
    setError(err);
    setMessage('');
  };

  return (
    <>
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

      {/* Supplies Data Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Supplies ({pagination.total})
              </CardTitle>
              <CardDescription>
                Manage your supplies catalog and inventory
              </CardDescription>
            </div>

            <div className="flex gap-2">
              {/* Search Bar */}
              <div className="w-full md:w-80">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <Input
                    placeholder="Search by name..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" variant="outline" size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                </form>
              </div>

              {/* Add Button */}
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Supply
              </Button>
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
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('costPerUnit')}
                          className="h-auto p-0 font-semibold hover:bg-transparent"
                        >
                          Cost Per Unit
                          {sortConfig.field === 'costPerUnit' ? (
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
                          onClick={() => handleSort('quantity')}
                          className="h-auto p-0 font-semibold hover:bg-transparent"
                        >
                          Quantity
                          {sortConfig.field === 'quantity' ? (
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
                      <TableHead>Total Value</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {supplies.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          {search ? (
                            <>
                              No supplies found matching "{search}".
                              <Button
                                variant="link"
                                onClick={() => {
                                  setSearch('');
                                  fetchSupplies(1, '', sortConfig);
                                }}
                                className="ml-2"
                              >
                                Clear search
                              </Button>
                            </>
                          ) : (
                            'No supplies found.'
                          )}
                        </TableCell>
                      </TableRow>
                    ) : (
                      supplies.map(supply => (
                        <TableRow key={supply.id}>
                          <TableCell className="font-medium">
                            {supply.name}
                          </TableCell>
                          <TableCell>
                            ${parseFloat(supply.costPerUnit).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {supply.quantity.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            $
                            {(
                              parseFloat(supply.costPerUnit) * supply.quantity
                            ).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {new Date(supply.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {new Date(supply.updatedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditSupply(supply)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openDeleteSupply(supply)}
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
                      onClick={() => fetchSupplies(1, search, sortConfig)}
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
                        fetchSupplies(pagination.page - 1, search, sortConfig)
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
                                fetchSupplies(1, search, sortConfig)
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
                                fetchSupplies(i, search, sortConfig)
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
                                fetchSupplies(totalPages, search, sortConfig)
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
                        fetchSupplies(pagination.page + 1, search, sortConfig)
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
                        fetchSupplies(pagination.pages, search, sortConfig)
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
      <CreateSupplyDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={showMessage}
        onError={showError}
        onRefresh={refreshData}
      />

      <EditSupplyDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        supply={editingSupply}
        onSuccess={showMessage}
        onError={showError}
        onRefresh={refreshData}
      />

      <DeleteSupplyDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        supply={deletingSupply}
        onSuccess={showMessage}
        onError={showError}
        onRefresh={refreshData}
      />
    </>
  );
}
