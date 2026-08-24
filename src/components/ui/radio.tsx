import * as React from "react"

import { cn } from "@/lib/utils"

function Radio({
  className,
  label,
  id,
  ...props
}: React.ComponentProps<"input"> & { label?: React.ReactNode }) {
  const autoId = React.useId()
  const inputId = id ?? autoId
  return (
    <label
      data-slot="radio"
      htmlFor={inputId}
      className={cn(
        "flex cursor-pointer items-start gap-2 text-[15px]",
        className
      )}
    >
      <input
        id={inputId}
        type="radio"
        data-slot="radio-input"
        className="mt-[3px] size-4 cursor-pointer accent-(--action-primary)"
        {...props}
      />
      <span>{label}</span>
    </label>
  )
}

export { Radio }
