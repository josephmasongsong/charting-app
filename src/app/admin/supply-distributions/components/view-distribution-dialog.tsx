'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Skeleton } from '@/components/ui/skeleton';
import { DataTable } from '@/components/ui/data-table';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { DistributionTypeBadge } from './distribution-type-badge';

interface Distribution {
  id: string;
  eventId: string | null;
  eventTitle: string | null;
  siteId: string;
  siteName: string;
  userId: string;
  userName: string;
  userJobTitle?: string | null;
  distributionDate: string;
  distributionType: string;
  recipientNotes: string;
  totalCost: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface DistributionItem {
  id: string;
  supplyId: string;
  supplyName: string;
  quantityDistributed: number;
  unitCostAtTime: string;
  lineTotal: string;
}

interface DistributionDetailData {
  distribution: Distribution;
  distributionItems: DistributionItem[];
}

interface ViewDistributionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  distribution: Distribution | null;
  onError: (error: string) => void;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

const sectionLabelClass =
  'text-[11.5px] font-bold tracking-[.05em] text-(--text-muted) uppercase';
const primaryButtonClass =
  'h-auto rounded-(--radius-control) bg-(--action-primary) px-[18px] py-[9px] text-[15px] font-normal text-(--text-on-chrome) shadow-none hover:bg-(--action-primary-hover)';

function DetailField({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[13px] text-(--text-muted)">{label}</div>
      <div className="mt-[3px] text-base font-bold">{value}</div>
    </div>
  );
}

export default function ViewDistributionDialog({
  open,
  onOpenChange,
  distribution,
  onError,
}: ViewDistributionDialogProps) {
  const [loading, setLoading] = useState(false);
  const [distributionData, setDistributionData] =
    useState<DistributionDetailData | null>(null);
  const [itemsVisible, setItemsVisible] = useState(true);

  useEffect(() => {
    if (open && distribution) {
      fetchDistributionDetails();
    }
  }, [open, distribution]);

  const fetchDistributionDetails = async () => {
    if (!distribution) return;

    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/supply-distributions/${distribution.id}/details`
      );
      const data = await response.json();

      if (response.ok) {
        setDistributionData(data);
      } else {
        onError(data.error || 'Failed to fetch distribution details');
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
      title="Distribution Details"
      className="sm:max-w-[640px]"
      footer={
        <Button
          onClick={() => onOpenChange(false)}
          className={primaryButtonClass}
        >
          Close
        </Button>
      }
    >
      <p className="text-[13.5px] text-(--text-muted)">
        View complete information about this supply distribution.
      </p>

      {loading ? (
        <div className="mt-4 space-y-3">
          <Skeleton className="h-[120px] rounded-(--radius-card) bg-(--surface-muted)" />
          <Skeleton className="h-[64px] rounded-(--radius-card) bg-(--surface-muted)" />
          <Skeleton className="h-[140px] rounded-(--radius-card) bg-(--surface-muted)" />
        </div>
      ) : distributionData ? (
        <div className="mt-4 max-h-[70vh] space-y-4 overflow-y-auto">
          <div className="rounded-(--radius-card) border border-(--border-default) px-5 py-[18px]">
            <div className={sectionLabelClass}>Distribution Information</div>
            <div className="mt-3.5 grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
              <DetailField
                label="Distribution Date"
                value={formatDate(
                  distributionData.distribution.distributionDate
                )}
              />
              <DetailField
                label="Site"
                value={distributionData.distribution.siteName}
              />
              <DetailField
                label="Distributed By"
                value={
                  <>
                    {distributionData.distribution.userName}
                    {distributionData.distribution.userJobTitle && (
                      <span className="mt-[3px] block text-[12.5px] font-normal text-(--text-muted)">
                        {distributionData.distribution.userJobTitle}
                      </span>
                    )}
                  </>
                }
              />
              <DetailField
                label="Distribution Type"
                value={
                  <DistributionTypeBadge
                    type={distributionData.distribution.distributionType}
                  />
                }
              />
              <DetailField
                label="Total Cost"
                value={`$${parseFloat(
                  distributionData.distribution.totalCost
                ).toFixed(2)}`}
              />
              {distributionData.distribution.eventTitle && (
                <DetailField
                  label="Associated Event"
                  value={distributionData.distribution.eventTitle}
                />
              )}
            </div>
          </div>

          <div className="rounded-(--radius-card) border border-(--border-default) px-5 py-[18px]">
            <div className={sectionLabelClass}>Recipients</div>
            <p className="mt-2.5 rounded-(--radius-control) bg-(--surface-muted) p-3 text-sm">
              {distributionData.distribution.recipientNotes}
            </p>
          </div>

          {distributionData.distribution.notes && (
            <div className="rounded-(--radius-card) border border-(--border-default) px-5 py-[18px]">
              <div className={sectionLabelClass}>Additional Notes</div>
              <p className="mt-2.5 rounded-(--radius-control) bg-(--surface-muted) p-3 text-sm whitespace-pre-wrap">
                {distributionData.distribution.notes}
              </p>
            </div>
          )}

          <div className="overflow-hidden rounded-(--radius-card) border border-(--border-default)">
            <button
              onClick={() => setItemsVisible(!itemsVisible)}
              className="flex w-full cursor-pointer items-center justify-between px-5 py-[18px] text-left"
            >
              <span className={sectionLabelClass}>
                Distributed Items (
                {distributionData.distributionItems.length})
              </span>
              {itemsVisible ? (
                <ChevronDown className="h-4 w-4 text-(--text-muted)" />
              ) : (
                <ChevronRight className="h-4 w-4 text-(--text-muted)" />
              )}
            </button>

            {itemsVisible && (
              <div className="overflow-x-auto px-5 pb-5">
                <DataTable
                  columns={[
                    { key: 'name', label: 'Supply item' },
                    { key: 'qty', label: 'Quantity', num: true },
                    { key: 'unit', label: 'Unit cost', num: true },
                    { key: 'lineTotal', label: 'Line total', num: true },
                  ]}
                  rows={distributionData.distributionItems.map(item => ({
                    name: (
                      <span className="font-semibold">{item.supplyName}</span>
                    ),
                    qty: item.quantityDistributed.toLocaleString(),
                    unit: `$${parseFloat(item.unitCostAtTime).toFixed(2)}`,
                    lineTotal: `$${parseFloat(item.lineTotal).toFixed(2)}`,
                  }))}
                  footer={{
                    name: 'Total distribution value',
                    qty: '',
                    unit: '',
                    lineTotal: `$${parseFloat(
                      distributionData.distribution.totalCost
                    ).toFixed(2)}`,
                  }}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2 text-[12.5px] text-(--text-muted) sm:grid-cols-2">
            <div>
              <span className="font-semibold">Created:</span>{' '}
              {new Date(
                distributionData.distribution.createdAt
              ).toLocaleString()}
            </div>
            <div>
              <span className="font-semibold">Last Updated:</span>{' '}
              {new Date(
                distributionData.distribution.updatedAt
              ).toLocaleString()}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 p-6 text-center text-(--text-muted)">
          Failed to load distribution details
        </div>
      )}
    </Modal>
  );
}
