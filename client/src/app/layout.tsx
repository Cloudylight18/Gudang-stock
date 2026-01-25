import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import DashboardWrapper from "./dashboardWrapper";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Stock Vision | Smart Inventory System",
  description: "Sistem Manajemen Inventaris Kain berbasis AI dikembangkan oleh Rafi Darajat.",
  keywords: ["Inventory Management", "AI Vision", "Voice Search", "Gudang Kain", "Smart Warehouse"],
  authors: [{ name: "Rafi Darajat" }],
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
    <html lang="id">
      <body className={`${inter.className} bg-gray-50 text-gray-900 antialiased`}>
        {/* Toaster disetel ke tema Emerald agar selaras dengan UI Stock Vision */}
        <Toaster 
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            success: {
              style: {
                background: '#10b981', // Emerald 500
                color: '#fff',
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                padding: '16px',
                border: '2px solid rgba(255,255,255,0.2)',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#10b981',
              },
            },
            error: {
              style: {
                background: '#ef4444',
                color: '#fff',
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: '900',
                textTransform: 'uppercase',
              },
            },
          }}
        />
        
        {/* DashboardWrapper sekarang mengontrol flow aplikasi tanpa gangguan Clerk */}
        <DashboardWrapper>{children}</DashboardWrapper>
      </body>
    </html>
  );
}