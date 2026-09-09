'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';

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
  tewId: string;
  tewName: string;
  pphId: string | null;
  pphName: string | null;
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

const outlineButtonClass =
  'h-auto rounded-(--radius-control) border-(--action-primary) bg-(--surface-card) px-[18px] py-[9px] text-[15px] font-normal text-(--action-primary) shadow-none hover:bg-(--action-selected) hover:text-(--action-primary)';
const destructiveButtonClass =
  'h-auto rounded-(--radius-control) bg-(--danger) px-[18px] py-[9px] text-[15px] font-normal text-(--text-on-chrome) shadow-none hover:bg-[#98060D] disabled:opacity-100';

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
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title="Delete Site"
      footer={
        site ? (
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
              className={destructiveButtonClass}
            >
              {loading ? 'Deleting...' : 'Delete Site'}
            </Button>
          </>
        ) : undefined
      }
    >
      <p>
        Are you sure you want to delete this site? This action cannot be
        undone.
      </p>
      {site && (
        <div className="mt-4 rounded-[2px] border-l-[5px] border-l-(--danger) bg-(--danger-surface) p-3.5 text-sm text-(--text-body)">
          <p>
            <strong>Site:</strong> {site.name}
          </p>
          <p>
            <strong>Address:</strong> {site.address}
          </p>
          <p>
            <strong>TEW:</strong> {site.tewName}
          </p>
          <p>
            <strong>Tenants:</strong> {site.numberOfTenants}
          </p>
        </div>
      )}
    </Modal>
  );
}
