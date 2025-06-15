import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email))
          .limit(1);

        if (!user || !user.hashedPassword) {
          return null;
        }

        // Check if user account is active
        if (!user.isActive) {
          throw new Error(
            'This account has been deactivated. Please contact your administrator.'
          );
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        if (!passwordMatch) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.firstName + ' ' + user.lastName,
          isActive: user.isActive,
          region: user.region,
        };
      },
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isActive = user.isActive;
        token.region = user.region;
        // Fetch user role from database
        const [dbUser] = await db
          .select()
          .from(users)
          .where(eq(users.id, user.id))
          .limit(1);
        token.role = dbUser?.role || 'user';
      } else {
        // Re-check isActive status on each request to handle real-time deactivation
        if (token.id) {
          const [dbUser] = await db
            .select()
            .from(users)
            .where(eq(users.id, token.id as string))
            .limit(1);
          token.isActive = dbUser?.isActive ?? false;
          token.region = dbUser?.region ?? 'LMDM';
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.isActive = token.isActive as boolean;
        session.user.region = token.region as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
