import { EmptyState } from '@/components/ui/empty-state';
import { SearchX, Home, Calendar } from 'lucide-react';

export default function NotFound() {
  return (
    <EmptyState
      size="page"
      tone="empty"
      icon={SearchX}
      title="Event Not Found"
      description="The event you're looking for doesn't exist or may have been removed."
      action={{ label: 'Browse Events', href: '/events', icon: Calendar }}
      secondaryAction={{ label: 'Go to Dashboard', href: '/dashboard', icon: Home }}
    />
  );
}
