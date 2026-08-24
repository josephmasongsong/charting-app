import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const stepperStepVariants = cva(
  "grid size-16 place-items-center rounded-full border-[2.5px] bg-(--surface-card)",
  {
    variants: {
      state: {
        done: "border-(--success) text-(--success)",
        current: "border-(--bch-gold-500) text-(--bch-gold-500)",
        pending: "border-(--border-default) text-(--bch-gray-500)",
      },
    },
    defaultVariants: {
      state: "pending",
    },
  }
)

const stepperLabelVariants = cva("text-[12.5px] font-bold underline", {
  variants: {
    state: {
      done: "text-(--success)",
      current: "text-(--bch-gold-500)",
      pending: "text-(--bch-gray-500)",
    },
  },
  defaultVariants: {
    state: "pending",
  },
})

type StepperStep = {
  label: React.ReactNode
  icon?: React.ReactNode
  state: NonNullable<VariantProps<typeof stepperStepVariants>["state"]>
}

function Stepper({
  className,
  steps,
  ...props
}: React.ComponentProps<"div"> & { steps: StepperStep[] }) {
  return (
    <div
      data-slot="stepper"
      className={cn("flex items-start justify-center py-6", className)}
      {...props}
    >
      {steps.map((step, i) => {
        const reached =
          i > 0 && steps[i - 1].state === "done" && step.state !== "pending"
        return (
          <React.Fragment key={i}>
            {i > 0 && (
              <div
                data-slot="stepper-connector"
                className={cn(
                  "mt-8 w-[90px] shrink-0 border-t-[2.5px]",
                  reached
                    ? "border-solid border-(--success)"
                    : "border-dashed border-[#BFBFBF]"
                )}
              />
            )}
            <div
              data-slot="stepper-step"
              data-state={step.state}
              className="flex w-[150px] flex-col items-center gap-2.5"
            >
              <div className={cn(stepperStepVariants({ state: step.state }))}>
                {step.icon}
              </div>
              <span className={cn(stepperLabelVariants({ state: step.state }))}>
                {step.label}
              </span>
            </div>
          </React.Fragment>
        )
      })}
    </div>
  )
}

export { Stepper, stepperStepVariants }
export type { StepperStep }
