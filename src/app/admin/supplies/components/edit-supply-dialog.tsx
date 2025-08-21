'use client';

import { useState, useEffect } from 'react';
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

interface Supply {
  id: string;
  name: string;
  costPerUnit: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

interface EditSupplyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supply: Supply | null;
  onSuccess: (message: string) => void;
  onError: (error: string) => void;
  onRefresh: () => void;
}

export default function EditSupplyDialog({
  open,
  onOpenChange,
  supply,
  onSuccess,
  onError,
  onRefresh,
}: EditSupplyDialogProps) {
  const [form, setForm] = useState({
    name: '',
    costPerUnit: '',
    quantity: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (supply) {
      setForm({
        name: supply.name,
        costPerUnit: supply.costPerUnit,
        quantity: supply.quantity.toString(),
      });
    }
  }, [supply]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supply) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/admin/supplies/${supply.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          costPerUnit: form.costPerUnit,
          quantity: form.quantity,
        }),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess(`Supply "${form.name}" updated successfully!`);
        onOpenChange(false);
        onRefresh();
      } else {
        onError(data.error || 'Failed to update supply');
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
          <DialogTitle>Edit Supply</DialogTitle>
          <DialogDescription>Update the supply information.</DialogDescription>
        </DialogHeader>
        {supply && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editName">Name *</Label>
              <Input
                id="editName"
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
              <Label htmlFor="editCostPerUnit">Cost Per Unit ($)</Label>
              <Input
                id="editCostPerUnit"
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
              <Label htmlFor="editQuantity">Quantity</Label>
              <Input
                id="editQuantity"
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
                {loading ? 'Updating...' : 'Update Supply'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
