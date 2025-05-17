import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { NewSite, sites } from './schema';

const db = drizzle(process.env.DATABASE_URL!);

async function main() {
  const site: NewSite = {
    name: 'Steeves Manor',
    address: '1985 Wallace Street, Vancouver, BC',
    latitude: '49.269469',
    longitude: '-123.191412',
    numberOfTenants: 150,
    userId: '1b549607-e56d-4ca6-86a3-bdb06b45b6e8',
  };

  await db.insert(sites).values(site);
  console.log('New site created!');
}

main();
