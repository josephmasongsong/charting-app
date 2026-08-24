import * as React from "react"

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

type DataTableColumn = {
  key: string
  label: React.ReactNode
  /** Numeric column — right-aligned in header, body and footer. */
  num?: boolean
}

function DataTable({
  className,
  columns,
  rows,
  footer,
  ...props
}: React.ComponentProps<typeof Table> & {
  columns: DataTableColumn[]
  rows: Record<string, React.ReactNode>[]
  /** Totals row keyed by column; rendered in the tinted footer band. */
  footer?: Record<string, React.ReactNode>
}) {
  return (
    <Table
      data-slot="data-table"
      className={cn("border-collapse bg-(--surface-card) text-sm", className)}
      {...props}
    >
      <TableHeader>
        <TableRow className="border-0 hover:bg-transparent">
          {columns.map((c) => (
            <TableHead
              key={c.key}
              className={cn(
                "h-auto border border-[#0A7276] bg-(--surface-chrome) px-3.5 py-2.5 text-xs font-bold tracking-[.04em] whitespace-normal text-(--text-on-chrome) uppercase",
                c.num ? "text-right" : "text-left"
              )}
            >
              {c.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r, i) => (
          <TableRow
            key={i}
            className="border-0 odd:bg-(--surface-card) even:bg-(--surface-muted)"
          >
            {columns.map((c) => (
              <TableCell
                key={c.key}
                className={cn(
                  "border border-(--bch-gray-200) px-3.5 py-[9px] whitespace-normal",
                  c.num && "text-right"
                )}
              >
                {r[c.key]}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
      {footer && (
        <TableFooter className="border-0 bg-transparent">
          <TableRow className="border-0 hover:bg-transparent">
            {columns.map((c) => (
              <TableCell
                key={c.key}
                className={cn(
                  "border border-[#9CCFC6] bg-[#AEDBD3] px-3.5 py-2.5 font-bold whitespace-normal",
                  c.num && "text-right"
                )}
              >
                {footer[c.key]}
              </TableCell>
            ))}
          </TableRow>
        </TableFooter>
      )}
    </Table>
  )
}

export { DataTable }
export type { DataTableColumn }
