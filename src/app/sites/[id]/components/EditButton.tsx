'use client';

import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
  className = 'flex items-center gap-2',
}: EditButtonProps) {
  const router = useRouter();

  return (
    <Button
      onClick={() => router.push(`/admin/sites/${siteId}/edit`)}
      variant={variant}
      className={className}
    >
      <Edit className="h-4 w-4" />
      Edit Site
    </Button>
  );
}
