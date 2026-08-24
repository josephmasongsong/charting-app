'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';

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

const dangerButtonClass =
  'h-auto rounded-(--radius-control) bg-(--danger) px-[18px] py-[9px] text-[15px] font-normal text-(--text-on-chrome) shadow-none hover:bg-[#98060D] disabled:opacity-100';
const outlineButtonClass =
  'h-auto rounded-(--radius-control) border-(--action-primary) bg-(--surface-card) px-[18px] py-[9px] text-[15px] font-normal text-(--action-primary) shadow-none hover:bg-(--action-selected) hover:text-(--action-primary)';

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
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title="Delete Community Partner"
      className="sm:max-w-[480px]"
      footer={
        partner && (
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
              {loading ? 'Deleting...' : 'Delete Partner'}
            </Button>
          </>
        )
      }
    >
      <p className="text-(--text-body)">
        Are you sure you want to delete this community partner? This action
        cannot be undone.
      </p>
      {partner && (
        <div className="mt-4 rounded-[2px] border-l-[5px] border-l-(--danger) bg-(--danger-surface) p-3.5 text-sm text-(--text-body)">
          <p>
            <strong>Partner to delete:</strong> {partner.name}
          </p>
        </div>
      )}
    </Modal>
  );
}
