import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Handle CORS for public API endpoints
  if (path.startsWith('/api/v1/public/')) {
    const origin = request.headers.get('origin');
    let allowedOrigin = 'https://www.vionsys.com'; // fallback default

    if (origin) {
      const isAllowed =
        origin === 'https://vionsys.com' ||
        origin === 'https://www.vionsys.com' ||
        origin.endsWith('.vionsys.com') ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:');

      if (isAllowed) {
        allowedOrigin = origin;
      }
    }

    // Handle Preflight Request
    if (request.method === 'OPTIONS') {
      const preflight = new NextResponse(null, { status: 204 });
      preflight.headers.set('Access-Control-Allow-Origin', allowedOrigin);
      preflight.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
      preflight.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');
      preflight.headers.set('Access-Control-Max-Age', '86400');
      return preflight;
    }

    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');
    return response;
  }

  const token = request.cookies.get('vionsys_cms_token')?.value;
  const isAuthPage = path.startsWith('/login');
  
  const isAdminPage =
    path.startsWith('/dashboard') ||
    path.startsWith('/blogs') ||
    path.startsWith('/case-studies') ||
    path.startsWith('/media') ||
    path.startsWith('/seo-tools') ||
    path.startsWith('/settings');

  if (isAdminPage && !token) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && token) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/blogs/:path*',
    '/case-studies/:path*',
    '/media/:path*',
    '/seo-tools/:path*',
    '/settings/:path*',
    '/login',
    '/api/v1/public/:path*'
  ]
};
