import { db, users, sites } from '@/db';
import { or, eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { Home } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ProfileField } from '@/components/ui/profile-field';
import StatusBadge from '@/app/admin/users/components/StatusBadge';
import { AvatarTile } from '@/components/ui/avatar-tile';
import { cn } from '@/lib/utils';

interface UserPageProps {
  params: Promise<{ id: string }>;
}

const surfaceCardClass =
  'gap-0 rounded-(--radius-card) border-(--border-default) bg-(--surface-card) shadow-(--shadow-card)';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrator',
  user: 'User',
};


async function getUser(userId: string) {
  const [user] = await db
    .select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      role: users.role,
      jobTitle: users.jobTitle,
      isActive: users.isActive,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user;
}

async function getAssignedSites(userId: string) {
  return db
    .select({
      id: sites.id,
      name: sites.name,
      address: sites.address,
      numberOfTenants: sites.numberOfTenants,
    })
    .from(sites)
    // Sites where this person is either the TEW or the PPH programmer.
    .where(or(eq(sites.tewId, userId), eq(sites.pphId, userId)))
    .orderBy(sites.name);
}

export default async function UserPage({ params }: UserPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const { id } = await params;
  const user = await getUser(id);

  if (!user) {
    notFound();
  }

  const assignedSites = await getAssignedSites(id);
  const fullName = `${user.firstName} ${user.lastName}`;
  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`;

  return (
    <div className="min-h-screen bg-(--surface-page) px-6 pt-6 pb-12">
      <div className="mx-auto max-w-[1180px]">
        <div>
          <h1 className="text-[28px] leading-tight font-bold tracking-[-.2px]">
            {fullName}
          </h1>
          <p className="mt-1.5 text-[15px] text-(--text-muted)">
            User record and assigned sites
          </p>
        </div>

        <Card
          className={cn(
            surfaceCardClass,
            'mt-5 grid grid-cols-1 gap-8 p-8 md:grid-cols-[220px_1fr_1.1fr]'
          )}
        >
          <div>
            <AvatarTile initials={initials} size={96} />
            <div className="mt-3.5 text-[22px] leading-[1.25] font-bold">
              {fullName}
            </div>
          </div>

          <div>
            <ProfileField label="Role">
              {ROLE_LABELS[user.role ?? ''] ?? user.role ?? 'N/A'}
            </ProfileField>
            <ProfileField label="Job Title">
              {user.jobTitle ?? 'N/A'}
            </ProfileField>
            <ProfileField label="E-mail">
              <a
                href={`mailto:${user.email}`}
                className="text-(--action-primary) hover:underline"
              >
                {user.email}
              </a>
            </ProfileField>
            <ProfileField label="Account Status">
              <StatusBadge isActive={user.isActive} />
            </ProfileField>
          </div>

          <div>
            <div className="mb-3 text-[17px] font-bold">
              Developments ({assignedSites.length})
            </div>
            {assignedSites.length > 0 ? (
              <div>
                {assignedSites.map(site => (
                  <div
                    key={site.id}
                    className="flex items-center gap-3 border-b border-(--bch-gray-200) py-2.5"
                  >
                    <div className="grid size-11 shrink-0 place-items-center rounded-(--radius-avatar) bg-(--bch-teal-600) text-white">
                      <Home size={19} />
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/sites/${site.id}`}
                        className="text-[14.5px] font-bold text-(--action-primary) hover:underline"
                      >
                        {site.name}
                      </Link>
                      <div className="text-[12.5px] text-(--text-muted)">
                        {site.address} · {site.numberOfTenants} tenant
                        {site.numberOfTenants === 1 ? '' : 's'}
                      </div>
                    </div>
                    {/* TODO: /users/[id] — not wired: template status pill
                        (Operational / In development) needs a sites.status
                        column. */}
                  </div>
                ))}
              </div>
            ) : (
              <p className="pt-1 text-sm text-(--text-muted)">
                Not assigned as primary on any developments.
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: UserPageProps) {
  const { id } = await params;
  const user = await getUser(id);

  if (!user) {
    return { title: 'User Not Found' };
  }

  return {
    title: `${user.firstName} ${user.lastName} - User Details`,
  };
}
