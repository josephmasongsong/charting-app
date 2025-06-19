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

interface Site {
  id: string;
  name: string;
  latitude: string;
  longitude: string;
  address: string;
  numberOfTenants: number;
  hasCommunityRoom: boolean;
  hasCommunityPartner: boolean;
  communityPartnerId: string | null;
  communityPartnerName: string | null;
  isSingleSeniorOnly: boolean;
  userId: string;
  userName: string;
  createdAt: string;
  updatedAt: string;
}

interface DeleteSiteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  site: Site | null;
  onSuccess: (message: string) => void;
  onError: (error: string) => void;
  onRefresh: () => void;
}

export default function DeleteSiteDialog({
  open,
  onOpenChange,
  site,
  onSuccess,
  onError,
  onRefresh,
}: DeleteSiteDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!site) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/admin/sites/${site.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        onSuccess(`Site "${site.name}" deleted successfully!`);
        onOpenChange(false);
        onRefresh();
      } else {
        onError(data.error || 'Failed to delete site');
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
          <DialogTitle>Delete Site</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this site? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        {site && (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="text-sm text-red-800">
                <p>
                  <strong>Site:</strong> {site.name}
                </p>
                <p>
                  <strong>Address:</strong> {site.address}
                </p>
                <p>
                  <strong>Manager:</strong> {site.userName}
                </p>
                <p>
                  <strong>Tenants:</strong> {site.numberOfTenants}
                </p>
              </div>
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
                {loading ? 'Deleting...' : 'Delete Site'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
