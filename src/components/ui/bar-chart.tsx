"use client"

import * as React from "react"
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { cn } from "@/lib/utils"

// Shared house-style pieces (shadcn guide §4.11): gridlines #E6E6E6 horizontal
// only, no axis lines, labels 10–12px, value labels at bar ends, no motion.
const chartGridStroke = "var(--bch-gray-200)"

function chartTick(fontSize: number) {
  return { fontSize, fill: "var(--text-muted)", fontFamily: "var(--font-sans)" }
}

const chartTooltipStyle = {
  content: {
    background: "var(--surface-card)",
    border: "1px solid var(--border-default)",
    borderRadius: "var(--radius-card)",
    fontSize: 12,
    fontFamily: "var(--font-sans)",
    padding: "6px 10px",
  } satisfies React.CSSProperties,
  label: { color: "var(--text-body)", fontWeight: 700 } satisfies React.CSSProperties,
  item: { color: "var(--text-body)" } satisfies React.CSSProperties,
}

type ChartSeries = { key: string; label: string; color: string }
type ChartDatum = Record<string, string | number>

function ChartCard({
  className,
  title,
  children,
  ...props
}: React.ComponentProps<"div"> & { title?: React.ReactNode }) {
  return (
    <div
      data-slot="chart-card"
      className={cn(
        "rounded-(--radius-card) border border-(--border-default) bg-(--surface-card) p-4",
        className
      )}
      {...props}
    >
      {title && (
        <p data-slot="chart-title" className="mb-3 text-sm font-bold">
          {title}
        </p>
      )}
      {children}
    </div>
  )
}

function ChartLegend({
  className,
  series,
  ...props
}: React.ComponentProps<"div"> & { series: ChartSeries[] }) {
  return (
    <div
      data-slot="chart-legend"
      className={cn("mt-2 flex gap-3.5 text-xs", className)}
      {...props}
    >
      {series.map((s) => (
        <span key={s.key} className="flex items-center gap-[5px]">
          <span
            className="inline-block size-[9px] rounded-full"
            style={{ background: s.color }}
          />
          {s.label}
        </span>
      ))}
    </div>
  )
}

function BarChart({
  className,
  title,
  data,
  xKey,
  series,
  height = 220,
  layout = "vertical",
  ...props
}: React.ComponentProps<"div"> & {
  title?: React.ReactNode
  data: ChartDatum[]
  xKey: string
  series: ChartSeries[]
  height?: number
  /** "vertical" = column chart (categories on x); "horizontal" = bar chart (categories on y), single series only. */
  layout?: "vertical" | "horizontal"
}) {
  const horizontal = layout === "horizontal"
  return (
    <ChartCard data-slot="bar-chart" className={className} title={title} {...props}>
      <ResponsiveContainer
        width="100%"
        height={height}
        initialDimension={{ width: 460, height }}
      >
        {horizontal ? (
          <RechartsBarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 36, bottom: 4, left: 0 }}
            barCategoryGap="22%"
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey={xKey}
              tickLine={false}
              axisLine={false}
              width={90}
              tick={chartTick(10)}
            />
            <Tooltip
              cursor={{ fill: "var(--surface-muted)" }}
              contentStyle={chartTooltipStyle.content}
              labelStyle={chartTooltipStyle.label}
              itemStyle={chartTooltipStyle.item}
            />
            <Bar
              dataKey={series[0].key}
              name={series[0].label}
              fill={series[0].color}
              isAnimationActive={false}
            >
              <LabelList
                dataKey={series[0].key}
                position="right"
                fontSize={10.5}
                fontWeight={600}
                fill="var(--text-body)"
              />
            </Bar>
          </RechartsBarChart>
        ) : (
          <RechartsBarChart
            data={data}
            margin={{ top: 14, right: 10, bottom: 0, left: -20 }}
            barCategoryGap="20%"
            barGap={2}
          >
            <CartesianGrid vertical={false} stroke={chartGridStroke} />
            <XAxis
              dataKey={xKey}
              tickLine={false}
              axisLine={false}
              tick={chartTick(11)}
            />
            <YAxis tickLine={false} axisLine={false} tick={chartTick(10)} />
            <Tooltip
              cursor={{ fill: "var(--surface-muted)" }}
              contentStyle={chartTooltipStyle.content}
              labelStyle={chartTooltipStyle.label}
              itemStyle={chartTooltipStyle.item}
            />
            {series.map((s) => (
              <Bar
                key={s.key}
                dataKey={s.key}
                name={s.label}
                fill={s.color}
                isAnimationActive={false}
              >
                <LabelList
                  dataKey={s.key}
                  position="top"
                  fontSize={10}
                  fontWeight={600}
                  fill="var(--text-body)"
                />
              </Bar>
            ))}
          </RechartsBarChart>
        )}
      </ResponsiveContainer>
      {!horizontal && series.length > 1 && <ChartLegend series={series} />}
    </ChartCard>
  )
}

export { BarChart, ChartCard, ChartLegend, chartGridStroke, chartTick, chartTooltipStyle }
export type { ChartDatum, ChartSeries }
