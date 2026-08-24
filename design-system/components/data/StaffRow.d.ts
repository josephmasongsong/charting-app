export interface Person {
  initials: string; name: string; title: string; dept: string; branch: string; email: string; phone: string;
}
export interface StaffRowProps {
  person: Person;
  selected?: boolean;
  striped?: boolean;
}
export function StaffRow(props: StaffRowProps): JSX.Element;
