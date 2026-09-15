'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { AlertTriangle } from 'lucide-react';
import { channelLabel, referredToLabel } from '@/lib/referral-options';

interface Referral {
  id: string;
  siteId: string;
  siteName: string;
  userId: string;
  userName: string;
  referralDate: string;
  channel: string;
  referredTo: string;
  createdAt: string;
  updatedAt: string;
}

interface DeleteReferralDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  referral: Referral | null;
  onSuccess: (message: string) => void;
  onError: (error: string) => void;
  onRefresh: () => void;
}

const dangerButtonClass =
  'h-auto rounded-(--radius-control) bg-(--danger) px-[18px] py-[9px] text-[15px] font-normal text-(--text-on-chrome) shadow-none hover:bg-[#98060D] disabled:opacity-100';
const outlineButtonClass =
  'h-auto rounded-(--radius-control) border-(--action-primary) bg-(--surface-card) px-[18px] py-[9px] text-[15px] font-normal text-(--action-primary) shadow-none hover:bg-(--action-selected) hover:text-(--action-primary)';

export default function DeleteReferralDialog({
  open,
  onOpenChange,
  referral,
  onSuccess,
  onError,
  onRefresh,
}: DeleteReferralDialogProps) {
  const [loading, setLoading] = useState(false);

  // referral_date is a DATE column; parse the parts to avoid the UTC shift.
  const formatDate = (dateString: string): string => {
    const [y, m, d] = dateString.slice(0, 10).split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    });
  };

  const handleDelete = async () => {
    if (!referral) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/referrals/${referral.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        onSuccess('Referral deleted successfully!');
        onOpenChange(false);
        onRefresh();
      } else {
        onError(data.error || 'Failed to delete referral');
      }
    } catch {
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
          Delete Referral
        </span>
      }
      className="sm:max-w-[520px]"
      footer={
        referral && (
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
              {loading ? 'Deleting...' : 'Delete Referral'}
            </Button>
          </>
        )
      }
    >
      <p className="text-(--text-body)">
        Are you sure you want to delete this referral? There is no edit flow, so
        a mis-logged referral has to be deleted and logged again. This cannot be
        undone.
      </p>
      {referral && (
        <div className="mt-4 space-y-4">
          <div className="space-y-3 rounded-[2px] border-l-[5px] border-l-(--danger) bg-(--danger-surface) p-4 text-sm text-(--text-body)">
            <div className="grid grid-cols-[150px_1fr] gap-x-3 gap-y-2">
              <span className="font-semibold text-(--text-muted)">
                Referral Date:
              </span>
              <span>{formatDate(referral.referralDate)}</span>

              <span className="font-semibold text-(--text-muted)">Site:</span>
              <span>{referral.siteName}</span>

              <span className="font-semibold text-(--text-muted)">
                Channel:
              </span>
              <span>{channelLabel(referral.channel)}</span>

              <span className="font-semibold text-(--text-muted)">
                Referred To:
              </span>
              <span>{referredToLabel(referral.referredTo)}</span>

              <span className="font-semibold text-(--text-muted)">
                Logged By:
              </span>
              <span>{referral.userName}</span>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
