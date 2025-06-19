import { Badge } from '@/components/ui/badge';

interface RegionBadgeProps {
  region?: string;
}

export default function RegionBadge({ region }: RegionBadgeProps) {
  const variants = {
    LMDM: 'default',
    VIR: 'secondary',
    Interior: 'outline',
    Northern: 'destructive',
  } as const;

  return (
    <Badge variant={variants[region as keyof typeof variants] || 'default'}>
      {region || 'LMDM'}
    </Badge>
  );
}
