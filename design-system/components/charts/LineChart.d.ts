export interface LineSeries { key: string; label: string; color: string; dashed?: boolean; }
export interface LineChartProps {
  title?: string;
  data: Record<string, string | number>[];
  xKey: string;
  series: LineSeries[];
  height?: number;
}
export function LineChart(props: LineChartProps): JSX.Element;
