'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Copy, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface DuplicateEventDialogProps {
  eventId: string;
  eventTitle: string;
  trigger?: React.ReactNode;
}

const primaryButtonClass =
  'h-auto rounded-(--radius-control) bg-(--action-primary) px-[18px] py-[9px] text-[15px] font-normal text-(--text-on-chrome) shadow-none hover:bg-(--action-primary-hover) disabled:bg-(--action-primary-disabled) disabled:opacity-100';
const outlineButtonClass =
  'h-auto rounded-(--radius-control) border-(--action-primary) bg-(--surface-card) px-[18px] py-[9px] text-[15px] font-normal text-(--action-primary) shadow-none hover:bg-(--action-selected) hover:text-(--action-primary)';

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
    <>
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <Button
          variant="outline"
          size="icon"
          onClick={() => setOpen(true)}
          aria-label="Duplicate"
          className="size-8 rounded-(--radius-control) text-(--action-primary) hover:bg-(--action-selected) hover:text-(--action-primary)"
        >
          <Copy className="h-4 w-4" />
        </Button>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Duplicate Event"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
              className={outlineButtonClass}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDuplicate}
              disabled={isLoading}
              className={primaryButtonClass}
            >
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
          </>
        }
      >
        This will create a copy of &quot;{eventTitle}&quot; that you can edit. The
        duplicated event will not be logged in the activity feed until you save
        your changes.
      </Modal>
    </>
  );
};
