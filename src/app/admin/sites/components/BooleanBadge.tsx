import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';

interface BooleanBadgeProps {
  value: boolean;
  trueText: string;
  falseText: string;
  trueVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  falseVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

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
      className="flex items-center gap-1"
    >
      {value ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      {value ? trueText : falseText}
    </Badge>
  );
}
