'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';

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

const primaryButtonClass =
  'h-auto rounded-(--radius-control) bg-(--action-primary) px-[18px] py-[9px] text-[15px] font-normal text-(--text-on-chrome) shadow-none hover:bg-(--action-primary-hover) disabled:bg-(--action-primary-disabled) disabled:opacity-100';
const outlineButtonClass =
  'h-auto rounded-(--radius-control) border-(--action-primary) bg-(--surface-card) px-[18px] py-[9px] text-[15px] font-normal text-(--action-primary) shadow-none hover:bg-(--action-selected) hover:text-(--action-primary)';

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
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (supply) {
      setForm({
        name: supply.name,
        costPerUnit: supply.costPerUnit,
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
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title="Edit Supply"
      className="sm:max-w-[480px]"
    >
      <p className="text-[13.5px] text-(--text-muted)">
        Update the supply name and cost. Quantities are managed separately
        through site assignments.
      </p>
      {supply && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="editName" className="text-[13.5px] font-bold">
              Name <span className="text-(--danger)">*</span>
            </Label>
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
              className="rounded-(--radius-control) border-(--border-input) shadow-none md:text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="editCostPerUnit"
              className="text-[13.5px] font-bold"
            >
              Cost Per Unit ($)
            </Label>
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
              {loading ? 'Updating...' : 'Update Supply'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
