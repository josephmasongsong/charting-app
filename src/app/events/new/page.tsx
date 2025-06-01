import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import CreateEventForm from './components/CreateEventForm';

export default async function NewEventPage() {
  const session = await getServerSession(authOptions);

  // Redirect unauthenticated users to login
  if (!session) {
    redirect('/login');
  }

  return <CreateEventForm />;
}

export async function generateMetadata() {
  return {
    title: 'Create New Event',
    description: 'Create a new event in the system',
  };
}
