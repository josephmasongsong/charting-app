// app/admin/supply-distributions/page.tsx
'use client';

import { Suspense, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import DistributionsTable from './components/distributions-table';

function DistributionsTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
    </div>
  );
}

export default function SupplyDistributionsPage() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Create a ref to access the DistributionsTable's refresh function
  const distributionsTableRef = useRef<{ refreshData: () => void }>(null);

  const handleRefresh = () => {
    // Call the table's refresh method directly
    distributionsTableRef.current?.refreshData();
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
          <h1 className="text-3xl font-bold">Supply Distributions</h1>
          <p className="text-muted-foreground">
            Track and manage supply distributions to sites and events
          </p>
        </div>

        <Button onClick={() => router.push('/supply-distributions/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Log Distribution
        </Button>
      </div>

      <Suspense fallback={<DistributionsTableSkeleton />}>
        <DistributionsTable
          ref={distributionsTableRef}
          message={message}
          error={error}
          onClearMessage={() => setMessage('')}
          onClearError={() => setError('')}
          onSuccess={showMessage}
          onError={showError}
          onRefresh={handleRefresh}
        />
      </Suspense>
    </div>
  );
}
