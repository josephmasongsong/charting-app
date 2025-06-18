'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

interface ProgramGoal {
  id: string;
  name: string;
}

interface EditActivityTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activityType: ActivityType | null;
  programGoals: ProgramGoal[];
  onSuccess: (message: string) => void;
  onError: (error: string) => void;
  onRefresh: () => void;
}

export default function EditActivityTypeDialog({
  open,
  onOpenChange,
  activityType,
  programGoals,
  onSuccess,
  onError,
  onRefresh,
}: EditActivityTypeDialogProps) {
  const [form, setForm] = useState({ name: '', programGoalId: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activityType) {
      setForm({
        name: activityType.name,
        programGoalId: activityType.programGoalId,
      });
    }
  }, [activityType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityType) return;

    setLoading(true);

    try {
      const response = await fetch(
        `/api/admin/activity-types/${activityType.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (data.success) {
        onSuccess(`Activity type "${form.name}" updated successfully!`);
        onOpenChange(false);
        onRefresh();
      } else {
        onError(data.error || 'Failed to update activity type');
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
          <DialogTitle>Edit Activity Type</DialogTitle>
          <DialogDescription>
            Update the activity type information and program goal assignment.
          </DialogDescription>
        </DialogHeader>
        {activityType && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editName">Name</Label>
              <Input
                id="editName"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Enter activity type name"
                required
                disabled={loading}
                maxLength={255}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editProgramGoal">Program Goal</Label>
              <Select
                value={form.programGoalId}
                onValueChange={value =>
                  setForm({ ...form, programGoalId: value })
                }
                disabled={loading}
                required
              >
                <SelectTrigger>
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

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Activity Type'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
