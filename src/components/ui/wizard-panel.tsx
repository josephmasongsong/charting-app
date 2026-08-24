import * as React from "react"

import { cn } from "@/lib/utils"

function WizardPanel({
  className,
  title,
  footer,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  title?: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <div
      data-slot="wizard-panel"
      className={cn(
        "border border-t-0 border-(--border-default) bg-(--surface-card) p-6",
        className
      )}
      {...props}
    >
      {title && (
        <div
          data-slot="wizard-panel-title"
          className="mb-4 border-b border-(--bch-gray-200) pb-4 text-2xl font-bold"
        >
          {title}
        </div>
      )}
      {children}
      {footer && (
        <div
          data-slot="wizard-panel-footer"
          className="mt-6 flex gap-3 border-t border-(--bch-gray-200) pt-4"
        >
          {footer}
        </div>
      )}
    </div>
  )
}

export { WizardPanel }
