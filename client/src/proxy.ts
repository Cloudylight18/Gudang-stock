import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 1. Tentukan rute yang bersifat Publik
const publicRoutes = ["/login", "/register"];

// PERBAIKAN: Nama fungsi diubah menjadi 'proxy' agar sesuai dengan konvensi baru Next.js
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 2. Ambil token dari Cookies
  const token = request.cookies.get("token")?.value;

  // 3. LOGIKA PROTEKSI
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // Jika user BELUM login dan mencoba akses rute terproteksi
  if (!token && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    // Tambahkan parameter callback untuk redirect setelah login
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. LOGIKA REDIRECT (Jika sudah login, jangan ke halaman login/register lagi)
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// 5. MATCHER (Konfigurasi rute)
export const config = {
  matcher: [
    /*
     * Jalankan untuk semua rute kecuali file statis dan API internal
     */
    '/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js).*)',
  ],
};