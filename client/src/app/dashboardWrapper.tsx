"use client";

import React, { useEffect } from "react";
import Navbar from "@/app/(components)/Navbar";
import Sidebar from "@/app/(components)/Sidebar";
import StoreProvider, { useAppSelector } from "./redux";
import { usePathname } from "next/navigation";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const isSidebarCollapsed = useAppSelector((state) => state.global.isSidebarCollapsed);
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const pathname = usePathname();

  const isAuthPage =
    pathname === "/sign-in" ||
    pathname === "/sign-up" ||
    pathname.startsWith("/sign-in/") ||
    pathname.startsWith("/sign-up/");

  useEffect(() => {
    const theme = isDarkMode ? "dark" : "light";
    document.documentElement.classList.add(theme);
    document.documentElement.classList.remove(isDarkMode ? "light" : "dark");
  }, [isDarkMode]);

  // PERBAIKAN: Gunakan satu return utama untuk menjaga urutan Hook
  return (
    <div className={`${isDarkMode ? "dark" : "light"} flex bg-gray-50 text-gray-900 w-full min-h-screen`}>
      {!isAuthPage && <Sidebar />}

      <main
        className={`flex flex-col w-full bg-gray-50 transition-all duration-300 ${
          isAuthPage ? "" : isSidebarCollapsed ? "md:pl-16" : "md:pl-64"
        }`}
      >
        {!isAuthPage && <Navbar />}
        
        <div className={`flex-grow ${isAuthPage ? "" : "px-4 pb-8 pt-6 md:px-8 md:pt-8"}`}>
          <div className={isAuthPage ? "w-full" : "mx-auto max-w-[1600px] space-y-6"}>
            {children}
          </div>
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