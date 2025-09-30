'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Package, ChevronDown, ChevronRight } from 'lucide-react';

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

export default function ViewSupplyDialog({
  open,
  onOpenChange,
  supply,
  onError,
}: ViewSupplyDialogProps) {
  const [loading, setLoading] = useState(false);
  const [supplyData, setSupplyData] = useState<SupplyDetailData | null>(null);
  const [sitesVisible, setSitesVisible] = useState(true);

  // Fetch detailed supply data when dialog opens
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {supply?.name || 'Supply Details'}
          </DialogTitle>
          <DialogDescription>
            View detailed information about this supply and its distribution
            across sites.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
            Loading supply details...
          </div>
        ) : supplyData ? (
          <div className="space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Basic Information */}
            <div className="bg-muted/30 rounded-lg p-4 border">
              <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">
                Supply Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Name</div>
                  <div className="text-base font-medium">
                    {supplyData.supply.name}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Cost per Unit
                  </div>
                  <div className="text-base font-medium">
                    ${parseFloat(supplyData.supply.costPerUnit).toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Total Units
                  </div>
                  <div className="text-base font-medium">
                    {getTotalUnits().toLocaleString()} units
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Total Value
                  </div>
                  <div className="text-base font-medium">
                    ${getTotalValue().toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Created Date */}
            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">
                Created
              </h3>
              <div className="text-base font-medium">
                {formatDate(supplyData.supply.createdAt)}
              </div>
            </div>

            {/* Site Distribution */}
            <div className="border rounded-lg p-4">
              <button
                onClick={() => setSitesVisible(!sitesVisible)}
                className="flex items-center justify-between w-full mb-4"
              >
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Units at Each Site ({supplyData.siteDistribution.length}{' '}
                  sites)
                </h3>
                {sitesVisible ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </button>

              {sitesVisible && (
                <div className="space-y-3 border-t pt-4">
                  {supplyData.siteDistribution.map(site => (
                    <div
                      key={site.siteId}
                      className="flex justify-between items-center py-2 border-b border-muted/40 last:border-b-0"
                    >
                      <span className="text-base font-medium">
                        {site.siteName}
                      </span>
                      <div className="text-right">
                        <span className="text-sm font-medium bg-muted px-2 py-1 rounded">
                          {site.quantity.toLocaleString()} units
                        </span>
                        <div className="text-xs text-muted-foreground mt-1">
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
                    <div className="py-6 text-base text-muted-foreground text-center border-t">
                      No sites currently have this supply assigned
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-muted-foreground">
            Failed to load supply details
          </div>
        )}

        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
