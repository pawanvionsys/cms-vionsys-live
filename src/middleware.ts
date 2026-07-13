import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('vionsys_cms_token')?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith('/login');
  
  const isAdminPage =
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/blogs') ||
    request.nextUrl.pathname.startsWith('/case-studies') ||
    request.nextUrl.pathname.startsWith('/media') ||
    request.nextUrl.pathname.startsWith('/seo-tools') ||
    request.nextUrl.pathname.startsWith('/settings');

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
    '/login'
  ]
};
