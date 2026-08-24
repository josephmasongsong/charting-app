'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';

interface Supply {
  id: string;
  name: string;
  costPerUnit: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

interface DeleteSupplyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supply: Supply | null;
  onSuccess: (message: string) => void;
  onError: (error: string) => void;
  onRefresh: () => void;
}

const dangerButtonClass =
  'h-auto rounded-(--radius-control) bg-(--danger) px-[18px] py-[9px] text-[15px] font-normal text-(--text-on-chrome) shadow-none hover:bg-[#98060D] disabled:opacity-100';
const outlineButtonClass =
  'h-auto rounded-(--radius-control) border-(--action-primary) bg-(--surface-card) px-[18px] py-[9px] text-[15px] font-normal text-(--action-primary) shadow-none hover:bg-(--action-selected) hover:text-(--action-primary)';

export default function DeleteSupplyDialog({
  open,
  onOpenChange,
  supply,
  onSuccess,
  onError,
  onRefresh,
}: DeleteSupplyDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!supply) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/admin/supplies/${supply.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        onSuccess(`Supply "${supply.name}" deleted successfully!`);
        onOpenChange(false);
        onRefresh();
      } else {
        onError(data.error || 'Failed to delete supply');
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
      title="Delete Supply"
      className="sm:max-w-[480px]"
      footer={
        supply && (
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
              {loading ? 'Deleting...' : 'Delete Supply'}
            </Button>
          </>
        )
      }
    >
      <p className="text-(--text-body)">
        Are you sure you want to delete this supply? This action cannot be
        undone.
      </p>
      {supply && (
        <div className="mt-4 rounded-[2px] border-l-[5px] border-l-(--danger) bg-(--danger-surface) p-3.5 text-sm text-(--text-body)">
          <p>
            <strong>Supply to delete:</strong> {supply.name}
          </p>
          <p className="mt-1 text-(--text-muted)">
            Cost: ${supply.costPerUnit} | Quantity: {supply.quantity}
          </p>
        </div>
      )}
    </Modal>
  );
}
