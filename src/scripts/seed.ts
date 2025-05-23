import { db } from '@/db';
import { users } from '@/db/schema';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

async function seed() {
  console.log('🌱 Starting database seed...');

  // Sample users to seed
  const seedUsers = [
    {
      firstName: 'Joseph',
      lastName: 'Masongsong',
      email: 'jmasongson@bchousing.org',
      password: 'password',
      role: 'admin',
    },
    {
      firstName: 'Nolan',
      lastName: 'Murray',
      email: 'nmurray@bchousing.org',
      password: 'password',
      role: 'user',
    },
  ];

  for (const userData of seedUsers) {
    try {
      // Check if user already exists
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, userData.email))
        .limit(1);

      if (existingUser) {
        console.log(`👤 User ${userData.email} already exists, skipping...`);
        continue;
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Insert the user
      await db.insert(users).values({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        hashedPassword,
        role: userData.role,
      });

      console.log(`✅ Created user: ${userData.email} (${userData.role})`);
    } catch (error) {
      console.error(`❌ Error creating user ${userData.email}:`, error);
    }
  }

  console.log('🎉 Database seeding completed!');
}

// Handle command line execution
if (require.main === module) {
  seed()
    .then(() => {
      console.log('Seeding finished successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

export { seed };
