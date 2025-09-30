// app/events/components/DuplicateEventDialog.tsx
'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface DuplicateEventDialogProps {
  eventId: string;
  eventTitle: string;
  trigger?: React.ReactNode;
}

export const DuplicateEventDialog: React.FC<DuplicateEventDialogProps> = ({
  eventId,
  eventTitle,
  trigger,
}) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDuplicate = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/events/${eventId}/duplicate`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to duplicate event');
      }

      const data = await response.json();

      toast.success('Event duplicated successfully', {
        description: 'You can now edit the duplicated event.',
      });

      // Redirect to edit page with duplicated flag
      router.push(`/events/${data.event.id}/edit?duplicated=true`);
    } catch (error) {
      console.error('Duplication error:', error);
      toast.error('Failed to duplicate event', {
        description: 'Please try again later.',
      });
    } finally {
      setIsLoading(false);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <Copy className="h-4 w-4" />
        </Button>
      )}

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Duplicate Event</DialogTitle>
          <DialogDescription>
            This will create a copy of "{eventTitle}" that you can edit. The
            duplicated event will not be logged in the activity feed until you
            save your changes.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleDuplicate} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Duplicating...
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate Event
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
