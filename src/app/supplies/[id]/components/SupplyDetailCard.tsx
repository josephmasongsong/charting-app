'use client';

import React, { useState } from 'react';
import { Package, ChevronDown, ChevronRight, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface Supply {
  id: string;
  name: string;
  costPerUnit: string;
  quantity: number;
  totalValue: number;
  distributedQuantity: number;
  availableQuantity: number;
  createdAt: string;
  updatedAt: string;
}

interface SiteDistribution {
  siteId: string;
  siteName: string;
  quantity: number;
}

interface SupplyDetailCardProps {
  data: {
    supply: Supply;
    siteDistribution: SiteDistribution[];
  };
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function SupplyDetailCard({ data }: SupplyDetailCardProps) {
  const router = useRouter();
  const [sitesVisible, setSitesVisible] = useState(true);

  const { supply, siteDistribution } = data;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-2xl">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        <div className="rounded-lg border bg-card shadow-sm">
          {/* Header */}
          <div className="border-b p-6">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-muted-foreground" />
              <h1 className="text-lg font-semibold">{supply.name}</h1>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Main Metrics */}
            <div className="bg-muted/30 rounded-lg p-4 border">
              <h2 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">
                Supply Information
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Quantity
                  </div>
                  <div className="text-base font-medium">
                    {supply.quantity.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Cost per unit
                  </div>
                  <div className="text-base font-medium">
                    ${parseFloat(supply.costPerUnit).toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Total value
                  </div>
                  <div className="text-base font-medium">
                    ${supply.totalValue.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Sites
                  </div>
                  <div className="text-base font-medium">
                    {siteDistribution.length}
                  </div>
                </div>
              </div>
            </div>

            {/* Distribution */}
            <div className="border rounded-lg p-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Distributed
                  </div>
                  <div className="text-base font-medium">
                    {supply.distributedQuantity.toLocaleString()} units
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Available
                  </div>
                  <div className="text-base font-medium">
                    {supply.availableQuantity.toLocaleString()} units
                  </div>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="border rounded-lg p-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Created
                  </div>
                  <div className="text-base font-medium">
                    {formatDate(supply.createdAt)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Updated
                  </div>
                  <div className="text-base font-medium">
                    {formatDate(supply.updatedAt)}
                  </div>
                </div>
              </div>
            </div>

            {/* Site Distribution */}
            <div className="border rounded-lg p-4">
              <button
                onClick={() => setSitesVisible(!sitesVisible)}
                className="flex items-center justify-between w-full mb-4"
              >
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Site Distribution
                </h2>
                {sitesVisible ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </button>

              {sitesVisible && (
                <div className="space-y-3 border-t pt-4">
                  {siteDistribution.map(site => (
                    <div
                      key={site.siteId}
                      className="flex justify-between items-center py-2 border-b border-muted/40 last:border-b-0"
                    >
                      <span className="text-base font-medium">
                        {site.siteName}
                      </span>
                      <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                        {site.quantity.toLocaleString()} units
                      </span>
                    </div>
                  ))}

                  {siteDistribution.length === 0 && (
                    <div className="py-6 text-base text-muted-foreground text-center border-t">
                      No sites have this supply
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
