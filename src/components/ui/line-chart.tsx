"use client"

import * as React from "react"
import {
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import {
  ChartCard,
  ChartLegend,
  chartGridStroke,
  chartTick,
  chartTooltipStyle,
  type ChartDatum,
  type ChartSeries,
} from "@/components/ui/bar-chart"

type LineSeries = ChartSeries & {
  /** Reference/target series: dashed action-blue, no dots. */
  dashed?: boolean
}

// §4.11 line: solid series 2.5px with r=3.5 dots; reference/target series are
// dashed "5 4" with no dots. Y domain hugs the data (trend-vs-target charts are
// read for the gap, not the absolute level).
function LineChart({
  className,
  title,
  data,
  xKey,
  series,
  height = 200,
  ...props
}: React.ComponentProps<"div"> & {
  title?: React.ReactNode
  data: ChartDatum[]
  xKey: string
  series: LineSeries[]
  height?: number
}) {
  return (
    <ChartCard data-slot="line-chart" className={className} title={title} {...props}>
      <ResponsiveContainer
        width="100%"
        height={height}
        initialDimension={{ width: 460, height }}
      >
        <RechartsLineChart
          data={data}
          margin={{ top: 10, right: 10, bottom: 0, left: 10 }}
        >
          <CartesianGrid vertical={false} stroke={chartGridStroke} />
          <XAxis
            dataKey={xKey}
            tickLine={false}
            axisLine={false}
            tick={chartTick(10)}
          />
          <YAxis hide domain={["auto", "auto"]} />
          <Tooltip
            cursor={{ stroke: chartGridStroke }}
            contentStyle={chartTooltipStyle.content}
            labelStyle={chartTooltipStyle.label}
            itemStyle={chartTooltipStyle.item}
          />
          {series.map((s) => (
            <Line
              key={s.key}
              type="linear"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2.5}
              strokeDasharray={s.dashed ? "5 4" : undefined}
              dot={
                s.dashed
                  ? false
                  : { r: 3.5, fill: s.color, stroke: s.color, strokeWidth: 0 }
              }
              activeDot={
                s.dashed
                  ? false
                  : { r: 5, fill: s.color, stroke: "#fff", strokeWidth: 1.5 }
              }
              isAnimationActive={false}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
      <ChartLegend series={series} className="mt-1" />
    </ChartCard>
  )
}

export { LineChart }
export type { LineSeries }
