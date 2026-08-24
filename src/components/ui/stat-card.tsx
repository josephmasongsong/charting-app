import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Colour encodes urgency, not decoration: red = urgent, gold = in progress,
// blue = neutral/informational, teal = neutral/portfolio.
const statCardVariants = cva(
  "flex items-center gap-3 rounded-(--radius-card) border border-(--border-default) border-l-4 bg-(--surface-card) p-4",
  {
    variants: {
      tone: {
        red: "border-l-(--bch-red-600) [--stat-icon-bg:var(--danger-surface)] [--stat-icon-fg:var(--bch-red-600)]",
        gold: "border-l-(--bch-gold-600) [--stat-icon-bg:#FDF1D3] [--stat-icon-fg:#B07C0A]",
        blue: "border-l-(--action-primary) [--stat-icon-bg:var(--action-selected)] [--stat-icon-fg:var(--action-primary)]",
        teal: "border-l-(--bch-teal-600) [--stat-icon-bg:#DCF2EC] [--stat-icon-fg:var(--bch-teal-600)]",
      },
    },
    defaultVariants: {
      tone: "teal",
    },
  }
)

function StatCard({
  className,
  tone,
  icon,
  title,
  sub,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof statCardVariants> & {
    icon?: React.ReactNode
    title: React.ReactNode
    sub: React.ReactNode
  }) {
  return (
    <div
      data-slot="stat-card"
      className={cn(statCardVariants({ tone }), className)}
      {...props}
    >
      <div
        data-slot="stat-card-icon"
        className="grid size-[42px] shrink-0 place-items-center rounded-full bg-(--stat-icon-bg) text-(--stat-icon-fg)"
      >
        {icon}
      </div>
      <div>
        <div data-slot="stat-card-title" className="text-sm font-bold">
          {title}
        </div>
        <div
          data-slot="stat-card-sub"
          className="text-[12.5px] text-(--text-muted)"
        >
          {sub}
        </div>
      </div>
    </div>
  )
}

export { StatCard, statCardVariants }
