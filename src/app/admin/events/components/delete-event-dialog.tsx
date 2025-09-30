'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Event {
  id: string;
  title: string;
  eventDate: string;
  description: string;
  eventDuration: number;
  adminDuration: number;
  newParticipants: number;
  returningParticipants: number;
  eventIsYouthFocused: boolean;
  hasCoHost: boolean;
  totalCost: string;
  activityTypeName: string;
  siteName: string;
  userName: string;
  communityPartnerName: string | null;
  createdAt: string;
  updatedAt: string;
}

interface DeleteEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event | null;
  onSuccess: (message: string) => void;
  onError: (error: string) => void;
  onRefresh: () => void;
}

export default function DeleteEventDialog({
  open,
  onOpenChange,
  event,
  onSuccess,
  onError,
  onRefresh,
}: DeleteEventDialogProps) {
  const [loading, setLoading] = useState(false);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDelete = async () => {
    if (!event) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/admin/events/${event.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        onSuccess(`Event "${event.title}" deleted successfully!`);
        onOpenChange(false);
        onRefresh();
      } else {
        onError(data.error || 'Failed to delete event');
      }
    } catch (error) {
      onError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Event</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this event? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        {event && (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="text-sm text-red-800">
                <p>
                  <strong>Event:</strong> {event.title}
                </p>
                <p>
                  <strong>Date:</strong> {formatDate(event.eventDate)}
                </p>
                <p>
                  <strong>Site:</strong> {event.siteName}
                </p>
                <p>
                  <strong>Organizer:</strong> {event.userName}
                </p>
                <p>
                  <strong>Participants:</strong>{' '}
                  {event.newParticipants + event.returningParticipants}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete Event'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
