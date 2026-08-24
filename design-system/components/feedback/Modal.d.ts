import { ReactNode } from "react";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  footer?: ReactNode;
  children?: ReactNode;
  /** Centers body copy and footer actions — used for confirmation dialogs. */
  center?: boolean;
}

export function Modal(props: ModalProps): JSX.Element | null;
