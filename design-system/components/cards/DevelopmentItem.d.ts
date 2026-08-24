export interface Development { name: string; address: string; units: number; status: string; }
export interface DevelopmentItemProps { dev: Development; }
export function DevelopmentItem(props: DevelopmentItemProps): JSX.Element;
