'use client';

import {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AvatarTile } from '@/components/ui/avatar-tile';
import { EmptyState } from '@/components/ui/empty-state';
import { Modal } from '@/components/ui/modal';
import { MailCheck, Loader2, Send, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PendingUser {
  id: string;
  name: string;
  email: string;
  jobTitle?: string;
  invitedAt?: string | null;
}

interface PendingInvitationsProps {
  onSuccess: (message: string) => void;
  onError: (error: string) => void;
  onCount?: (count: number) => void;
}

export interface PendingInvitationsRef {
  refreshData: () => void;
}

const rowClass =
  'grid min-w-[620px] grid-cols-[56px_1.2fr_1fr_auto] items-center gap-3 border-b border-(--bch-gray-200) px-4 py-3 text-[14.5px] last:border-b-0 even:bg-(--surface-muted) hover:bg-(--action-selected)';
const subLineClass = 'text-[13.5px] text-(--text-muted)';
const outlineActionClass =
  'h-auto rounded-(--radius-control) border-(--action-primary) bg-(--surface-card) px-3 py-1.5 text-[13.5px] font-normal text-(--action-primary) shadow-none hover:bg-(--action-selected) hover:text-(--action-primary)';
const destructiveActionClass =
  'size-8 rounded-(--radius-control) text-(--danger) hover:bg-(--danger-surface) hover:text-(--danger)';
const primaryButtonClass =
  'h-auto rounded-(--radius-control) bg-(--action-primary) px-[18px] py-[9px] text-[15px] font-normal text-(--text-on-chrome) shadow-none hover:bg-(--action-primary-hover)';
const destructiveButtonClass =
  'h-auto rounded-(--radius-control) bg-(--danger) px-[18px] py-[9px] text-[15px] font-normal text-(--text-on-chrome) shadow-none hover:bg-[#98060D]';

function userInitials(name: string) {
  return name
    .split(/\s+/)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function formatInvited(value?: string | null) {
  if (!value) return 'Invitation date unknown';
  const date = new Date(value);
  const days = Math.floor((Date.now() - date.getTime()) / 86400000);
  const stamp = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  if (days <= 0) return `Invited today · ${stamp}`;
  if (days === 1) return `Invited yesterday · ${stamp}`;
  return `Invited ${days} days ago · ${stamp}`;
}

const PendingInvitations = forwardRef<
  PendingInvitationsRef,
  PendingInvitationsProps
>(({ onSuccess, onError, onCount }, ref) => {
  const [invites, setInvites] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<PendingUser | null>(null);

  const fetchInvites = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        '/api/admin/users?status=pending&limit=100&sortBy=createdAt&sortOrder=desc'
      );
      const data = await response.json();
      if (response.ok) {
        setInvites(data.users);
        onCount?.(data.users.length);
      } else {
        onError(data.error || 'Failed to fetch pending invitations');
      }
    } catch {
      onError('Network error occurred');
    } finally {
      setLoading(false);
    }
  }, [onError, onCount]);

  useImperativeHandle(ref, () => ({ refreshData: fetchInvites }));

  useEffect(() => {
    fetchInvites();
  }, [fetchInvites]);

  const resend = async (user: PendingUser) => {
    try {
      setBusyId(user.id);
      const response = await fetch(
        `/api/admin/users/${user.id}/resend-invite`,
        { method: 'POST' }
      );
      const data = await response.json();
      if (response.ok) {
        onSuccess(data.message);
        fetchInvites();
      } else {
        onError(data.error || 'Failed to resend invitation');
      }
    } catch {
      onError('Network error occurred');
    } finally {
      setBusyId(null);
    }
  };

  const revoke = async () => {
    if (!revoking) return;
    try {
      setBusyId(revoking.id);
      const response = await fetch(`/api/admin/users/${revoking.id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (response.ok) {
        onSuccess(data.message);
        setRevoking(null);
        fetchInvites();
      } else {
        onError(data.error || 'Failed to revoke invitation');
      }
    } catch {
      onError('Network error occurred');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <div className="overflow-hidden rounded-(--radius-card) border border-(--border-default) bg-(--surface-card) shadow-(--shadow-card)">
        {loading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton
                key={i}
                className="h-[68px] rounded-none bg-(--surface-muted)"
              />
            ))}
          </div>
        ) : invites.length === 0 ? (
          <EmptyState
            icon={MailCheck}
            title="No pending invitations"
            description="Everyone who has been invited has signed in at least once."
            className="border-0"
          />
        ) : (
          <div className="overflow-x-auto">
            {invites.map(user => (
              <div key={user.id} className={rowClass}>
                <AvatarTile initials={userInitials(user.name)} size={44} />

                <div className="min-w-0">
                  <b className="block truncate">{user.name}</b>
                  <div className={cn(subLineClass, 'truncate')}>
                    {user.email}
                  </div>
                </div>

                <div className={cn(subLineClass, 'min-w-0 truncate')}>
                  {formatInvited(user.invitedAt)}
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    onClick={() => resend(user)}
                    disabled={busyId === user.id}
                    className={outlineActionClass}
                  >
                    {busyId === user.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Send className="size-4" />
                    )}
                    Resend
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Revoke invitation"
                    aria-label={`Revoke invitation for ${user.name}`}
                    onClick={() => setRevoking(user)}
                    disabled={busyId === user.id}
                    className={destructiveActionClass}
                  >
                    <Trash2 className="size-[17px]" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={!!revoking}
        onClose={() => setRevoking(null)}
        title="Revoke Invitation"
        className="sm:max-w-[480px]"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setRevoking(null)}
              className={cn(primaryButtonClass, 'bg-transparent')}
            >
              Cancel
            </Button>
            <Button
              onClick={revoke}
              disabled={!!busyId}
              className={destructiveButtonClass}
            >
              {busyId ? 'Revoking…' : 'Revoke Invitation'}
            </Button>
          </>
        }
      >
        <p className="text-[13.5px] text-(--text-muted)">
          This deletes the account created for this invitation. They will no
          longer be able to sign in with the credentials they were emailed.
        </p>
        {revoking && (
          <div className="mt-3.5 rounded-[2px] border-l-[5px] border-l-(--danger) bg-(--danger-surface) p-3.5 text-sm">
            <div className="font-bold">{revoking.name}</div>
            <div className="text-(--text-muted)">{revoking.email}</div>
          </div>
        )}
      </Modal>
    </>
  );
});

PendingInvitations.displayName = 'PendingInvitations';

export default PendingInvitations;
