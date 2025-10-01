// app/events/[id]/edit/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import EventForm from '@/components/EventForm';
import { db, events } from '@/db';
import { eq } from 'drizzle-orm';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ duplicated?: string }>;
}

export default async function EditEventPage({
  params,
  searchParams,
}: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  const { id } = await params;
  const { duplicated } = await searchParams;
  const isDuplicated = duplicated === 'true';

  // Non-admins can only edit if it's a duplicated event on first save
  if (session.user.role !== 'admin' && !isDuplicated) {
    redirect('/events');
  }

  // Fetch the event
  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.id, id))
    .limit(1);

  if (!event) {
    redirect('/events');
  }

  // Non-admins can only edit their own events
  if (session.user.role !== 'admin' && event.userId !== session.user.id) {
    redirect('/events');
  }

  return (
    <EventForm
      mode="edit"
      eventId={id}
      initialData={event}
      isDuplicated={isDuplicated}
      isAdmin={session.user.role === 'admin'}
    />
  );
}
