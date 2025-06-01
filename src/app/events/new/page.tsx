import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import EventForm from '@/components/EventForm';

export default async function NewEventPage() {
  const session = await getServerSession(authOptions);

  // Redirect unauthenticated users to login
  if (!session) {
    redirect('/login');
  }

  return <EventForm mode="create" />;
}

export async function generateMetadata() {
  return {
    title: 'Create New Event',
    description: 'Create a new event in the system',
  };
}
