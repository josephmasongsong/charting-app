export interface WizardPart { label: string; state: "complete" | "active" | "upcoming"; }
export interface WizardTabsProps {
  parts: WizardPart[];
  onSelect?: (index: number) => void;
}
export function WizardTabs(props: WizardTabsProps): JSX.Element;
