'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';

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

const dangerButtonClass =
  'h-auto rounded-(--radius-control) bg-(--danger) px-[18px] py-[9px] text-[15px] font-normal text-(--text-on-chrome) shadow-none hover:bg-[#98060D] disabled:opacity-100';
const outlineButtonClass =
  'h-auto rounded-(--radius-control) border-(--action-primary) bg-(--surface-card) px-[18px] py-[9px] text-[15px] font-normal text-(--action-primary) shadow-none hover:bg-(--action-selected) hover:text-(--action-primary)';

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
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title="Delete Activity Type"
      className="sm:max-w-[480px]"
      footer={
        activityType && (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className={outlineButtonClass}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
              className={dangerButtonClass}
            >
              {loading ? 'Deleting...' : 'Delete Activity Type'}
            </Button>
          </>
        )
      }
    >
      <p className="text-(--text-body)">
        Are you sure you want to delete this activity type? This action cannot
        be undone.
      </p>
      {activityType && (
        <div className="mt-4 rounded-[2px] border-l-[5px] border-l-(--danger) bg-(--danger-surface) p-3.5 text-sm text-(--text-body)">
          <p>
            <strong>Activity Type:</strong> {activityType.name}
          </p>
          <p className="mt-1">
            <strong>Program Goal:</strong> {activityType.programGoalName}
          </p>
        </div>
      )}
    </Modal>
  );
}
