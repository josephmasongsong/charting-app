// app/admin/events/page.tsx
'use client';

import { Suspense, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import EventsTable from './components/events-table';
import DeleteEventDialog from './components/delete-event-dialog';

function EventsTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
    </div>
  );
}

export default function AdminEventsPage() {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Create a ref to access the EventsTable's refresh function
  const eventsTableRef = useRef<{ refreshData: () => void }>(null);

  const handleRefresh = () => {
    // Call the table's refresh method directly
    eventsTableRef.current?.refreshData();
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

  const openDeleteEvent = (event: any) => {
    setDeletingEvent(event);
    setDeleteOpen(true);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Events Management</h1>
          <p className="text-muted-foreground">
            Manage community events and activities
          </p>
        </div>

        <Button onClick={() => router.push('/events/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>

      <Suspense fallback={<EventsTableSkeleton />}>
        <EventsTable
          ref={eventsTableRef}
          message={message}
          error={error}
          onClearMessage={() => setMessage('')}
          onClearError={() => setError('')}
          onDelete={openDeleteEvent}
        />
      </Suspense>

      <DeleteEventDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        event={deletingEvent}
        onSuccess={showMessage}
        onError={showError}
        onRefresh={handleRefresh}
      />
    </div>
  );
}
