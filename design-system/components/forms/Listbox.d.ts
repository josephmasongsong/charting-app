export interface ListboxProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

export function Listbox(props: ListboxProps): JSX.Element;
