// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Ambil token/status login dari cookies (lebih aman daripada localStorage untuk middleware)
  const isLoggedIn = request.cookies.get('isLoggedIn');
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                     request.nextUrl.pathname.startsWith('/register');

  // 1. Jika buka root "/" langsung lempar ke login
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Jika belum login dan mencoba akses dashboard, lempar ke login
  if (!isLoggedIn && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 3. Jika sudah login tapi mencoba ke halaman login, lempar ke dashboard
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Tentukan halaman mana saja yang diproteksi middleware
export const config = {
  matcher: ['/', '/dashboard/:path*', '/inventory/:path*', '/products/:path*', '/login', '/register'],
};