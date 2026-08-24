import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { BrandMark } from "@/components/ui/brand-mark"
import { cn } from "@/lib/utils"

// teal = default site chrome; blue = pages whose main content is a form
// (creation, settings); dark = PartnerHub.
const appHeaderVariants = cva(
  "flex h-14 items-center justify-between px-4 text-(--text-on-chrome)",
  {
    variants: {
      variant: {
        teal: "bg-(--surface-chrome)",
        blue: "bg-(--action-primary)",
        dark: "bg-(--surface-chrome-dark)",
      },
    },
    defaultVariants: {
      variant: "teal",
    },
  }
)

function AppHeader({
  className,
  variant,
  right,
  children,
  ...props
}: React.ComponentProps<"header"> &
  VariantProps<typeof appHeaderVariants> & {
    /** Content for the right-hand end of the bar (user menu, actions). */
    right?: React.ReactNode
  }) {
  return (
    <header
      data-slot="app-header"
      className={cn(appHeaderVariants({ variant }), className)}
      {...props}
    >
      <span
        data-slot="app-header-brand"
        className="flex items-center gap-2.5 text-[17px] font-bold tracking-[.3px]"
      >
        <BrandMark />
        {children ?? "BC HOUSING"}
      </span>
      {right}
    </header>
  )
}

export { AppHeader, appHeaderVariants }
