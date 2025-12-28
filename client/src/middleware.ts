import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 1. Tentukan rute mana yang boleh diakses tanpa login
// Tambahkan rute API atau rute publik lainnya di sini
const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  // Jangan masukkan "/" di sini agar halaman utama langsung diproteksi
]);

export default clerkMiddleware(async (auth, request) => {
  // 2. Jika rute yang dikunjungi BUKAN rute publik, maka proteksi
  if (!isPublicRoute(request)) {
    await auth.protect();
    // Perhatikan: di versi baru, 'auth' adalah objek yang sudah tersedia
    // dari parameter clerkMiddleware, dan kita memanggil .protect() darinya.
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
