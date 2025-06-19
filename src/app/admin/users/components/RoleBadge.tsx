import { Badge } from '@/components/ui/badge';
import { Shield, UserCheck, User } from 'lucide-react';

interface RoleBadgeProps {
  role: string;
}

export default function RoleBadge({ role }: RoleBadgeProps) {
  const variants = {
    admin: 'destructive',
    partner: 'secondary',
    user: 'default',
  } as const;

  const icons = {
    admin: <Shield className="h-3 w-3" />,
    partner: <UserCheck className="h-3 w-3" />,
    user: <User className="h-3 w-3" />,
  };

  return (
    <Badge
      variant={variants[role as keyof typeof variants]}
      className="flex items-center gap-1"
    >
      {icons[role as keyof typeof icons]}
      {role}
    </Badge>
  );
}
