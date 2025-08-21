'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CreateSupplyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (message: string) => void;
  onError: (error: string) => void;
  onRefresh: () => void;
}

export default function CreateSupplyDialog({
  open,
  onOpenChange,
  onSuccess,
  onError,
  onRefresh,
}: CreateSupplyDialogProps) {
  const [form, setForm] = useState({
    name: '',
    costPerUnit: '',
    quantity: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/supplies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          costPerUnit: form.costPerUnit || undefined,
          quantity: form.quantity || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess(`Supply "${form.name}" created successfully!`);
        setForm({ name: '', costPerUnit: '', quantity: '' });
        onOpenChange(false);
        onRefresh();
      } else {
        onError(data.error || 'Failed to create supply');
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
          <DialogTitle>Create New Supply</DialogTitle>
          <DialogDescription>
            Add a new supply to your catalog.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="createName">Name *</Label>
            <Input
              id="createName"
              value={form.name}
              onChange={e =>
                setForm(prev => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter supply name"
              required
              disabled={loading}
              maxLength={255}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="createCostPerUnit">Cost Per Unit ($)</Label>
            <Input
              id="createCostPerUnit"
              type="number"
              step="0.01"
              min="0"
              value={form.costPerUnit}
              onChange={e =>
                setForm(prev => ({ ...prev, costPerUnit: e.target.value }))
              }
              placeholder="0.00"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="createQuantity">Initial Quantity</Label>
            <Input
              id="createQuantity"
              type="number"
              min="0"
              value={form.quantity}
              onChange={e =>
                setForm(prev => ({ ...prev, quantity: e.target.value }))
              }
              placeholder="0"
              disabled={loading}
            />
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
              {loading ? 'Creating...' : 'Create Supply'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
