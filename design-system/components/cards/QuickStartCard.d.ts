import { ReactNode } from "react";
export interface QuickStartAction {
  /** Icon name from the design system icon set, or a React element. */
  icon?: string | ReactNode;
  label: string;
  sub?: string;
}
export interface QuickStartCardProps {
  title?: string;
  /** Optional supporting line under the title. */
  sub?: string;
  /** Simple mode: plain button labels. */
  actions?: string[];
  /** Rich mode: icon + title + description rows. Takes precedence over `actions`. */
  items?: QuickStartAction[];
}
export function QuickStartCard(props: QuickStartCardProps): JSX.Element;
