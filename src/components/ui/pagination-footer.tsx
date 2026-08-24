import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const pagerButtonClass =
  "h-8 rounded-(--radius-control) border-(--border-default) bg-(--surface-card) text-[13.5px] text-(--action-primary) shadow-none hover:bg-(--action-selected) hover:text-(--action-primary) disabled:border-(--bch-gray-300) disabled:text-(--bch-gray-500) disabled:opacity-100"
const pagerActiveClass =
  "h-8 rounded-(--radius-control) border border-(--action-primary) bg-(--action-primary) text-[13.5px] text-(--text-on-chrome) shadow-none hover:bg-(--action-primary-hover)"

/**
 * Admin-table pager footer: range label on the left, First / Previous /
 * current±2 window with ellipses / Next / Last on the right. Always render it
 * when the table has rows — the label carries the result count even on a
 * single page.
 */
function PaginationFooter({
  className,
  page,
  pages,
  total,
  limit,
  onPageChange,
  ...props
}: React.ComponentProps<"div"> & {
  page: number
  pages: number
  total: number
  limit: number
  onPageChange: (page: number) => void
}) {
  const rangeStart = total === 0 ? 0 : (page - 1) * limit + 1
  const rangeEnd = Math.min(page * limit, total)

  const pageButton = (n: number) => (
    <Button
      key={n}
      variant={n === page ? "default" : "outline"}
      size="sm"
      onClick={() => onPageChange(n)}
      className={cn("w-10", n === page ? pagerActiveClass : pagerButtonClass)}
    >
      {n}
    </Button>
  )

  const ellipsis = (key: string) => (
    <span key={key} className="px-1 text-[13.5px] text-(--text-muted)">
      ...
    </span>
  )

  const numbers: React.ReactNode[] = []
  if (page > 3) {
    numbers.push(pageButton(1))
    if (page > 4) numbers.push(ellipsis("ellipsis1"))
  }
  for (let i = Math.max(1, page - 2); i <= Math.min(pages, page + 2); i++) {
    numbers.push(pageButton(i))
  }
  if (page < pages - 2) {
    if (page < pages - 3) numbers.push(ellipsis("ellipsis2"))
    numbers.push(pageButton(pages))
  }

  return (
    <div
      data-slot="pagination-footer"
      className={cn(
        "flex flex-wrap items-center justify-between gap-4 px-5 py-3.5",
        className
      )}
      {...props}
    >
      <div className="text-[13.5px] text-(--text-muted)">
        {total === 0
          ? "No results"
          : pages > 1
            ? `Showing ${rangeStart} to ${rangeEnd} of ${total} results`
            : `Showing all ${total} results`}
      </div>

      {pages > 1 && (
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={page <= 1}
            className={cn(pagerButtonClass, "hidden sm:inline-flex")}
          >
            First
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className={pagerButtonClass}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="ml-1 hidden sm:inline">Previous</span>
          </Button>

          <div className="flex items-center gap-1">{numbers}</div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= pages}
            className={pagerButtonClass}
          >
            <span className="mr-1 hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pages)}
            disabled={page >= pages}
            className={cn(pagerButtonClass, "hidden sm:inline-flex")}
          >
            Last
          </Button>
        </div>
      )}
    </div>
  )
}

export { PaginationFooter }
