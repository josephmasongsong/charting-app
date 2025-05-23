import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { NewUser, users } from './schema';
import bcrypt from 'bcrypt';
import * as schema from './schema';
// const db = drizzle(process.env.DATABASE_URL!);

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function main() {
  // const site: NewSite = {
  //   name: 'Steeves Manor',
  //   address: '1985 Wallace Street, Vancouver, BC',
  //   latitude: '49.269469',
  //   longitude: '-123.191412',
  //   numberOfTenants: 150,
  //   userId: '1b549607-e56d-4ca6-86a3-bdb06b45b6e8',
  // };

  const hashedPassword = await bcrypt.hash('password', 10);

  const newUsers: NewUser[] = [
    {
      firstName: 'Joseph',
      lastName: 'Masongsong',
      email: 'jmasongson@bchousing.org',
      isAdmin: true,
      hashedPassword,
      role: 'admin',
    },
    {
      firstName: 'Nolan',
      lastName: 'Murray',
      email: 'nmurray@bchousing.org',
      isAdmin: false,
      hashedPassword,
      role: 'user',
    },
  ];

  await db.insert(users).values(newUsers);
  console.log('New users created!');
}

main();
