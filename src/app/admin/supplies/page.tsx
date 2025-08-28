'use client';

import { Suspense, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import SuppliesTable from './components/supplies-table';
import CreateSupplyDialog from './components/create-supply-dialog';

function SuppliesTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
    </div>
  );
}

export default function AdminSuppliesPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Create a ref to access the SuppliesTable's refresh function
  const suppliesTableRef = useRef<{ refreshData: () => void }>(null);

  const handleRefresh = () => {
    // Call the table's refresh method directly
    suppliesTableRef.current?.refreshData();
  };

  const showMessage = (msg: string) => {
    setMessage(msg);
    setError('');
    // Clear messages after 5 seconds
    setTimeout(() => setMessage(''), 5000);
  };

  const showError = (err: string) => {
    setError(err);
    setMessage('');
    // Clear errors after 5 seconds
    setTimeout(() => setError(''), 5000);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Supplies Management</h1>
          <p className="text-muted-foreground">
            Manage supplies catalog for your application
          </p>
        </div>

        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Supply
        </Button>
      </div>

      <Suspense fallback={<SuppliesTableSkeleton />}>
        <SuppliesTable
          ref={suppliesTableRef}
          message={message}
          error={error}
          onClearMessage={() => setMessage('')}
          onClearError={() => setError('')}
        />
      </Suspense>

      <CreateSupplyDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={showMessage}
        onError={showError}
        onRefresh={handleRefresh}
      />
    </div>
  );
}
