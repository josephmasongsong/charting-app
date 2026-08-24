"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const wizardTabVariants = cva(
  "flex cursor-pointer items-center gap-2 border-r border-(--border-default) px-[26px] py-3.5 text-[15px] whitespace-nowrap outline-none focus-visible:ring-[3px] focus-visible:ring-(--focus-ring)/50",
  {
    variants: {
      state: {
        complete: "bg-(--surface-card) font-semibold text-(--text-body)",
        active: "bg-(--focus-ring) font-normal text-(--text-on-chrome)",
        upcoming: "bg-transparent font-normal text-(--text-body)",
      },
    },
    defaultVariants: {
      state: "upcoming",
    },
  }
)

type WizardPart = {
  label: React.ReactNode
  state: NonNullable<VariantProps<typeof wizardTabVariants>["state"]>
}

function WizardTabs({
  className,
  parts,
  onSelect,
  ...props
}: Omit<React.ComponentProps<"div">, "onSelect"> & {
  parts: WizardPart[]
  onSelect?: (index: number) => void
}) {
  return (
    <div
      role="tablist"
      data-slot="wizard-tabs"
      className={cn(
        "flex overflow-x-auto rounded-t-(--radius-control) border border-(--border-default) bg-(--surface-muted)",
        className
      )}
      {...props}
    >
      {parts.map((part, i) => (
        <button
          key={i}
          type="button"
          role="tab"
          data-slot="wizard-tab"
          data-state={part.state}
          aria-selected={part.state === "active"}
          onClick={() => onSelect?.(i)}
          className={cn(wizardTabVariants({ state: part.state }))}
        >
          {part.label}
          {part.state === "complete" && (
            <CheckIcon className="size-[15px]" strokeWidth={3.5} />
          )}
        </button>
      ))}
    </div>
  )
}

export { WizardTabs, wizardTabVariants }
export type { WizardPart }
