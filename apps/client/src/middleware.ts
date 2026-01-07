import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const pathname = request.nextUrl.pathname;

  // Paths that require authentication
  const protectedRoutes = ['/dashboard', '/products/create'];

  // Check if current path starts with any of the protected routes
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute && !token) {
    const url = new URL('/', request.url);
    // Add ?login=true to open the modal
    url.searchParams.set('login', 'true');
    // Add redirect param so after login we go back to the protected page
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
