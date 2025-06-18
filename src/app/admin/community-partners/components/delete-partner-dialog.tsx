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

interface CommunityPartner {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface DeletePartnerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partner: CommunityPartner | null;
  onSuccess: (message: string) => void;
  onError: (error: string) => void;
  onRefresh: () => void;
}

export default function DeletePartnerDialog({
  open,
  onOpenChange,
  partner,
  onSuccess,
  onError,
  onRefresh,
}: DeletePartnerDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!partner) return;

    setLoading(true);

    try {
      const response = await fetch(
        `/api/admin/community-partners/${partner.id}`,
        {
          method: 'DELETE',
        }
      );

      const data = await response.json();

      if (data.success) {
        onSuccess(`Community partner "${partner.name}" deleted successfully!`);
        onOpenChange(false);
        onRefresh();
      } else {
        onError(data.error || 'Failed to delete community partner');
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
          <DialogTitle>Delete Community Partner</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this community partner? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {partner && (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">
                <strong>Partner to delete:</strong> {partner.name}
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
                {loading ? 'Deleting...' : 'Delete Partner'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
