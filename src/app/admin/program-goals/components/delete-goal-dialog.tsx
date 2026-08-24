'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';

interface ProgramGoal {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface DeleteGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: ProgramGoal | null;
  onSuccess: (message: string) => void;
  onError: (error: string) => void;
  onRefresh: () => void;
}

const dangerButtonClass =
  'h-auto rounded-(--radius-control) bg-(--danger) px-[18px] py-[9px] text-[15px] font-normal text-(--text-on-chrome) shadow-none hover:bg-[#98060D] disabled:opacity-100';
const outlineButtonClass =
  'h-auto rounded-(--radius-control) border-(--action-primary) bg-(--surface-card) px-[18px] py-[9px] text-[15px] font-normal text-(--action-primary) shadow-none hover:bg-(--action-selected) hover:text-(--action-primary)';

export default function DeleteGoalDialog({
  open,
  onOpenChange,
  goal,
  onSuccess,
  onError,
  onRefresh,
}: DeleteGoalDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!goal) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/admin/program-goals/${goal.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        onSuccess(`Program goal "${goal.name}" deleted successfully!`);
        onOpenChange(false);
        onRefresh();
      } else {
        onError(data.error || 'Failed to delete program goal');
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
      title="Delete Program Goal"
      className="sm:max-w-[480px]"
      footer={
        goal && (
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
              {loading ? 'Deleting...' : 'Delete Goal'}
            </Button>
          </>
        )
      }
    >
      <p className="text-(--text-body)">
        Are you sure you want to delete this program goal? This action cannot
        be undone.
      </p>
      {goal && (
        <div className="mt-4 rounded-[2px] border-l-[5px] border-l-(--danger) bg-(--danger-surface) p-3.5 text-sm text-(--text-body)">
          <p>
            <strong>Goal to delete:</strong> {goal.name}
          </p>
        </div>
      )}
    </Modal>
  );
}
