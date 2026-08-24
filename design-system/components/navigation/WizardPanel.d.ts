import { ReactNode } from "react";
export interface WizardPanelProps {
  title?: string;
  footer?: ReactNode;
  children?: ReactNode;
}
export function WizardPanel(props: WizardPanelProps): JSX.Element;
