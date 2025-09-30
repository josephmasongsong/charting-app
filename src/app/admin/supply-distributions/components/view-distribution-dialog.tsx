// app/admin/supply-distributions/components/view-distribution-dialog.tsx
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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Truck,
  Calendar,
  MapPin,
  User,
  FileText,
  DollarSign,
  Package,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

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

function formatDistributionType(type: string): string {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getDistributionTypeBadge(type: string) {
  switch (type) {
    case 'door_to_door':
      return 'default';
    case 'community_room_pickup':
      return 'secondary';
    case 'event_distribution':
      return 'outline';
    case 'emergency_distribution':
      return 'destructive';
    default:
      return 'default';
  }
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

  // Fetch detailed distribution data when dialog opens
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Distribution Details
          </DialogTitle>
          <DialogDescription>
            View complete information about this supply distribution.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
            Loading distribution details...
          </div>
        ) : distributionData ? (
          <div className="space-y-6">
            {/* Main Distribution Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Distribution Date
                    </div>
                    <div className="font-medium">
                      {formatDate(
                        distributionData.distribution.distributionDate
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Site</div>
                    <div className="font-medium">
                      {distributionData.distribution.siteName}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Distributed By
                    </div>
                    <div className="font-medium">
                      {distributionData.distribution.userName}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Distribution Type
                  </div>
                  <Badge
                    variant={getDistributionTypeBadge(
                      distributionData.distribution.distributionType
                    )}
                  >
                    {formatDistributionType(
                      distributionData.distribution.distributionType
                    )}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Total Cost
                    </div>
                    <div className="font-bold text-lg font-mono">
                      $
                      {parseFloat(
                        distributionData.distribution.totalCost
                      ).toFixed(2)}
                    </div>
                  </div>
                </div>

                {distributionData.distribution.eventTitle && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">
                      Associated Event
                    </div>
                    <div className="font-medium text-blue-600">
                      {distributionData.distribution.eventTitle}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Recipients */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium">Recipients</h3>
              </div>
              <div className="bg-muted/30 p-3 rounded-lg">
                <p className="text-sm">
                  {distributionData.distribution.recipientNotes}
                </p>
              </div>
            </div>

            {/* Additional Notes */}
            {distributionData.distribution.notes && (
              <div className="space-y-2">
                <h3 className="font-medium">Additional Notes</h3>
                <div className="bg-muted/30 p-3 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">
                    {distributionData.distribution.notes}
                  </p>
                </div>
              </div>
            )}

            <Separator />

            {/* Distribution Items */}
            <div className="space-y-4">
              <button
                onClick={() => setItemsVisible(!itemsVisible)}
                className="flex items-center justify-between w-full"
              >
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-medium">
                    Distributed Items (
                    {distributionData.distributionItems.length})
                  </h3>
                </div>
                {itemsVisible ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </button>

              {itemsVisible && (
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-muted/50 px-4 py-2 grid grid-cols-12 gap-4 text-sm font-medium">
                    <div className="col-span-5">Supply Item</div>
                    <div className="col-span-2 text-center">Quantity</div>
                    <div className="col-span-2 text-center">Unit Cost</div>
                    <div className="col-span-3 text-right">Line Total</div>
                  </div>

                  {distributionData.distributionItems.map((item, index) => (
                    <div
                      key={item.id}
                      className={`px-4 py-3 grid grid-cols-12 gap-4 text-sm ${
                        index % 2 === 0 ? 'bg-white' : 'bg-muted/20'
                      }`}
                    >
                      <div className="col-span-5 font-medium">
                        {item.supplyName}
                      </div>
                      <div className="col-span-2 text-center">
                        {item.quantityDistributed.toLocaleString()}
                      </div>
                      <div className="col-span-2 text-center font-mono">
                        ${parseFloat(item.unitCostAtTime).toFixed(2)}
                      </div>
                      <div className="col-span-3 text-right font-mono font-medium">
                        ${parseFloat(item.lineTotal).toFixed(2)}
                      </div>
                    </div>
                  ))}

                  <div className="bg-muted/50 px-4 py-3 grid grid-cols-12 gap-4 text-sm font-bold border-t">
                    <div className="col-span-9 text-right">
                      Total Distribution Value:
                    </div>
                    <div className="col-span-3 text-right font-mono">
                      $
                      {parseFloat(
                        distributionData.distribution.totalCost
                      ).toFixed(2)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Timestamps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <span className="font-medium">Created:</span>{' '}
                {new Date(
                  distributionData.distribution.createdAt
                ).toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Last Updated:</span>{' '}
                {new Date(
                  distributionData.distribution.updatedAt
                ).toLocaleString()}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-muted-foreground">
            Failed to load distribution details
          </div>
        )}

        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
