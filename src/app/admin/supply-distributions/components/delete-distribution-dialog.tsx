'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { AlertTriangle } from 'lucide-react';
import { formatDistributionType } from './distribution-type-badge';

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

const dangerButtonClass =
  'h-auto rounded-(--radius-control) bg-(--danger) px-[18px] py-[9px] text-[15px] font-normal text-(--text-on-chrome) shadow-none hover:bg-[#98060D] disabled:opacity-100';
const outlineButtonClass =
  'h-auto rounded-(--radius-control) border-(--action-primary) bg-(--surface-card) px-[18px] py-[9px] text-[15px] font-normal text-(--action-primary) shadow-none hover:bg-(--action-selected) hover:text-(--action-primary)';

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
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title={
        <span className="flex items-center gap-2.5">
          <AlertTriangle className="size-5" />
          Delete Distribution
        </span>
      }
      className="sm:max-w-[520px]"
      footer={
        distribution && (
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
              {loading ? 'Deleting...' : 'Delete Distribution'}
            </Button>
          </>
        )
      }
    >
      <p className="text-(--text-body)">
        Are you sure you want to delete this supply distribution? This action
        will restore the distributed supplies back to the site inventory and
        cannot be undone.
      </p>
      {distribution && (
        <div className="mt-4 space-y-4">
          <div className="flex gap-2.5 rounded-[2px] border-l-[5px] border-l-(--danger) bg-(--danger-surface) p-3.5 text-sm text-(--danger)">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <p>
              <strong>Warning:</strong> Deleting this distribution will add the
              distributed supplies back to the site inventory.
            </p>
          </div>

          <div className="space-y-3 rounded-[2px] border-l-[5px] border-l-(--danger) bg-(--danger-surface) p-4 text-sm text-(--text-body)">
            <div className="grid grid-cols-[150px_1fr] gap-x-3 gap-y-2">
              <span className="font-semibold text-(--text-muted)">
                Distribution Date:
              </span>
              <span>{formatDate(distribution.distributionDate)}</span>

              <span className="font-semibold text-(--text-muted)">Site:</span>
              <span>{distribution.siteName}</span>

              <span className="font-semibold text-(--text-muted)">Type:</span>
              <span>
                {formatDistributionType(distribution.distributionType)}
              </span>

              <span className="font-semibold text-(--text-muted)">
                Total Cost:
              </span>
              <span className="tabular-nums">
                ${parseFloat(distribution.totalCost).toFixed(2)}
              </span>

              <span className="font-semibold text-(--text-muted)">
                Distributed By:
              </span>
              <span>{distribution.userName}</span>

              {distribution.eventTitle && (
                <>
                  <span className="font-semibold text-(--text-muted)">
                    Event:
                  </span>
                  <span>{distribution.eventTitle}</span>
                </>
              )}
            </div>

            <div className="border-t border-(--border-default) pt-2.5">
              <div className="mb-1 font-semibold text-(--text-muted)">
                Recipients:
              </div>
              <div className="rounded-(--radius-control) bg-(--surface-card) p-2.5 text-sm">
                {distribution.recipientNotes}
              </div>
            </div>

            {distribution.notes && (
              <div>
                <div className="mb-1 font-semibold text-(--text-muted)">
                  Notes:
                </div>
                <div className="rounded-(--radius-control) bg-(--surface-card) p-2.5 text-sm">
                  {distribution.notes}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
