"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Sidebar({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      aria-label="Main"
      data-slot="sidebar"
      className={cn(
        "w-[232px] shrink-0 bg-(--surface-sidebar) py-3 text-(--text-on-chrome)",
        className
      )}
      {...props}
    />
  )
}

/** Collapsible inset that holds a group's sub-items. */
function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group"
      className={cn(
        "mx-2.5 my-0.5 rounded-(--radius-control) bg-(--surface-chrome) py-1.5",
        className
      )}
      {...props}
    />
  )
}

const sidebarItemVariants = cva(
  "flex w-full cursor-pointer items-center gap-2.5 text-left text-(--text-on-chrome) outline-none hover:bg-white/10 focus-visible:bg-white/10",
  {
    variants: {
      indent: {
        false: "px-4 py-[11px] text-[14.5px]",
        true: "py-[9px] pr-4 pl-[34px] text-[13.5px]",
      },
      active: {
        false: "font-normal",
        true: "font-semibold",
      },
    },
    compoundVariants: [
      {
        active: true,
        indent: false,
        className: "bg-(--surface-chrome) hover:bg-(--surface-chrome)",
      },
      {
        active: true,
        indent: true,
        className: "bg-white/15 hover:bg-white/15",
      },
    ],
    defaultVariants: {
      indent: false,
      active: false,
    },
  }
)

function SidebarItem({
  className,
  icon,
  active,
  indent,
  chevron,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof sidebarItemVariants> & {
    icon?: React.ReactNode
    chevron?: "down" | "right"
  }) {
  return (
    <button
      type="button"
      data-slot="sidebar-item"
      data-active={active ? "true" : undefined}
      className={cn(sidebarItemVariants({ indent, active }), className)}
      {...props}
    >
      {icon}
      {children}
      {chevron === "down" && <ChevronDownIcon className="ml-auto size-[13px]" />}
      {chevron === "right" && (
        <ChevronRightIcon className="ml-auto size-[13px]" />
      )}
    </button>
  )
}

export { Sidebar, SidebarGroup, SidebarItem, sidebarItemVariants }
