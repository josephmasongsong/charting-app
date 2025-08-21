'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
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

interface DeleteSupplyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supply: Supply | null;
  onSuccess: (message: string) => void;
  onError: (error: string) => void;
  onRefresh: () => void;
}

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Supply</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this supply? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        {supply && (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">
                <strong>Supply to delete:</strong> {supply.name}
              </p>
              <p className="text-sm text-red-600 mt-1">
                Cost: ${supply.costPerUnit} | Quantity: {supply.quantity}
              </p>
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
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete Supply'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
