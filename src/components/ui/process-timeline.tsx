import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const timelineDotVariants = cva(
  "grid size-[30px] place-items-center rounded-full border-2 text-xs",
  {
    variants: {
      state: {
        done: "border-(--success) bg-(--success) text-(--text-on-chrome)",
        current:
          "border-(--surface-sidebar) bg-(--surface-card) font-bold text-(--surface-sidebar)",
        pending:
          "border-(--border-default) bg-(--surface-card) text-(--bch-gray-500)",
      },
    },
    defaultVariants: {
      state: "pending",
    },
  }
)

type TimelineStep = {
  label: React.ReactNode
  state: NonNullable<VariantProps<typeof timelineDotVariants>["state"]>
}

function ProcessTimeline({
  className,
  steps,
  ...props
}: React.ComponentProps<"div"> & { steps: TimelineStep[] }) {
  return (
    <div
      data-slot="process-timeline"
      className={cn("my-4 flex flex-wrap items-center", className)}
      {...props}
    >
      {steps.map((step, i) => (
        <React.Fragment key={i}>
          {i > 0 && (
            <div
              data-slot="process-timeline-connector"
              className={cn(
                "mb-[18px] w-[34px] shrink-0 border-t-2",
                steps[i - 1].state === "done"
                  ? "border-(--success)"
                  : "border-(--border-default)"
              )}
            />
          )}
          <div
            data-slot="process-timeline-step"
            data-state={step.state}
            className="flex w-[78px] flex-col items-center gap-[5px]"
          >
            <div className={cn(timelineDotVariants({ state: step.state }))}>
              {step.state === "done" ? (
                <CheckIcon className="size-3.5" />
              ) : (
                i + 1
              )}
            </div>
            <span className="text-[10.5px] font-semibold text-(--text-muted)">
              {step.label}
            </span>
          </div>
        </React.Fragment>
      ))}
    </div>
  )
}

export { ProcessTimeline, timelineDotVariants }
export type { TimelineStep }
