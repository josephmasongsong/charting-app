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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface Distribution {
  id: string;
  eventId: string | null;
  eventTitle: string | null;
  siteId: string;
  siteName: string;
  userId: string;
  userName: string;
  distributionDate: string;
  distributionType: string;
  recipientNotes: string;
  totalCost: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface DeleteDistributionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  distribution: Distribution | null;
  onSuccess: (message: string) => void;
  onError: (error: string) => void;
  onRefresh: () => void;
}

export default function DeleteDistributionDialog({
  open,
  onOpenChange,
  distribution,
  onSuccess,
  onError,
  onRefresh,
}: DeleteDistributionDialogProps) {
  const [loading, setLoading] = useState(false);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDistributionType = (type: string): string => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleDelete = async () => {
    if (!distribution) return;

    setLoading(true);

    try {
      const response = await fetch(
        `/api/admin/supply-distributions/${distribution.id}`,
        {
          method: 'DELETE',
        }
      );

      const data = await response.json();

      if (data.success) {
        onSuccess(
          'Distribution deleted successfully and inventory has been restored!'
        );
        onOpenChange(false);
        onRefresh();
      } else {
        onError(data.error || 'Failed to delete distribution');
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
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Delete Distribution
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this supply distribution? This
            action will restore the distributed supplies back to the site
            inventory and cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {distribution && (
          <div className="space-y-4">
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Warning:</strong> Deleting this distribution will add
                the distributed supplies back to the site inventory.
              </AlertDescription>
            </Alert>

            <div className="space-y-3 p-4 bg-gray-50 border border-gray-200 rounded-md">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-medium text-gray-600">
                  Distribution Date:
                </div>
                <div>{formatDate(distribution.distributionDate)}</div>

                <div className="font-medium text-gray-600">Site:</div>
                <div>{distribution.siteName}</div>

                <div className="font-medium text-gray-600">Type:</div>
                <div>
                  {formatDistributionType(distribution.distributionType)}
                </div>

                <div className="font-medium text-gray-600">Total Cost:</div>
                <div className="font-mono">
                  ${parseFloat(distribution.totalCost).toFixed(2)}
                </div>

                <div className="font-medium text-gray-600">Distributed By:</div>
                <div>{distribution.userName}</div>

                {distribution.eventTitle && (
                  <>
                    <div className="font-medium text-gray-600">Event:</div>
                    <div>{distribution.eventTitle}</div>
                  </>
                )}
              </div>

              <div className="pt-2 border-t border-gray-300">
                <div className="font-medium text-gray-600 mb-1">
                  Recipients:
                </div>
                <div className="text-sm bg-white p-2 rounded border">
                  {distribution.recipientNotes}
                </div>
              </div>

              {distribution.notes && (
                <div>
                  <div className="font-medium text-gray-600 mb-1">Notes:</div>
                  <div className="text-sm bg-white p-2 rounded border">
                    {distribution.notes}
                  </div>
                </div>
              )}
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
                {loading ? 'Deleting...' : 'Delete Distribution'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
