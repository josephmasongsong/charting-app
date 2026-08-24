import { InputHTMLAttributes, ReactNode } from "react";
export interface RadioProps extends InputHTMLAttributes<HTMLInputElement> { label?: ReactNode; }
export function Radio(props: RadioProps): JSX.Element;
