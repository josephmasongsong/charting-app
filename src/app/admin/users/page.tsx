import { getUsersData } from '@/lib/data/users';
import AdminUsersPage from './AdminUsersPage';

export default async function AdminUsersPageWrapper() {
  const { currentUser } = await getUsersData();

  return <AdminUsersPage currentUser={currentUser} />;
}
