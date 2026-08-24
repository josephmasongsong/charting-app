import * as React from "react"
import Link from "next/link"
import { cva, type VariantProps } from "class-variance-authority"
import type { LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

// Chip tones follow the design system's status rule: red = urgent/forbidden,
// tan = the empty-state banner tint, yellow = attention, gray = neutral.
// Blue is reserved for actions and is deliberately not a tone.
const emptyStateVariants = cva("", {
  variants: {
    tone: {
      danger:
        "[--empty-icon-bg:var(--danger-surface)] [--empty-icon-fg:var(--bch-red-600)]",
      warning:
        "[--empty-icon-bg:var(--warning-surface)] [--empty-icon-fg:var(--warning-text)]",
      empty:
        "[--empty-icon-bg:var(--bch-tan-50)] [--empty-icon-fg:var(--bch-tan-700)]",
      neutral:
        "[--empty-icon-bg:var(--bch-gray-100)] [--empty-icon-fg:var(--text-muted)]",
    },
    size: {
      page: "",
      inline:
        "rounded-(--radius-card) border border-(--bch-gray-200) px-3.5 py-10 text-center",
    },
  },
  defaultVariants: {
    tone: "empty",
    size: "inline",
  },
})

const primaryActionClass =
  "h-auto rounded-(--radius-control) bg-(--action-primary) px-[18px] py-[11px] text-[15.5px] font-normal text-(--text-on-chrome) shadow-none hover:bg-(--action-primary-hover)"
const outlineActionClass =
  "h-auto rounded-(--radius-control) border border-(--action-primary) bg-(--surface-card) px-[18px] py-[11px] text-[15.5px] font-normal text-(--action-primary) shadow-none hover:bg-(--action-selected) hover:text-(--action-primary)"

type EmptyStateAction = {
  label: React.ReactNode
  href?: string
  onClick?: React.MouseEventHandler<HTMLElement>
  icon?: LucideIcon
}

function renderIcon(icon: LucideIcon | React.ReactNode, size: number) {
  if (!icon) return null
  if (React.isValidElement(icon)) return icon
  const Icon = icon as LucideIcon
  return <Icon size={size} />
}

function EmptyStateAction({
  action,
  variant,
  className,
}: {
  action: React.ReactNode | EmptyStateAction
  variant: "primary" | "outline"
  className: string
}) {
  if (React.isValidElement(action) || typeof action !== "object" || action === null) {
    return <>{action}</>
  }
  const a = action as EmptyStateAction
  const classes = cn(
    variant === "primary" ? primaryActionClass : outlineActionClass,
    className
  )
  const content = (
    <>
      {a.icon && <a.icon />}
      {a.label}
    </>
  )
  if (a.href) {
    return (
      <Button asChild variant={variant === "outline" ? "outline" : "default"} className={classes}>
        <Link href={a.href} onClick={a.onClick}>
          {content}
        </Link>
      </Button>
    )
  }
  return (
    <Button
      type="button"
      variant={variant === "outline" ? "outline" : "default"}
      onClick={a.onClick}
      className={classes}
    >
      {content}
    </Button>
  )
}

function EmptyState({
  className,
  tone,
  size,
  icon,
  title,
  description,
  action,
  secondaryAction,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "title"> &
  VariantProps<typeof emptyStateVariants> & {
    /** Lucide icon or element; omit for the template's text-only empty block. */
    icon?: LucideIcon | React.ReactNode
    title: React.ReactNode
    description?: React.ReactNode
    /** Primary action — design-system primary button. */
    action?: React.ReactNode | EmptyStateAction
    /** Secondary action — design-system outline button. */
    secondaryAction?: React.ReactNode | EmptyStateAction
  }) {
  const page = size === "page"
  const body = (
    <>
      {icon && (
        <div
          data-slot="empty-state-icon"
          className={cn(
            "mx-auto grid place-items-center rounded-full bg-(--empty-icon-bg) text-(--empty-icon-fg)",
            page ? "size-12" : "size-[34px]"
          )}
        >
          {renderIcon(icon, page ? 24 : 18)}
        </div>
      )}
      <div
        data-slot="empty-state-title"
        className={cn(
          page
            ? "text-xl leading-tight font-bold text-(--surface-chrome)"
            : "text-[15px] font-semibold text-(--text-body)",
          icon && (page ? "mt-6" : "mt-3")
        )}
      >
        {title}
      </div>
      {description && (
        <p
          data-slot="empty-state-description"
          className="mt-1.5 text-[14.5px] text-(--text-muted)"
        >
          {description}
        </p>
      )}
      {children && (
        <div
          data-slot="empty-state-body"
          className="mt-4 text-[14.5px] text-(--text-muted)"
        >
          {children}
        </div>
      )}
      {(action || secondaryAction) && (
        <div
          data-slot="empty-state-actions"
          className={cn(
            "flex gap-2",
            page ? "mt-8 flex-col" : "mt-4 flex-wrap justify-center"
          )}
        >
          {action && (
            <EmptyStateAction
              action={action}
              variant="primary"
              className={page ? "w-full" : ""}
            />
          )}
          {secondaryAction && (
            <EmptyStateAction
              action={secondaryAction}
              variant="outline"
              className={page ? "w-full" : ""}
            />
          )}
        </div>
      )}
    </>
  )

  if (page) {
    return (
      <div
        data-slot="empty-state"
        data-size="page"
        className={cn(
          "flex min-h-[60vh] items-center justify-center px-6 py-12",
          emptyStateVariants({ tone }),
          className
        )}
        {...props}
      >
        <Card className="w-full max-w-[480px] gap-0 rounded-(--radius-card) border border-(--border-default) bg-(--surface-card) px-12 pt-10 pb-11 text-center shadow-none">
          {body}
        </Card>
      </div>
    )
  }

  return (
    <div
      data-slot="empty-state"
      data-size="inline"
      className={cn(emptyStateVariants({ tone, size }), className)}
      {...props}
    >
      {body}
    </div>
  )
}

export { EmptyState, emptyStateVariants }
export type { EmptyStateAction }
