export interface Column { key: string; label: string; num?: boolean; }
export interface DataTableProps {
  columns: Column[];
  rows: Record<string, React.ReactNode>[];
  footer?: Record<string, React.ReactNode>;
}
export function DataTable(props: DataTableProps): JSX.Element;
