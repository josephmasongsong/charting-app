import { ReactNode } from "react";

export interface SideItemProps {
  icon?: ReactNode;
  label: string;
  active?: boolean;
  indent?: boolean;
  chevron?: "down" | "right";
  onClick?: () => void;
}
export function SideItem(props: SideItemProps): JSX.Element;

export interface SidebarProps {
  activeItem?: string;
  onSelect?: (item: string) => void;
}
export function Sidebar(props: SidebarProps): JSX.Element;
