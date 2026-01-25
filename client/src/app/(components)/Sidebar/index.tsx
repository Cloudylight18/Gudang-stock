"use client";

import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsSidebarCollapsed } from "@/state";
import {
  Archive,
  Layout,
  LucideIcon,
  Menu,
  SlidersHorizontal,
  Box,
  Sparkles,
  Map,
  Layers,
  ChevronDown,
  CircleDot,
  Truck,
  ArrowDownCircle,
  ArrowUpCircle,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState, useEffect } from "react";

interface SidebarLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
  isCollapsed: boolean;
  isSubLink?: boolean;
}

const SidebarLink = ({ href, icon: Icon, label, isCollapsed, isSubLink = false }: SidebarLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href || (pathname === "/" && href === "/dashboard") || (href !== "/" && pathname.startsWith(href));

  return (
    <Link href={href}>
      <div
        className={`cursor-pointer flex items-center transition-all duration-200 gap-3 mx-2 rounded-xl mb-1 ${
          isCollapsed ? "justify-center py-4" : `${isSubLink ? "pl-12 pr-4" : "px-6"} py-3.5`
        } ${
          isActive 
            ? "bg-indigo-600 text-white shadow-[0_10px_20px_-10px_rgba(79,70,229,0.5)]" 
            : "text-gray-500 hover:text-indigo-600 hover:bg-indigo-50/50"
        }`}
      >
        <Icon className={`w-5 h-5 transition-colors ${isActive ? "text-white" : "text-gray-400 group-hover:text-indigo-600"}`} />
        {!isCollapsed && (
          <span className={`${isSubLink ? "text-[12px]" : "text-sm"} font-bold tracking-tight`}>
            {label}
          </span>
        )}
      </div>
    </Link>
  );
};

const Sidebar = () => {
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector((state) => state.global.isSidebarCollapsed);
  const pathname = usePathname();

  // State untuk Dropdown
  const [isStockOpen, setIsStockOpen] = useState(false);
  const [isLaporanOpen, setIsLaporanOpen] = useState(false);

  // Otomatis buka dropdown jika sedang berada di dalam route tersebut
  useEffect(() => {
    if (pathname.includes("/management-stock")) setIsStockOpen(true);
    if (pathname.includes("/laporan-gudang")) setIsLaporanOpen(true);
  }, [pathname]);

  const toggleSidebar = () => {
    dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
  };

  const sidebarClassNames = `fixed flex flex-col ${
    isSidebarCollapsed ? "w-0 md:w-20" : "w-72 md:w-64"
  } bg-white transition-all duration-300 overflow-hidden h-full shadow-[20px_0_40px_rgba(0,0,0,0.02)] z-40 border-r border-gray-100`;

  return (
    <div className={sidebarClassNames}>
      {/* 1. TOP LOGO AREA */}
      <div className={`flex gap-3 justify-between items-center py-8 flex-shrink-0 ${isSidebarCollapsed ? "px-5" : "px-8"}`}>
  {/* Bingkai Persegi untuk Logo */}
  <div className="w-12 h-12 border-2 border-gray-200 rounded-lg flex items-center justify-center overflow-hidden bg-white shadow-sm flex-shrink-0">
    <img 
      src="/logo dewa.jpeg" 
      alt="logo dewasutratex" 
      className="w-full h-full object-cover" // Mengisi seluruh area bingkai persegi
    />
  </div>

  {!isSidebarCollapsed && (
    <div className="flex flex-col leading-none flex-grow ml-3">
      <span className="font-[1000] text-xl text-gray-800 tracking-tighter uppercase italic">
        GUDANG
      </span>
      <span className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em]">
        Stock Kain
      </span>
    </div>
  )}

  <button className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors" onClick={toggleSidebar}>
    <Menu className="w-5 h-5 text-gray-600" />
  </button>
</div>

      {/* 2. NAVIGASI LINKS */}
      <nav className="flex-grow overflow-y-auto overflow-x-hidden px-2 custom-scrollbar space-y-1 scroll-smooth">
        <SidebarLink href="/dashboard" icon={Layout} label="Dashboard Admin" isCollapsed={isSidebarCollapsed} />
        
        {/* DROPDOWN: MANAJEMEN STOK */}
        <div className="mb-1">
          <button
            onClick={() => !isSidebarCollapsed && setIsStockOpen(!isStockOpen)}
            className={`w-full group cursor-pointer flex items-center transition-all duration-200 gap-3 mx-2 rounded-xl ${
              isSidebarCollapsed ? "justify-center py-4" : "px-6 py-3.5"
            } ${pathname.includes("/management-stock") ? "text-indigo-600 bg-indigo-50/30" : "text-gray-500 hover:bg-indigo-50/50"}`}
          >
            <Archive className={`w-5 h-5 ${pathname.includes("/management-stock") ? "text-indigo-600" : "text-gray-400"}`} />
            {!isSidebarCollapsed && (
              <>
                <span className="font-bold text-sm tracking-tight flex-grow text-left">Manajemen Stok</span>
                <div className={`transition-transform duration-300 ${isStockOpen ? "rotate-180" : ""}`}>
                   <ChevronDown size={16} />
                </div>
              </>
            )}
          </button>
          
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isStockOpen && !isSidebarCollapsed ? "max-h-40 opacity-100 mt-1" : "max-h-0 opacity-0"}`}>
            <SidebarLink href="/management-stock/daftar-kain" icon={CircleDot} label="Daftar Kain" isCollapsed={isSidebarCollapsed} isSubLink />
            <SidebarLink href="/management-stock/daftar-layout" icon={Map} label="Denah Layout" isCollapsed={isSidebarCollapsed} isSubLink />
          </div>
        </div>

        <SidebarLink href="/Katalog-Visual" icon={Layers} label="Katalog Visual" isCollapsed={isSidebarCollapsed} />
        <SidebarLink href="/Pencarian-Pintar" icon={Sparkles} label="Pencarian Pintar" isCollapsed={isSidebarCollapsed} />

        <SidebarLink href="/pengiriman" icon={Truck} label="Pengiriman" isCollapsed={isSidebarCollapsed} />

        {/* DROPDOWN: LAPORAN GUDANG (BARU) */}
        <div className="mb-1">
          <button
            onClick={() => !isSidebarCollapsed && setIsLaporanOpen(!isLaporanOpen)}
            className={`w-full group cursor-pointer flex items-center transition-all duration-200 gap-3 mx-2 rounded-xl ${
              isSidebarCollapsed ? "justify-center py-4" : "px-6 py-3.5"
            } ${pathname.includes("/laporan-gudang") ? "text-indigo-600 bg-indigo-50/30" : "text-gray-500 hover:bg-indigo-50/50"}`}
          >
            <SlidersHorizontal className={`w-5 h-5 ${pathname.includes("/laporan-gudang") ? "text-indigo-600" : "text-gray-400"}`} />
            {!isSidebarCollapsed && (
              <>
                <span className="font-bold text-sm tracking-tight flex-grow text-left">Laporan Berkala</span>
                <div className={`transition-transform duration-300 ${isLaporanOpen ? "rotate-180" : ""}`}>
                   <ChevronDown size={16} />
                </div>
              </>
            )}
          </button>
          
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isLaporanOpen && !isSidebarCollapsed ? "max-h-40 opacity-100 mt-1" : "max-h-0 opacity-0"}`}>
            <SidebarLink href="/Laporan-Gudang/Barang-Masuk" icon={ArrowDownCircle} label="Barang Masuk" isCollapsed={isSidebarCollapsed} isSubLink />
            <SidebarLink href="/Laporan-Gudang/Barang-Keluar" icon={ArrowUpCircle} label="Barang Keluar" isCollapsed={isSidebarCollapsed} isSubLink />
          </div>
        </div>
      </nav>

      {/* 3. DEVELOPER BRANDING */}
      {!isSidebarCollapsed && (
        <div className="mx-6 mb-8 mt-auto">
          <div className="relative group cursor-default">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative px-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col items-center">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                <p className="text-[7px] uppercase tracking-[0.3em] font-black text-slate-400">Engineered By</p>
              </div>
              <p className="text-[11px] font-[1000] bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent uppercase tracking-widest italic drop-shadow-sm">
                Rafi Darajat
              </p>
              <div className="w-8 h-[2px] bg-indigo-100 mt-2 rounded-full overflow-hidden">
                <div className="w-full h-full bg-indigo-500 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;