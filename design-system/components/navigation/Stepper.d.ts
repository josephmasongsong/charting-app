import { ReactNode } from "react";

export interface Step { label: string; icon?: ReactNode; state: "done" | "current" | "pending"; }
export interface StepperProps { steps: Step[]; }
export function Stepper(props: StepperProps): JSX.Element;
