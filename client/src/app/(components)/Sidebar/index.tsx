"use client";

import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsSidebarCollapsed } from "@/state";
import {
  Archive,
  CircleDollarSign,
  Clipboard,
  Layout,
  LucideIcon,
  Menu,
  SlidersHorizontal,
  User,
  Cpu, // Ikon baru untuk nuansa AI
  Sparkles, // Ikon tambahan jika ingin menandai fitur khusus
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

interface SidebarLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
  isCollapsed: boolean;
}

const SidebarLink = ({
  href,
  icon: Icon,
  label,
  isCollapsed,
}: SidebarLinkProps) => {
  const pathname = usePathname();
  const isActive =
    pathname === href || (pathname === "/" && href === "/dashboard");

  return (
    <Link href={href}>
      <div
        className={`cursor-pointer flex items-center ${
          isCollapsed ? "justify-center py-4" : "justify-start px-8 py-4"
        }
        hover:text-indigo-600 hover:bg-indigo-50 gap-3 transition-all duration-200 ${
          isActive ? "bg-indigo-600 text-white" : "text-gray-700"
        }`}
      >
        {/* Warna ikon berubah jadi putih jika aktif */}
        <Icon
          className={`w-6 h-6 ${isActive ? "text-white" : "text-gray-500"}`}
        />

        <span
          className={`${isCollapsed ? "hidden" : "block"} font-semibold ${
            isActive ? "text-white" : "text-gray-700"
          }`}
        >
          {label}
        </span>
      </div>
    </Link>
  );
};

const Sidebar = () => {
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );

  const toggleSidebar = () => {
    dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
  };

  const sidebarClassNames = `fixed flex flex-col ${
    isSidebarCollapsed ? "w-0 md:w-16" : "w-72 md:w-64"
  } bg-white transition-all duration-300 overflow-hidden h-full shadow-xl z-40 border-r border-gray-100`;

  return (
    <div className={sidebarClassNames}>
      {/* TOP LOGO & BRANDING */}
      <div
        className={`flex gap-3 justify-between md:justify-normal items-center pt-8 ${
          isSidebarCollapsed ? "px-5" : "px-8"
        }`}
      >
        {/* Mengganti Image S3 dengan Ikon AI yang lebih konsisten */}
        <div className="bg-indigo-600 p-1.5 rounded-lg flex items-center justify-center">
          <Cpu className="text-white w-6 h-6" />
        </div>

        <h1
          className={`${
            isSidebarCollapsed ? "hidden" : "block"
          } font-black text-xl tracking-tight text-gray-800`}
        >
          GUDANG <span className="text-indigo-600">AI</span>
        </h1>

        <button
          className="md:hidden px-3 py-3 bg-gray-100 rounded-full hover:bg-indigo-100 transition-colors"
          onClick={toggleSidebar}
        >
          <Menu className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* LINKS */}
      <div className="flex-grow mt-10">
        <SidebarLink
          href="/dashboard"
          icon={Layout}
          label="Dashboard"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/inventory"
          icon={Archive}
          label="Inventory"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/products"
          icon={Clipboard}
          label="Stock Products"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/users"
          icon={User}
          label="Team Members"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/settings"
          icon={SlidersHorizontal}
          label="System Settings"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/expenses"
          icon={CircleDollarSign}
          label="Finance"
          isCollapsed={isSidebarCollapsed}
        />
      </div>

      {/* FOOTER CUSTOM */}
      <div className={`${isSidebarCollapsed ? "hidden" : "block"} mb-6 px-8`}>
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <p className="text-center text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">
            Developed By
          </p>
          <p className="text-center text-sm font-bold text-indigo-900">
            Rafi Darajat
          </p>
          <p className="text-center text-[9px] text-gray-400 mt-2">
            &copy; 2025 AI Smart Systems
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
