import { EmptyState } from '@/components/ui/empty-state';
import { SearchX, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <EmptyState
      size="page"
      tone="empty"
      icon={SearchX}
      title="Site Not Found"
      description="The site you're looking for doesn't exist or may have been removed."
      action={{ label: 'Back to Sites', href: '/sites', icon: ArrowLeft }}
      secondaryAction={{ label: 'Go to Dashboard', href: '/dashboard', icon: Home }}
    />
  );
}
