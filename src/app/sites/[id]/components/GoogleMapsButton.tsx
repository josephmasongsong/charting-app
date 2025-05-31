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
      className="flex items-center gap-2"
    >
      <Globe className="h-4 w-4" />
      View on Google Maps
    </Button>
  );
}
