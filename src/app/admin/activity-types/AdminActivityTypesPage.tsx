'use client';

import { Suspense, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import ActivityTypesTable from './components/activity-types-table';
import CreateActivityTypeDialog from './components/create-activity-type-dialog';

interface ProgramGoal {
  id: string;
  name: string;
}

interface AdminActivityTypesPageProps {
  programGoals: ProgramGoal[];
}

function ActivityTypesTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
    </div>
  );
}

export default function AdminActivityTypesPage({
  programGoals,
}: AdminActivityTypesPageProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Create a ref to access the ActivityTypesTable's refresh function
  const activityTypesTableRef = useRef<{ refreshData: () => void }>(null);

  const handleRefresh = () => {
    // Call the table's refresh method directly
    activityTypesTableRef.current?.refreshData();
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
          <h1 className="text-3xl font-bold">Activity Types Management</h1>
          <p className="text-muted-foreground">
            Manage activity types and their associated program goals
          </p>
        </div>

        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Activity Type
        </Button>
      </div>

      <Suspense fallback={<ActivityTypesTableSkeleton />}>
        <ActivityTypesTable
          ref={activityTypesTableRef}
          initialProgramGoals={programGoals}
          message={message}
          error={error}
          onClearMessage={() => setMessage('')}
          onClearError={() => setError('')}
        />
      </Suspense>

      <CreateActivityTypeDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        programGoals={programGoals}
        onSuccess={showMessage}
        onError={showError}
        onRefresh={handleRefresh}
      />
    </div>
  );
}
