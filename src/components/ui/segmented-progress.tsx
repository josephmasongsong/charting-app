import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const segmentVariants = cva("h-full", {
  variants: {
    state: {
      complete: "bg-(--success)",
      inProgress: "bg-(--bch-gold-400)",
    },
  },
  defaultVariants: {
    state: "complete",
  },
})

type Segment = {
  /** Percent of the track this segment occupies. */
  value: number
  state: NonNullable<VariantProps<typeof segmentVariants>["state"]>
}

function SegmentedProgress({
  className,
  label,
  segments,
  ...props
}: React.ComponentProps<"div"> & {
  label: string
  segments: Segment[]
}) {
  const done = segments.find((s) => s.state === "complete")?.value ?? 0
  return (
    <div
      data-slot="segmented-progress"
      className={cn("mb-4", className)}
      {...props}
    >
      <div className="mb-1.5 flex justify-between text-[13.5px]">
        <span className="font-semibold">{label}</span>
        <span className="text-(--text-muted)">{done}% complete</span>
      </div>
      <div
        data-slot="segmented-progress-track"
        role="progressbar"
        aria-valuenow={done}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className="flex h-3.5 overflow-hidden rounded-full bg-(--bch-gray-200)"
      >
        {segments.map((s, i) => (
          <div
            key={i}
            data-slot="segmented-progress-segment"
            className={cn(segmentVariants({ state: s.state }))}
            style={{ width: `${s.value}%` }}
          />
        ))}
      </div>
    </div>
  )
}

export { SegmentedProgress, segmentVariants }
export type { Segment }
