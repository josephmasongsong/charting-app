'use client';

import React, { useState } from 'react';
import { Package, ChevronDown, ChevronRight, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

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

const sectionLabelClass =
  'text-[11.5px] font-bold tracking-[.05em] text-(--text-muted) uppercase';
const sectionBoxClass =
  'rounded-(--radius-card) border border-(--border-default) px-5 py-[18px]';
const outlineButtonClass =
  'h-auto rounded-(--radius-control) border-(--action-primary) bg-(--surface-card) px-[18px] py-[9px] text-[15px] font-normal text-(--action-primary) shadow-none hover:bg-(--action-selected) hover:text-(--action-primary)';

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

export default function SupplyDetailCard({ data }: SupplyDetailCardProps) {
  const router = useRouter();
  const [sitesVisible, setSitesVisible] = useState(true);

  const { supply, siteDistribution } = data;

  return (
    <div className="min-h-screen bg-(--surface-page) px-6 pt-6 pb-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-5">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className={outlineButtonClass}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        <Card className="gap-0 overflow-hidden rounded-(--radius-card) border-(--border-default) bg-(--surface-card) p-0 shadow-(--shadow-card)">
          <div className="flex items-center gap-2.5 border-b border-(--border-default) px-6 py-5">
            <span className="grid size-[30px] shrink-0 place-items-center rounded-(--radius-control) bg-(--action-selected) text-(--action-primary)">
              <Package size={17} />
            </span>
            <h1 className="text-[19px] leading-tight font-bold">
              {supply.name}
            </h1>
          </div>

          <div className="space-y-4 p-6">
            <div className={sectionBoxClass}>
              <h2 className={sectionLabelClass}>Supply Information</h2>
              <div className="mt-3.5 grid grid-cols-2 gap-x-5 gap-y-4 md:grid-cols-4">
                <DetailField
                  label="Quantity"
                  value={supply.quantity.toLocaleString()}
                />
                <DetailField
                  label="Cost per unit"
                  value={`$${parseFloat(supply.costPerUnit).toFixed(2)}`}
                />
                <DetailField
                  label="Total value"
                  value={`$${supply.totalValue.toFixed(2)}`}
                />
                <DetailField label="Sites" value={siteDistribution.length} />
              </div>
            </div>

            <div className={sectionBoxClass}>
              <div className="grid grid-cols-2 gap-5">
                <DetailField
                  label="Distributed"
                  value={`${supply.distributedQuantity.toLocaleString()} units`}
                />
                <DetailField
                  label="Available"
                  value={`${supply.availableQuantity.toLocaleString()} units`}
                />
              </div>
            </div>

            <div className={sectionBoxClass}>
              <div className="grid grid-cols-2 gap-5">
                <DetailField
                  label="Created"
                  value={formatDate(supply.createdAt)}
                />
                <DetailField
                  label="Updated"
                  value={formatDate(supply.updatedAt)}
                />
              </div>
            </div>

            <div className="overflow-hidden rounded-(--radius-card) border border-(--border-default)">
              <button
                onClick={() => setSitesVisible(!sitesVisible)}
                className="flex w-full cursor-pointer items-center justify-between px-5 py-[18px] text-left"
              >
                <h2 className={sectionLabelClass}>Site Distribution</h2>
                {sitesVisible ? (
                  <ChevronDown className="h-4 w-4 text-(--text-muted)" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-(--text-muted)" />
                )}
              </button>

              {sitesVisible && (
                <div>
                  {siteDistribution.map(site => (
                    <div
                      key={site.siteId}
                      className="flex items-center justify-between border-t border-(--border-default) px-5 py-3.5"
                    >
                      <span className="text-[15px] font-semibold">
                        {site.siteName}
                      </span>
                      <span className="inline-block rounded-(--radius-control) bg-(--surface-muted) px-2.5 py-[3px] text-[13.5px] font-bold">
                        {site.quantity.toLocaleString()} units
                      </span>
                    </div>
                  ))}

                  {siteDistribution.length === 0 && (
                    <div className="border-t border-(--border-default) px-5 py-6 text-center text-sm text-(--text-muted)">
                      No sites have this supply
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
