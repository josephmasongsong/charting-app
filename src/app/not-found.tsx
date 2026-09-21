import { EmptyState } from '@/components/ui/empty-state';
import { SearchX, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <EmptyState
      size="page"
      tone="empty"
      icon={SearchX}
      title="Page Not Found"
      description="The page you're looking for doesn't exist or may have been moved."
      action={{ label: 'Go to Dashboard', href: '/dashboard', icon: Home }}
    />
  );
}
