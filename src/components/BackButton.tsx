'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BackButtonProps {
  href?: string;
  variant?:
    | 'default'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link'
    | 'destructive';
  className?: string;
  text?: string;
}

export default function BackButton({
  href,
  variant = 'outline',
  className = 'flex items-center gap-2',
  text = 'Back',
}: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <Button variant={variant} onClick={handleClick} className={className}>
      <ArrowLeft className="h-4 w-4" />
      {text}
    </Button>
  );
}
