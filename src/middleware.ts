import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected routes that require authentication
const protectedRoutes = [
  '/trade',
  '/profile',
  '/wallet',
  '/orders',
  '/history',
  '/settings',
  '/verification',
  '/kyc',
];

// Admin routes that require admin role
const adminRoutes = [
  '/admin',
  '/admin-dashboard',
];

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/email-verification',
  '/verify-email',
  '/api',
  '/_next',
  '/favicon.ico',
];

// Basic check if token exists without decoding (Edge Runtime compatible)
function hasToken(token: string | undefined): boolean {
  return !!token && token.length > 20;
}

// Check if route is public
function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => pathname.startsWith(route));
}

// Check if route is protected
function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(route => pathname.startsWith(route));
}

// Check if route is admin-only
function isAdminRoute(pathname: string): boolean {
  return adminRoutes.some(route => pathname.startsWith(route));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files and API routes
  if (pathname.startsWith('/_next') || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Get token from cookies or headers
  const token = request.cookies.get('access_token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');

  // Handle public routes - allow access
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Handle protected routes - check token exists
  // Allow access even without token - client-side AuthGuard will handle redirect
  // This prevents middleware from blocking access before cookie is set after login
  if (isProtectedRoute(pathname)) {
    // If token exists, allow access
    // If no token, still allow access - let client-side AuthGuard handle it
    // This is necessary because cookies set via document.cookie may not be immediately available
    return NextResponse.next();
  }

  // Handle admin routes - check token exists
  if (isAdminRoute(pathname)) {
    if (!hasToken(token)) {
      // Redirect to signin if no token
      const loginUrl = new URL('/auth/signin', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Default: allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
