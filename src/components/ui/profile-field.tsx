import * as React from "react"

import { cn } from "@/lib/utils"

function ProfileField({
  className,
  label,
  children,
  ...props
}: React.ComponentProps<"div"> & { label: React.ReactNode }) {
  return (
    <div data-slot="profile-field" className={cn("mb-4", className)} {...props}>
      <b data-slot="profile-field-label" className="mb-0.5 block text-base">
        {label}
      </b>
      <span
        data-slot="profile-field-value"
        className="text-[14.5px] text-(--text-muted)"
      >
        {children}
      </span>
    </div>
  )
}

export { ProfileField }
