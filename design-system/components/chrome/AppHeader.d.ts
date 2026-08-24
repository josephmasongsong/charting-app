import { ReactNode } from "react";
export interface AppHeaderProps {
  /** teal = default site chrome; blue = pages whose main content is a form (creation, settings); dark = PartnerHub. */
  variant?: "teal" | "blue" | "dark";
  right?: ReactNode;
}
export function AppHeader(props: AppHeaderProps): JSX.Element;
