'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import {
  fieldInputClass,
  fieldLabelClass,
  fieldSelectTriggerClass,
} from '@/components/ui/form-fields';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ProgramGoal {
  id: string;
  name: string;
}

interface CreateActivityTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programGoals: ProgramGoal[];
  onSuccess: (message: string) => void;
  onError: (error: string) => void;
  onRefresh: () => void;
}

const primaryButtonClass =
  'h-auto rounded-(--radius-control) bg-(--action-primary) px-[18px] py-[9px] text-[15px] font-normal text-(--text-on-chrome) shadow-none hover:bg-(--action-primary-hover) disabled:bg-(--action-primary-disabled) disabled:opacity-100';
const outlineButtonClass =
  'h-auto rounded-(--radius-control) border-(--action-primary) bg-(--surface-card) px-[18px] py-[9px] text-[15px] font-normal text-(--action-primary) shadow-none hover:bg-(--action-selected) hover:text-(--action-primary)';

export default function CreateActivityTypeDialog({
  open,
  onOpenChange,
  programGoals,
  onSuccess,
  onError,
  onRefresh,
}: CreateActivityTypeDialogProps) {
  const [form, setForm] = useState({ name: '', programGoalId: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/activity-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess(`Activity type "${form.name}" created successfully!`);
        setForm({ name: '', programGoalId: '' });
        onOpenChange(false);
        onRefresh();
      } else {
        onError(data.error || 'Failed to create activity type');
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
      title="Create New Activity Type"
      className="sm:max-w-[480px]"
    >
      <p className="text-[13.5px] text-(--text-muted)">
        Add a new activity type and assign it to a program goal.
      </p>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="createName" className={fieldLabelClass}>
            Name
          </Label>
          <Input
            id="createName"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="Enter activity type name"
            required
            disabled={loading}
            maxLength={255}
            className={fieldInputClass}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="createProgramGoal" className={fieldLabelClass}>
            Program Goal
          </Label>
          <Select
            value={form.programGoalId}
            onValueChange={value => setForm({ ...form, programGoalId: value })}
            disabled={loading}
            required
          >
            <SelectTrigger
              id="createProgramGoal"
              className={fieldSelectTriggerClass}
            >
              <SelectValue placeholder="Select a program goal" />
            </SelectTrigger>
            <SelectContent>
              {programGoals.map(goal => (
                <SelectItem key={goal.id} value={goal.id}>
                  {goal.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          <Button type="submit" disabled={loading} className={primaryButtonClass}>
            {loading ? 'Creating...' : 'Create Activity Type'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
