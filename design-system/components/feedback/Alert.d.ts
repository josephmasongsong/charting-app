import { ReactNode } from "react";

export interface AlertProps {
  /** validation = page-top form-error summary; destructive = inline red-bar missing-artifact error; warning = overdue/deadline banner; notice = pink attention banner; empty = no-content state. */
  variant?: "validation" | "destructive" | "warning" | "notice" | "empty";
  title?: string;
  children?: ReactNode;
}

export function Alert(props: AlertProps): JSX.Element;
