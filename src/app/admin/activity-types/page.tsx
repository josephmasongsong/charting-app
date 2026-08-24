import { getProgramGoals } from '@/lib/data/program-goals';
import AdminActivityTypesPage from './AdminActivityTypesPage';

export default async function AdminActivityTypesPageWrapper() {
  const programGoals = await getProgramGoals();

  return <AdminActivityTypesPage programGoals={programGoals} />;
}
