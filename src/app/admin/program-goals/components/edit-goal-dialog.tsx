'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';

interface ProgramGoal {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface EditGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: ProgramGoal | null;
  onSuccess: (message: string) => void;
  onError: (error: string) => void;
  onRefresh: () => void;
}

const primaryButtonClass =
  'h-auto rounded-(--radius-control) bg-(--action-primary) px-[18px] py-[9px] text-[15px] font-normal text-(--text-on-chrome) shadow-none hover:bg-(--action-primary-hover) disabled:bg-(--action-primary-disabled) disabled:opacity-100';
const outlineButtonClass =
  'h-auto rounded-(--radius-control) border-(--action-primary) bg-(--surface-card) px-[18px] py-[9px] text-[15px] font-normal text-(--action-primary) shadow-none hover:bg-(--action-selected) hover:text-(--action-primary)';

export default function EditGoalDialog({
  open,
  onOpenChange,
  goal,
  onSuccess,
  onError,
  onRefresh,
}: EditGoalDialogProps) {
  const [form, setForm] = useState({ name: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (goal) {
      setForm({ name: goal.name });
    }
  }, [goal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/admin/program-goals/${goal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess(`Program goal "${form.name}" updated successfully!`);
        onOpenChange(false);
        onRefresh();
      } else {
        onError(data.error || 'Failed to update program goal');
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
      title="Edit Program Goal"
      className="sm:max-w-[480px]"
    >
      <p className="text-[13.5px] text-(--text-muted)">
        Update the program goal information.
      </p>
      {goal && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="editName" className="text-[13.5px] font-bold">
              Name
            </Label>
            <Input
              id="editName"
              value={form.name}
              onChange={e => setForm({ name: e.target.value })}
              placeholder="Enter program goal name"
              required
              disabled={loading}
              maxLength={255}
              className="rounded-(--radius-control) border-(--border-input) shadow-none md:text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-1">
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
              type="submit"
              disabled={loading}
              className={primaryButtonClass}
            >
              {loading ? 'Updating...' : 'Update Goal'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
