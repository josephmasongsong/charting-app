import { db, users } from "@/db";

export default async function Home() {

  const [user] = await db.select().from(users)

  return (
    <div>
      {user.firstName} {user.lastName}
    </div>
  );
}
