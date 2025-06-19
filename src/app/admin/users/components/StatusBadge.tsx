import { Badge } from '@/components/ui/badge';
import { CheckCircle, UserX } from 'lucide-react';

interface StatusBadgeProps {
  isActive?: boolean;
}

export default function StatusBadge({ isActive }: StatusBadgeProps) {
  if (isActive === false) {
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <UserX className="h-3 w-3" />
        Inactive
      </Badge>
    );
  }
  return (
    <Badge variant="default" className="flex items-center gap-1">
      <CheckCircle className="h-3 w-3" />
      Active
    </Badge>
  );
}
