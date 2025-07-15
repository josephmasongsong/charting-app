'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export type UserRole = 'admin' | 'user' | 'partner';

export function useRole() {
  const { data: session, status } = useSession();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    if (session?.user?.id) {
      // Fetch user role from your API
      fetch(`/api/users/${session.user.id}`)
        .then(res => res.json())
        .then(data => {
          setUserRole(data.user.role);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [session, status]);

  return {
    role: userRole,
    loading,
    isAdmin: userRole === 'admin',
    isPartner: userRole === 'partner',
    isUser: userRole === 'user',
  };
}
