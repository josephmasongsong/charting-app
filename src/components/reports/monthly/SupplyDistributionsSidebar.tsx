import React from 'react';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EmptyState } from '@/components/ui/empty-state';
import { Package, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SupplyDistributionSummary } from './types';

interface SupplyDistributionsSidebarProps {
  supplyDistributions: SupplyDistributionSummary[];
}

const headCellClass =
  'h-auto whitespace-nowrap border border-[#0a7276] bg-(--surface-chrome) px-3.5 py-2.5 text-left text-xs font-bold tracking-[.04em] text-(--text-on-chrome) uppercase';
const bodyCellClass =
  'whitespace-nowrap border border-(--bch-gray-200) px-3.5 py-[9px]';
const bodyRowClass =
  'border-0 even:bg-(--surface-muted) hover:bg-(--action-selected)';
const footerCellClass =
  'whitespace-nowrap border border-[#9CCFC6] bg-[#AEDBD3] px-3.5 py-2.5 font-bold';

export function SupplyDistributionsSidebar({
  supplyDistributions,
}: SupplyDistributionsSidebarProps) {
  const totalValue = supplyDistributions.reduce(
    (sum, supply) => sum + supply.totalCost,
    0
  );
  const totalQuantity = supplyDistributions.reduce(
    (sum, supply) => sum + supply.totalQuantityDistributed,
    0
  );

  return (
    <Card className="h-fit gap-0 overflow-hidden rounded-(--radius-card) border-(--border-default) bg-(--surface-card) p-0 shadow-none">
      <div className="flex items-center gap-2 border-b border-(--border-default) px-5 py-4 text-base font-bold">
        <Package className="size-4" />
        Supplies Distributed
      </div>
      {supplyDistributions.length > 0 ? (
        <div className="overflow-x-auto">
          <Table className="border-collapse bg-(--surface-card) text-sm">
            <TableHeader>
              <TableRow className="border-0 hover:bg-transparent">
                <TableHead className={headCellClass}>Supply</TableHead>
                <TableHead className={cn(headCellClass, 'text-right')}>
                  Quantity
                </TableHead>
                <TableHead className={cn(headCellClass, 'text-right')}>
                  Total Value
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {supplyDistributions.map(supply => (
                <TableRow key={supply.supplyId} className={bodyRowClass}>
                  <TableCell
                    className={cn(bodyCellClass, 'font-semibold whitespace-normal')}
                  >
                    {supply.supplyName}
                  </TableCell>
                  <TableCell
                    className={cn(bodyCellClass, 'text-right font-semibold')}
                  >
                    {supply.totalQuantityDistributed.toLocaleString()}
                  </TableCell>
                  <TableCell className={cn(bodyCellClass, 'text-right')}>
                    ${supply.totalCost.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="border-0 hover:bg-transparent">
                <TableCell className={footerCellClass}>Total</TableCell>
                <TableCell className={cn(footerCellClass, 'text-right')}>
                  {totalQuantity.toLocaleString()}
                </TableCell>
                <TableCell className={cn(footerCellClass, 'text-right')}>
                  ${totalValue.toFixed(2)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState
          icon={Truck}
          title="No supplies distributed"
          description="No distributions during this period"
          className="border-0"
        />
      )}
    </Card>
  );
}
