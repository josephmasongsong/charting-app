'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface Supply {
  id: string;
  name: string;
  costPerUnit: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

interface SiteDistribution {
  siteId: string;
  siteName: string;
  quantity: number;
}

interface SupplyDetailData {
  supply: {
    id: string;
    name: string;
    costPerUnit: string;
    quantity: number;
    totalValue: number;
    distributedQuantity: number;
    availableQuantity: number;
    createdAt: string;
    updatedAt: string;
  };
  siteDistribution: SiteDistribution[];
}

interface ViewSupplyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supply: Supply | null;
  onError: (error: string) => void;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const sectionLabelClass =
  'text-[11.5px] font-bold tracking-[.05em] text-(--text-muted) uppercase';
const primaryButtonClass =
  'h-auto rounded-(--radius-control) bg-(--action-primary) px-[18px] py-[9px] text-[15px] font-normal text-(--text-on-chrome) shadow-none hover:bg-(--action-primary-hover)';

function DetailField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[13px] text-(--text-muted)">{label}</div>
      <div className="mt-[3px] text-base font-bold">{value}</div>
    </div>
  );
}

export default function ViewSupplyDialog({
  open,
  onOpenChange,
  supply,
  onError,
}: ViewSupplyDialogProps) {
  const [loading, setLoading] = useState(false);
  const [supplyData, setSupplyData] = useState<SupplyDetailData | null>(null);
  const [sitesVisible, setSitesVisible] = useState(true);

  useEffect(() => {
    if (open && supply) {
      fetchSupplyDetails();
    }
  }, [open, supply]);

  const fetchSupplyDetails = async () => {
    if (!supply) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/supplies/${supply.id}`);
      const data = await response.json();

      if (response.ok) {
        setSupplyData(data);
      } else {
        onError(data.error || 'Failed to fetch supply details');
      }
    } catch (error) {
      onError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getTotalValue = () => {
    if (!supplyData) return 0;
    return (
      parseFloat(supplyData.supply.costPerUnit) * supplyData.supply.quantity
    );
  };

  const getTotalUnits = () => {
    if (!supplyData) return 0;
    return supplyData.supply.quantity;
  };

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title={supply?.name || 'Supply Details'}
      className="sm:max-w-[580px]"
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
        View detailed information about this supply and its distribution across
        sites.
      </p>

      {loading ? (
        <div className="mt-4 space-y-3">
          <Skeleton className="h-[104px] rounded-(--radius-card) bg-(--surface-muted)" />
          <Skeleton className="h-[52px] rounded-(--radius-card) bg-(--surface-muted)" />
          <Skeleton className="h-[120px] rounded-(--radius-card) bg-(--surface-muted)" />
        </div>
      ) : supplyData ? (
        <div className="mt-4 max-h-[70vh] space-y-4 overflow-y-auto">
          <div className="rounded-(--radius-card) border border-(--border-default) px-5 py-[18px]">
            <div className={sectionLabelClass}>Supply Information</div>
            <div className="mt-3.5 grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
              <DetailField label="Name" value={supplyData.supply.name} />
              <DetailField
                label="Cost per Unit"
                value={`$${parseFloat(supplyData.supply.costPerUnit).toFixed(2)}`}
              />
              <DetailField
                label="Total Units"
                value={`${getTotalUnits().toLocaleString()} units`}
              />
              <DetailField
                label="Total Value"
                value={`$${getTotalValue().toFixed(2)}`}
              />
              <DetailField
                label="Created"
                value={formatDate(supplyData.supply.createdAt)}
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-(--radius-card) border border-(--border-default)">
            <button
              onClick={() => setSitesVisible(!sitesVisible)}
              className="flex w-full cursor-pointer items-center justify-between px-5 py-[18px] text-left"
            >
              <span className={sectionLabelClass}>
                Units at Each Site ({supplyData.siteDistribution.length} sites)
              </span>
              {sitesVisible ? (
                <ChevronDown className="h-4 w-4 text-(--text-muted)" />
              ) : (
                <ChevronRight className="h-4 w-4 text-(--text-muted)" />
              )}
            </button>

            {sitesVisible && (
              <div className="max-h-[220px] overflow-y-auto">
                {supplyData.siteDistribution.map(site => (
                  <div
                    key={site.siteId}
                    className="flex items-center justify-between border-t border-(--border-default) px-5 py-3.5"
                  >
                    <span className="text-[15px] font-semibold">
                      {site.siteName}
                    </span>
                    <div className="text-right">
                      <span className="inline-block rounded-(--radius-control) bg-(--surface-muted) px-2.5 py-[3px] text-[13.5px] font-bold">
                        {site.quantity.toLocaleString()} units
                      </span>
                      <div className="mt-1 text-[12.5px] text-(--text-muted)">
                        $
                        {(
                          parseFloat(supplyData.supply.costPerUnit) *
                          site.quantity
                        ).toFixed(2)}{' '}
                        value
                      </div>
                    </div>
                  </div>
                ))}

                {supplyData.siteDistribution.length === 0 && (
                  <div className="border-t border-(--border-default) px-5 py-4 text-sm text-(--text-muted)">
                    No sites currently have this supply assigned
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-4 p-6 text-center text-(--text-muted)">
          Failed to load supply details
        </div>
      )}
    </Modal>
  );
}
