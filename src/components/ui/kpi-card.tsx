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
        panel: "",
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
  icon: Icon,
  sub,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof kpiCardVariants> & {
    value: React.ReactNode
    label: React.ReactNode
    icon?: React.ComponentType<{ className?: string }>
    sub?: React.ReactNode
  }) {
  // White left-aligned stat panel: muted uppercase label + icon chip on top,
  // large value, optional sub line(s) below.
  if (variant === "panel") {
    return (
      <div
        data-slot="kpi-card"
        className={cn(
          "rounded-(--radius-card) border border-(--border-default) bg-(--surface-card) px-5 pt-[18px] pb-5 shadow-none",
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-between gap-3">
          <h3
            data-slot="kpi-card-label"
            className="text-[11.5px] font-bold tracking-[.06em] text-(--text-muted) uppercase"
          >
            {label}
          </h3>
          {Icon && (
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[rgba(0,98,101,.08)] text-(--surface-chrome)">
              <Icon className="size-4" />
            </span>
          )}
        </div>
        <p
          data-slot="kpi-card-value"
          className="mt-2.5 text-[30px] leading-none font-bold tracking-tight"
        >
          {value}
        </p>
        {sub && <div className="mt-2.5 space-y-1">{sub}</div>}
      </div>
    )
  }
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
