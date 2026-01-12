import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import DashboardWrapper from "./dashboardWrapper";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

/**
 * REVISI METADATA: 
 * Membuat tampilan tab browser lebih profesional dan mendukung branding AI.
 */
export const metadata: Metadata = {
  title: "Stock AI | Smart Inventory System",
  description: "Sistem Manajemen Inventaris Kain berbasis AI dikembangkan oleh Rafi Darajat. Solusi cerdas untuk pelacakan stok menggunakan Vision dan Voice.",
  keywords: ["Inventory Management", "AI Vision", "Voice Search", "Gudang Kain", "Smart Warehouse"],
  authors: [{ name: "Rafi Darajat" }],
  // Menghubungkan ke aset favicon yang baru Anda buat di folder public
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    /**
     * CLERK PROVIDER: 
     * Mengamankan seluruh aplikasi. User harus login untuk masuk ke DashboardWrapper.
     */
    <ClerkProvider
      appearance={{
        layout: {
          logoPlacement: "inside",
          socialButtonsVariant: "iconButton",
        },
        variables: {
          colorPrimary: "#4f46e5", // Menggunakan warna Indigo khas branding kita
        },
      }}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/dashboard"
    >
      <html lang="id">
        <body className={`${inter.className} bg-gray-50 text-gray-900 antialiased`}>
          {/* DashboardWrapper menangani:
            1. Redux Provider (State Management)
            2. Layout (Sidebar, Navbar)
            3. Dark Mode Toggle
          */}
          <DashboardWrapper>{children}</DashboardWrapper>
        </body>
      </html>
    </ClerkProvider>
  );
}