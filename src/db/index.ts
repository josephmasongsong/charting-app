import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { schema } from './schema';

// Create a PostgreSQL pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create a Drizzle client with the pool and schema
export const db = drizzle(pool, { schema });

export * from './schema';
