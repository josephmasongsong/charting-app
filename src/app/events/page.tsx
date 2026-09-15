// app/events/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import EventsClient from './components/EventsClient';

export default async function EventsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return <EventsClient />;
}

export async function generateMetadata() {
  return {
    title: 'Events - Browse All Community Activities',
    description:
      'Browse all available community events and activities in our directory',
  };
}
