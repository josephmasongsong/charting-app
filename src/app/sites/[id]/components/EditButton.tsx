'use client';

import { Button } from '@/components/ui/button';
import { PenLine } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface EditButtonProps {
  siteId: string;
  variant?:
    | 'default'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link'
    | 'destructive';
  className?: string;
}

export default function EditButton({
  siteId,
  variant = 'default',
  className,
}: EditButtonProps) {
  const router = useRouter();

  return (
    <Button
      onClick={() => router.push(`/admin/sites/${siteId}/edit`)}
      variant={variant}
      className={cn(
        'flex items-center gap-2',
        variant === 'default' &&
          'h-auto rounded-(--radius-control) bg-(--action-primary) px-[18px] py-[9px] text-[15px] font-normal text-(--text-on-chrome) shadow-none hover:bg-(--action-primary-hover)',
        className
      )}
    >
      <PenLine className="h-4 w-4" />
      Edit Site
    </Button>
  );
}
