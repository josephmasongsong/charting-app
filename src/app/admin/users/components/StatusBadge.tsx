import { Check, User } from 'lucide-react';

interface StatusBadgeProps {
  isActive?: boolean;
}

export default function StatusBadge({ isActive }: StatusBadgeProps) {
  if (isActive === false) {
    return (
      <span
        data-slot="status-badge"
        className="inline-flex items-center gap-1.5 rounded-full border border-(--border-default) bg-(--bch-gray-100) px-2.5 py-[3px] text-xs font-bold tracking-[.5px] whitespace-nowrap text-(--text-muted) uppercase"
      >
        <User className="size-3" />
        Deactivated
      </span>
    );
  }
  return (
    <span
      data-slot="status-badge"
      className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bch-green-50,#EDF6EF)] px-2.5 py-[3px] text-xs font-bold tracking-[.5px] whitespace-nowrap text-(--success) uppercase"
    >
      <Check className="size-3" />
      Active
    </span>
  );
}
