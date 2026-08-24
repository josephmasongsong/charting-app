"use client"

import * as React from "react"
import { Cell, Pie, PieChart } from "recharts"

import { ChartCard } from "@/components/ui/bar-chart"
import { cn } from "@/lib/utils"

// §4.11 donut: innerRadius 46 / outerRadius 80, starts at 12 o'clock and runs
// clockwise (startAngle 90 → endAngle -270), legend to the right with value + %.
const INNER_RADIUS = 46
const OUTER_RADIUS = 80
const BOX = OUTER_RADIUS * 2 + 4

type DonutDatum = { name: string; value: number; color: string }

function DonutChart({
  className,
  title,
  data,
  ...props
}: React.ComponentProps<"div"> & {
  title?: React.ReactNode
  data: DonutDatum[]
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  return (
    <ChartCard data-slot="donut-chart" className={className} title={title} {...props}>
      <div className="flex flex-wrap items-center gap-4">
        <PieChart width={BOX} height={BOX}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={INNER_RADIUS}
            outerRadius={OUTER_RADIUS}
            startAngle={90}
            endAngle={-270}
            stroke="none"
            isAnimationActive={false}
          >
            {data.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Pie>
        </PieChart>
        <div data-slot="donut-chart-legend" className="text-[11.5px]">
          {data.map((d) => (
            <div key={d.name} className="mb-2.5 flex items-start gap-2">
              <span
                className={cn("mt-[3px] inline-block size-2.5 shrink-0")}
                style={{ background: d.color }}
              />
              <span>
                <b>{d.name}</b>
                <br />
                <span className="text-(--text-muted)">
                  {d.value.toFixed(2)} ({Math.round((d.value / total) * 100)}%)
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  )
}

export { DonutChart }
export type { DonutDatum }
