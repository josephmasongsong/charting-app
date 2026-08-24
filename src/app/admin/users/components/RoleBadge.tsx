import { Lock, User, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoleBadgeProps {
  role: string;
}

const roleChips: Record<string, { className: string; label: string }> = {
  admin: {
    className: 'bg-(--surface-chrome) font-bold text-(--text-on-chrome)',
    label: 'Administrator',
  },
  user: {
    className:
      'border border-(--bch-blue-100) bg-(--bch-blue-50) font-semibold text-(--bch-blue-700)',
    label: 'Staff user',
  },
  partner: {
    className:
      'border border-(--border-default) bg-(--bch-gray-100) font-semibold text-(--text-muted)',
    label: 'Partner',
  },
};

const roleIcons: Record<string, React.ReactNode> = {
  admin: <Lock className="size-3" />,
  user: <User className="size-3" />,
  partner: <Users className="size-3" />,
};

export default function RoleBadge({ role }: RoleBadgeProps) {
  const chip = roleChips[role];

  return (
    <span
      data-slot="role-badge"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-(--radius-control) px-2.5 py-[3px] text-[12.5px] whitespace-nowrap',
        chip?.className ?? 'bg-(--surface-muted) font-semibold text-(--text-body)'
      )}
    >
      {roleIcons[role]}
      {chip?.label ?? role}
    </span>
  );
}
