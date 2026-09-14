'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import { fieldInputClass, fieldLabelClass } from '@/components/ui/form-fields';

interface CreateSupplyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (message: string) => void;
  onError: (error: string) => void;
  onRefresh: () => void;
}

const primaryButtonClass =
  'h-auto rounded-(--radius-control) bg-(--action-primary) px-[18px] py-[9px] text-[15px] font-normal text-(--text-on-chrome) shadow-none hover:bg-(--action-primary-hover) disabled:bg-(--action-primary-disabled) disabled:opacity-100';
const outlineButtonClass =
  'h-auto rounded-(--radius-control) border-(--action-primary) bg-(--surface-card) px-[18px] py-[9px] text-[15px] font-normal text-(--action-primary) shadow-none hover:bg-(--action-selected) hover:text-(--action-primary)';

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
        }),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess(`Supply "${form.name}" created successfully!`);
        setForm({
          name: '',
          costPerUnit: '',
        });
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
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title="Create New Supply"
      className="sm:max-w-[480px]"
    >
      <p className="text-[13.5px] text-(--text-muted)">
        Add a new supply to your catalog. Quantities will be managed through
        site assignments.
      </p>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="createName" className={fieldLabelClass}>
            Name <span className="text-(--danger)">*</span>
          </Label>
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
            className={fieldInputClass}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="createCostPerUnit" className={fieldLabelClass}>
            Cost Per Unit ($)
          </Label>
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
            className={fieldInputClass}
          />
          <p className="text-[12.5px] text-(--text-muted)">
            Optional - can be updated later
          </p>
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
            disabled={loading || !form.name.trim()}
            className={primaryButtonClass}
          >
            {loading ? 'Creating...' : 'Create Supply'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
