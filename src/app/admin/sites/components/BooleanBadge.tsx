import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BooleanBadgeProps {
  value: boolean;
  trueText: string;
  falseText: string;
  trueVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  falseVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

// Design-system boolean pill: filled chrome-teal Yes, bordered grey No.
export default function BooleanBadge({
  value,
  trueText,
  falseText,
  trueVariant = 'default',
  falseVariant = 'secondary',
}: BooleanBadgeProps) {
  return (
    <Badge
      variant={value ? trueVariant : falseVariant}
      className={cn(
        'flex items-center gap-1 rounded-(--radius-control) px-2.5 py-[3px] text-[12.5px]',
        value
          ? 'border-transparent bg-(--surface-chrome) font-bold text-(--text-on-chrome)'
          : 'border-(--border-default) bg-(--bch-gray-100) font-semibold text-(--text-muted)'
      )}
    >
      {value ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      {value ? trueText : falseText}
    </Badge>
  );
}
