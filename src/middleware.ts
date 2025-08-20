import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

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

// Check if token is valid and not expired
function isTokenValid(token: string): boolean {
  try {
    const decoded = jwtDecode(token);
    if (decoded && typeof decoded === 'object' && 'exp' in decoded) {
      const exp = decoded.exp as number;
      return Date.now() < exp * 1000;
    }
    return false;
  } catch {
    return false;
  }
}

// Check if user has required role
function hasRequiredRole(token: string, requiredRole: string): boolean {
  try {
    const decoded = jwtDecode(token);
    if (decoded && typeof decoded === 'object' && 'role' in decoded) {
      const userRole = decoded.role as string;
      return userRole === requiredRole || userRole === 'admin';
    }
    return false;
  } catch {
    return false;
  }
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
  const token = request.cookies.get('auth_token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');

  // Handle public routes
  if (isPublicRoute(pathname)) {
    // If user is authenticated and trying to access auth pages, redirect to dashboard
    if (token && isTokenValid(token) && 
        (pathname.startsWith('/auth') || pathname.startsWith('/login') || pathname.startsWith('/register'))) {
      return NextResponse.redirect(new URL('/trade', request.url));
    }
    return NextResponse.next();
  }

  // Handle protected routes
  if (isProtectedRoute(pathname)) {
    if (!token || !isTokenValid(token)) {
      // Redirect to login if not authenticated
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // Check if user has required permissions for specific routes
    if (pathname.startsWith('/kyc') && !hasRequiredRole(token, 'member')) {
      return NextResponse.redirect(new URL('/trade', request.url));
    }
    
    return NextResponse.next();
  }

  // Handle admin routes
  if (isAdminRoute(pathname)) {
    if (!token || !isTokenValid(token)) {
      // Redirect to login if not authenticated
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    if (!hasRequiredRole(token, 'admin')) {
      // Redirect to unauthorized page if not admin
      return NextResponse.redirect(new URL('/unauthorized', request.url));
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
