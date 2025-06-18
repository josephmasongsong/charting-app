'use client';

import { useState } from 'react';
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Activity Type</DialogTitle>
          <DialogDescription>
            Add a new activity type and assign it to a program goal.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="createName">Name</Label>
            <Input
              id="createName"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Enter activity type name"
              required
              disabled={loading}
              maxLength={255}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="createProgramGoal">Program Goal</Label>
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
              {loading ? 'Creating...' : 'Create Activity Type'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
