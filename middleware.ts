import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Check if user is inactive and force logout
    if (token && !token.isActive) {
      // Redirect to login with a message about deactivated account
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('error', 'account_deactivated');
      return NextResponse.redirect(loginUrl);
    }

    // Redirect authenticated users away from auth pages
    if (
      token &&
      (pathname === '/login' ||
        pathname === '/register' ||
        pathname === '/forgot-password')
    ) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Allow the request to continue
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Public routes that don't require authentication
        const publicRoutes = [
          '/login',
          '/forgot-password',
          '/reset-password',
          '/api/auth', // NextAuth API routes
          '/api/reset-password', // Password reset API
        ];

        // Check if the current path is a public route
        const isPublicRoute = publicRoutes.some(route =>
          pathname.startsWith(route)
        );

        // Allow access to public routes without token
        if (isPublicRoute) {
          return true;
        }

        // For all other routes, require authentication AND active account
        return !!token && token.isActive !== false;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
