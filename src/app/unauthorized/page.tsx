import { EmptyState } from '@/components/ui/empty-state';
import { ShieldAlert } from 'lucide-react';

export default function Unauthorized() {
  return (
    <EmptyState
      size="page"
      tone="danger"
      icon={ShieldAlert}
      title="Access Denied"
      description="You don't have permission to access this page."
      action={{ label: 'Go to Dashboard', href: '/dashboard' }}
      secondaryAction={{
        label: 'Sign In with Different Account',
        href: '/login',
      }}
    >
      Please contact an administrator if you believe this is an error.
    </EmptyState>
  );
}
