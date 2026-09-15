import { db, referrals, sites, users } from '@/db';
import { eq, sql } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { Share2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ProfileField } from '@/components/ui/profile-field';
import { AvatarTile } from '@/components/ui/avatar-tile';
import { channelLabel, referredToLabel } from '@/lib/referral-options';
import { cn } from '@/lib/utils';

interface ReferralPageProps {
  params: Promise<{ id: string }>;
}

const surfaceCardClass =
  'gap-0 rounded-(--radius-card) border-(--border-default) bg-(--surface-card) shadow-(--shadow-card)';

// referral_date is a DATE column serialised as YYYY-MM-DD; parse the
// parts to avoid the UTC shift.
function dateParts(dateStr: string) {
  const [y, m, d] = dateStr.slice(0, 10).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function formatDateLong(dateStr: string) {
  return dateParts(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

function formatDateShort(dateStr: string) {
  return dateParts(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

function formatTimestamp(date: Date | string) {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

async function getReferral(id: string) {
  const [referral] = await db
    .select({
      id: referrals.id,
      referralDate: referrals.referralDate,
      channel: referrals.channel,
      referredTo: referrals.referredTo,
      createdAt: referrals.createdAt,
      updatedAt: referrals.updatedAt,
      siteId: referrals.siteId,
      siteName: sites.name,
      userId: referrals.userId,
      userName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
      userJobTitle: users.jobTitle,
    })
    .from(referrals)
    .leftJoin(sites, eq(referrals.siteId, sites.id))
    .leftJoin(users, eq(referrals.userId, users.id))
    .where(eq(referrals.id, id))
    .limit(1);

  return referral;
}

export default async function ReferralPage({ params }: ReferralPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const { id } = await params;
  const referral = await getReferral(id);

  if (!referral) {
    notFound();
  }

  const initials = referral.userName
    ?.split(' ')
    .map(part => part[0])
    .join('');

  return (
    <div className="min-h-screen bg-(--surface-page) px-6 pt-6 pb-12">
      <div className="mx-auto max-w-[1180px]">
        <div>
          <h1 className="text-[28px] leading-tight font-bold tracking-[-.2px]">
            {referral.siteName} — {formatDateShort(referral.referralDate)}
          </h1>
          <p className="mt-1.5 text-[13.5px] text-(--text-muted)">
            Created {formatTimestamp(referral.createdAt)} · Updated{' '}
            {formatTimestamp(referral.updatedAt)}
          </p>
        </div>

        <Card
          className={cn(
            surfaceCardClass,
            'mt-5 grid grid-cols-1 gap-8 p-8 md:grid-cols-[180px_1fr_1.1fr]'
          )}
        >
          <div>
            <div className="grid size-[72px] place-items-center rounded-(--radius-card) bg-(--surface-chrome) text-(--text-on-chrome)">
              <Share2 size={34} />
            </div>
          </div>

          <div>
            <ProfileField label="Referral Date">
              {formatDateLong(referral.referralDate)}
            </ProfileField>
            <ProfileField label="Site">
              <Link
                href={`/sites/${referral.siteId}`}
                className="text-(--action-primary) hover:underline"
              >
                {referral.siteName}
              </Link>
            </ProfileField>
            <ProfileField label="Channel">
              {channelLabel(referral.channel)}
            </ProfileField>
            <ProfileField label="Referred To">
              {referredToLabel(referral.referredTo)}
            </ProfileField>
          </div>

          <div>
            <div className="mb-3 text-[17px] font-bold">Referred By</div>
            <div className="flex items-start gap-3">
              <AvatarTile initials={initials ?? ''} size={44} />
              <div className="min-w-0">
                <Link
                  href={`/users/${referral.userId}`}
                  className="text-[14.5px] font-bold text-(--text-body) hover:text-(--action-primary) hover:underline"
                >
                  {referral.userName}
                </Link>
                {referral.userJobTitle && (
                  <div className="mt-0.5 text-[12.5px] text-(--text-muted)">
                    {referral.userJobTitle}
                  </div>
                )}
              </div>
            </div>

            <p className="mt-5 text-[13.5px] text-(--text-muted)">
              What the tenant asked for is deliberately not recorded — only
              where they were pointed.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: ReferralPageProps) {
  const { id } = await params;
  const referral = await getReferral(id);

  if (!referral) {
    return { title: 'Referral Not Found' };
  }

  return {
    title: `${referral.siteName} — ${formatDateShort(referral.referralDate)} - Referral`,
  };
}
