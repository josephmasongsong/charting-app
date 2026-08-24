export interface DonutDatum { name: string; value: number; color: string; }
export interface DonutChartProps { title?: string; data: DonutDatum[]; }
export function DonutChart(props: DonutChartProps): JSX.Element;
