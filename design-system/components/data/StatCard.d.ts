import { ReactNode } from "react";
export interface StatCardProps {
  /** Color encodes urgency, not decoration: red = urgent, gold = in progress, blue = neutral/informational, teal = neutral/portfolio. */
  tone?: "red" | "gold" | "blue" | "teal";
  icon?: ReactNode;
  title: string;
  sub: string;
}
export function StatCard(props: StatCardProps): JSX.Element;
