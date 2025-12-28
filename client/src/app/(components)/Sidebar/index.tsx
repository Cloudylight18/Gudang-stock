"use client";

import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsSidebarCollapsed } from "@/state";
import {
  Archive,
  Layout,
  LucideIcon,
  Menu,
  SlidersHorizontal,
  Cpu,
  Boxes,
  FileBarChart,
  Settings,
  Image as ImageIcon,
  Mic,
  ArrowLeftRight
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
          isActive ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "text-gray-700"
        }`}
      >
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
        <div className="bg-indigo-600 p-1.5 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200">
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

      {/* LINKS MENU */}
      <div className="flex-grow mt-10">
        <SidebarLink
          href="/dashboard"
          icon={Layout}
          label="Dashboard Admin"
          isCollapsed={isSidebarCollapsed}
        />
        
        <SidebarLink
          href="/detail-barang"
          icon={Archive}
          label="Detail Barang"
          isCollapsed={isSidebarCollapsed}
        />

        <SidebarLink
          href="/daftar-barang"
          icon={Boxes}
          label="Daftar Barang"
          isCollapsed={isSidebarCollapsed}
        />

        <SidebarLink
          href="/fitur-ai"
          icon={Cpu}
          label="Fitur AI (Cari Kain)"
          isCollapsed={isSidebarCollapsed}
        />

        <SidebarLink
          href="/laporan-stok"
          icon={ArrowLeftRight}
          label="Laporan Gudang"
          isCollapsed={isSidebarCollapsed}
        />

        <SidebarLink
          href="/pengaturan"
          icon={Settings}
          label="Pengaturan"
          isCollapsed={isSidebarCollapsed}
        />
      </div>

      {/* FOOTER CUSTOM */}
      <div className={`${isSidebarCollapsed ? "hidden" : "block"} mb-6 px-8`}>
        <div className="bg-gradient-to-br from-indigo-50 to-white rounded-xl p-4 border border-indigo-100 shadow-sm">
          <p className="text-center text-[10px] uppercase tracking-widest font-bold text-indigo-400 mb-1">
            Sistem Cerdas
          </p>
          <p className="text-center text-sm font-bold text-indigo-900">
            Smart Textile AI
          </p>
          <p className="text-center text-[9px] text-gray-400 mt-2">
            &copy; 2025 Rafi Darajat
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;