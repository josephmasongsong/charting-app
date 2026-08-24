import { ReactNode } from "react";

export interface RequiredLabelProps {
  children?: ReactNode;
  /** Adds a red asterisk after the label text. Always after, never bold, never before. */
  required?: boolean;
  bold?: boolean;
  htmlFor?: string;
}

export function RequiredLabel(props: RequiredLabelProps): JSX.Element;
