export interface ChartSeries { key: string; label: string; color: string; }
export interface BarChartProps {
  title?: string;
  data: Record<string, string | number>[];
  xKey: string;
  series: ChartSeries[];
  height?: number;
  /** "vertical" = column chart (categories on x); "horizontal" = bar chart (categories on y), single series only. */
  layout?: "vertical" | "horizontal";
}
export function BarChart(props: BarChartProps): JSX.Element;
