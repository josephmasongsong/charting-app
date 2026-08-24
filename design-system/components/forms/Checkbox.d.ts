import { InputHTMLAttributes, ReactNode } from "react";
export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> { label?: ReactNode; }
export function Checkbox(props: CheckboxProps): JSX.Element;
