// @/components/reports/monthly/SupplyDistributionsSidebar.tsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Truck } from 'lucide-react';
import { SupplyDistributionSummary } from './types';

interface SupplyDistributionsSidebarProps {
  supplyDistributions: SupplyDistributionSummary[];
}

export function SupplyDistributionsSidebar({
  supplyDistributions,
}: SupplyDistributionsSidebarProps) {
  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Package className="h-5 w-5" />
          Supplies Distributed
        </CardTitle>
      </CardHeader>
      <CardContent>
        {supplyDistributions.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Supply
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Distributions
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Quantity
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {supplyDistributions.map(supply => (
                  <tr
                    key={supply.supplyId}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm font-medium">
                      <div className="truncate">{supply.supplyName}</div>
                    </td>
                    <td className="py-3 px-4 text-sm text-center">
                      {supply.distributionCount}
                    </td>
                    <td className="py-3 px-4 text-sm text-right font-medium">
                      {supply.totalQuantityDistributed.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
            <p className="text-sm font-medium text-muted-foreground">
              No supplies distributed
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              No distributions during this period
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
