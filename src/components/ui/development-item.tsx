import * as React from "react"
import Link from "next/link"
import { HomeIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Development = {
  name: React.ReactNode
  address: React.ReactNode
  units: number
  status: string
  href?: string
}

function DevelopmentItem({
  className,
  dev,
  ...props
}: React.ComponentProps<"div"> & { dev: Development }) {
  const operational = dev.status === "Operational"
  return (
    <div
      data-slot="development-item"
      className={cn(
        "flex items-center gap-3 border-b border-(--bch-gray-200) py-2.5",
        className
      )}
      {...props}
    >
      <div className="grid size-11 shrink-0 place-items-center rounded-(--radius-avatar) bg-(--bch-teal-600) text-(--text-on-chrome)">
        <HomeIcon className="size-[19px]" />
      </div>
      <div className="min-w-0">
        {dev.href ? (
          <Link
            href={dev.href}
            className="text-[14.5px] font-bold text-(--action-primary)"
          >
            {dev.name}
          </Link>
        ) : (
          <span className="text-[14.5px] font-bold text-(--action-primary)">
            {dev.name}
          </span>
        )}
        <div className="text-[12.5px] text-(--text-muted)">
          {dev.address} · {dev.units} units
        </div>
      </div>
      <Badge
        className={cn(
          "ml-auto rounded-full border-transparent px-[9px] py-[3px] text-[11.5px] font-semibold",
          operational
            ? "bg-[#DCF2EC] text-(--bch-teal-600)"
            : "bg-[#FDF1D3] text-[#B07C0A]"
        )}
      >
        {dev.status}
      </Badge>
    </div>
  )
}

export { DevelopmentItem }
export type { Development }
