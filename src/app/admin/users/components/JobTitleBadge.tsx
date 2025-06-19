import { Badge } from '@/components/ui/badge';

interface JobTitleBadgeProps {
  jobTitle?: string;
}

export default function JobTitleBadge({ jobTitle }: JobTitleBadgeProps) {
  if (!jobTitle) return <Badge variant="outline">N/A</Badge>;

  const variants = {
    'Tenant Engagement Worker': 'default',
    'People Plants & Homes': 'secondary',
    'Tenant Support Worker': 'outline',
    'Health Services Manager': 'destructive',
  } as const;

  const shortTitles = {
    'Tenant Engagement Worker': 'TEW',
    'People Plants & Homes': 'PPH',
    'Tenant Support Worker': 'TSW',
    'Health Services Manager': 'HSM',
  } as const;

  return (
    <Badge variant={variants[jobTitle as keyof typeof variants] || 'default'}>
      {shortTitles[jobTitle as keyof typeof shortTitles] || jobTitle}
    </Badge>
  );
}
