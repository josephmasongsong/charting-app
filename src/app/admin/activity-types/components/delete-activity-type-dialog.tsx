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

interface ActivityType {
  id: string;
  name: string;
  programGoalId: string;
  programGoalName: string;
  createdAt: string;
  updatedAt: string;
}

interface DeleteActivityTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activityType: ActivityType | null;
  onSuccess: (message: string) => void;
  onError: (error: string) => void;
  onRefresh: () => void;
}

export default function DeleteActivityTypeDialog({
  open,
  onOpenChange,
  activityType,
  onSuccess,
  onError,
  onRefresh,
}: DeleteActivityTypeDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!activityType) return;

    setLoading(true);

    try {
      const response = await fetch(
        `/api/admin/activity-types/${activityType.id}`,
        {
          method: 'DELETE',
        }
      );

      const data = await response.json();

      if (data.success) {
        onSuccess(`Activity type "${activityType.name}" deleted successfully!`);
        onOpenChange(false);
        onRefresh();
      } else {
        onError(data.error || 'Failed to delete activity type');
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
          <DialogTitle>Delete Activity Type</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this activity type? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {activityType && (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">
                <strong>Activity Type:</strong> {activityType.name}
              </p>
              <p className="text-sm text-red-800">
                <strong>Program Goal:</strong> {activityType.programGoalName}
              </p>
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
                {loading ? 'Deleting...' : 'Delete Activity Type'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
