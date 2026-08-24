import * as React from "react"
import Link from "next/link"
import { ChevronRightIcon, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type QuickStartAction = {
  /** A lucide icon component or an already-rendered element. */
  icon?: LucideIcon | React.ReactNode
  label: React.ReactNode
  /** Rich mode only: supporting line under the label. */
  sub?: React.ReactNode
  href?: string
  onClick?: React.MouseEventHandler<HTMLElement>
}

function renderIcon(icon: QuickStartAction["icon"], size: number) {
  if (!icon) return null
  if (React.isValidElement(icon)) return icon
  const Icon = icon as LucideIcon
  return <Icon size={size} />
}

function ActionSurface({
  action,
  className,
  children,
}: {
  action: QuickStartAction
  className: string
  children: React.ReactNode
}) {
  if (action.href) {
    return (
      <Link href={action.href} onClick={action.onClick} className={className}>
        {children}
      </Link>
    )
  }
  return (
    <button type="button" onClick={action.onClick} className={className}>
      {children}
    </button>
  )
}

function QuickStartCard({
  className,
  title = "What would you like to do today?",
  sub,
  actions = [],
  items = [],
  ...props
}: React.ComponentProps<"div"> & {
  title?: React.ReactNode
  /** Optional supporting line under the title. */
  sub?: React.ReactNode
  /** Simple mode: plain white chips. */
  actions?: QuickStartAction[]
  /** Rich mode: icon + label + description rows. Takes precedence over `actions`. */
  items?: QuickStartAction[]
}) {
  const rich = items.length > 0
  return (
    <div
      data-slot="quick-start-card"
      className={cn(
        "rounded-(--radius-card) bg-(--bch-teal-600) p-6 text-(--text-on-chrome) shadow-(--shadow-card)",
        rich ? "max-w-[340px]" : "max-w-[300px]",
        className
      )}
      {...props}
    >
      <h4 className="text-[19px] leading-[1.3] font-bold">{title}</h4>
      {sub && <p className="mt-1 text-[13px] opacity-85">{sub}</p>}
      <div className="mt-4 flex flex-col gap-2.5">
        {rich
          ? items.map((item, i) => (
              <ActionSurface
                key={i}
                action={item}
                className="flex w-full cursor-pointer items-center gap-3 rounded-(--radius-control) bg-(--surface-card) px-3 py-[11px] text-left text-(--text-body) hover:bg-(--action-selected)"
              >
                <span className="grid size-[34px] shrink-0 place-items-center rounded-(--radius-control) bg-(--action-selected) text-(--action-primary)">
                  {renderIcon(item.icon, 18)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14.5px] font-semibold">
                    {item.label}
                  </span>
                  {item.sub && (
                    <span className="mt-px block text-[12.5px] text-(--text-muted)">
                      {item.sub}
                    </span>
                  )}
                </span>
                <ChevronRightIcon className="size-4 shrink-0 text-(--text-muted)" />
              </ActionSurface>
            ))
          : actions.map((action, i) => (
              <ActionSurface
                key={i}
                action={action}
                className="cursor-pointer rounded-(--radius-control) bg-(--surface-card) px-3.5 py-[9px] text-center text-sm font-semibold text-(--surface-chrome) hover:bg-(--action-selected)"
              >
                {action.label}
              </ActionSurface>
            ))}
      </div>
    </div>
  )
}

export { QuickStartCard }
export type { QuickStartAction }
