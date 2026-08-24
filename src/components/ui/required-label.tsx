import * as React from "react"

import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

function RequiredLabel({
  className,
  required = false,
  bold = false,
  children,
  ...props
}: React.ComponentProps<typeof Label> & {
  /** Adds a red asterisk after the label text. Always after, never before. */
  required?: boolean
  bold?: boolean
}) {
  return (
    <Label
      data-slot="required-label"
      className={cn(
        "mb-1.5 block text-[15px] leading-normal text-(--text-body)",
        bold ? "font-bold" : "font-normal",
        className
      )}
      {...props}
    >
      {children}
      {required && (
        <span aria-hidden="true" className="ml-0.5 text-(--danger)">
          *
        </span>
      )}
    </Label>
  )
}

export { RequiredLabel }
