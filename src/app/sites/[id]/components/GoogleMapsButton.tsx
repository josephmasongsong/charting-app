'use client';

import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

interface GoogleMapsButtonProps {
  latitude: string;
  longitude: string;
}

export default function GoogleMapsButton({
  latitude,
  longitude,
}: GoogleMapsButtonProps) {
  const handleClick = () => {
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      className="flex h-8 items-center gap-2 rounded-(--radius-control) border-(--border-default) bg-(--surface-card) text-[13.5px] text-(--action-primary) shadow-none hover:bg-(--action-selected) hover:text-(--action-primary)"
    >
      <Globe className="h-4 w-4" />
      View on Google Maps
    </Button>
  );
}
