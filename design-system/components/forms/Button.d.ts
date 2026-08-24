import { ReactNode, CSSProperties, MouseEventHandler } from "react";

export interface ButtonProps {
  /** Visual style. "primary" (blue) is the default in-flow action; "teal" is reserved for top-level entry CTAs only, never inside a form workflow. */
  variant?: "primary" | "outline" | "teal" | "soft" | "destructive";
  disabled?: boolean;
  children?: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  style?: CSSProperties;
  type?: "button" | "submit";
}

export function Button(props: ButtonProps): JSX.Element;
