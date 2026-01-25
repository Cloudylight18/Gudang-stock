"use client";

import React, { useEffect } from "react";
import Navbar from "@/app/(components)/Navbar";
import Sidebar from "@/app/(components)/Sidebar";
import StoreProvider, { useAppSelector } from "./redux";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const pathname = usePathname();
  const router = useRouter();

  // 1. Definisikan rute publik secara eksplisit
  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/";

  // 2. AUTO-PROTECTION Logic
  useEffect(() => {
    const token = Cookies.get("token");
    
    if (!token) {
      // Jika tidak ada token dan user mencoba masuk ke area terproteksi
      if (!isAuthPage) {
        router.push("/login");
      }
    } else {
      // Jika sudah login tapi masih di halaman login/register
      if (isAuthPage) {
        router.push("/dashboard");
      }
    }
  }, [isAuthPage, pathname, router]);

  // Management Tema (Dark/Light Mode)
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // 3. RENDER HALAMAN AUTH (Tanpa Sidebar/Navbar)
  if (isAuthPage) {
    return (
      <div className={`min-h-screen w-full bg-gray-50 text-gray-900 ${isDarkMode ? "dark" : ""}`}>
        <main className="w-full h-full">
          {children}
        </main>
      </div>
    );
  }

  // 4. RENDER HALAMAN DASHBOARD (Layout Lengkap)
  return (
    <div className={`flex bg-gray-200 text-gray-900 w-full min-h-screen ${isDarkMode ? "dark" : ""}`}>
      <Sidebar />
      <main
        className={`flex flex-col w-full h-full py-7 px-9 bg-gray-50 dark:bg-slate-900 transition-all duration-300 ${
          isSidebarCollapsed ? "md:pl-24" : "md:pl-72"
        }`}
      >
        <Navbar />
        <div className="mt-4">
          {children}
        </div>
      </main>
    </div>
  );
};

const DashboardWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <StoreProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </StoreProvider>
  );
};

export default DashboardWrapper;