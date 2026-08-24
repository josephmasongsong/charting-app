"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function Listbox({
  className,
  options,
  value,
  onChange,
  ...props
}: Omit<React.ComponentProps<"div">, "onChange"> & {
  options: string[]
  value?: string
  onChange?: (value: string) => void
}) {
  return (
    <div
      role="listbox"
      data-slot="listbox"
      className={cn(
        "max-w-60 rounded-(--radius-input) border border-(--border-input) bg-(--surface-card) text-[14.5px]",
        className
      )}
      {...props}
    >
      {options.map((option) => (
        <div
          key={option}
          role="option"
          data-slot="listbox-option"
          aria-selected={option === value}
          onClick={() => onChange?.(option)}
          className="cursor-pointer px-2.5 py-[7px] text-(--text-body) aria-selected:bg-(--action-primary) aria-selected:text-(--text-on-chrome)"
        >
          {option}
        </div>
      ))}
    </div>
  )
}

export { Listbox }
