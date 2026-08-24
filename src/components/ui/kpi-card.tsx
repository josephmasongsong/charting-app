import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const kpiCardVariants = cva(
  "p-4 text-center text-(--text-on-chrome) shadow-(--shadow-card)",
  {
    variants: {
      variant: {
        default: "bg-(--surface-chrome)",
        tint: "bg-(--bch-teal-500)",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function KpiCard({
  className,
  variant,
  value,
  label,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof kpiCardVariants> & {
    value: React.ReactNode
    label: React.ReactNode
  }) {
  return (
    <div
      data-slot="kpi-card"
      className={cn(kpiCardVariants({ variant }), className)}
      {...props}
    >
      <div
        data-slot="kpi-card-value"
        className="text-[34px] leading-tight font-bold tracking-[.5px]"
      >
        {value}
      </div>
      <div
        data-slot="kpi-card-label"
        className="mt-1 text-[11.5px] font-semibold tracking-[.06em] uppercase"
      >
        {label}
      </div>
    </div>
  )
}

export { KpiCard, kpiCardVariants }
