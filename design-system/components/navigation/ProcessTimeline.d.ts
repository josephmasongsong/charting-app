export interface TimelineStep { label: string; state: "done" | "current" | "pending"; }
export interface ProcessTimelineProps { steps: TimelineStep[]; }
export function ProcessTimeline(props: ProcessTimelineProps): JSX.Element;
