export interface Segment { value: number; state: "complete" | "inProgress"; }
export interface SegmentedProgressProps { label: string; segments: Segment[]; }
export function SegmentedProgress(props: SegmentedProgressProps): JSX.Element;
