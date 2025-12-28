"use client";

import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsDarkMode, setIsSidebarCollapsed } from "@/state";
import { Bell, Menu, Moon, Settings, Sun, LogIn, Search } from "lucide-react";
import Link from "next/link";
import { UserButton, SignInButton, useUser } from "@clerk/nextjs";
import React from "react";

const Navbar = () => {
  const dispatch = useAppDispatch();
  const { isLoaded, isSignedIn, user } = useUser();

  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  const toggleSidebar = () => {
    dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
  };

  const toggleDarkMode = () => {
    dispatch(setIsDarkMode(!isDarkMode));
  };

  return (
    /* REVISI: 
      - Menambahkan 'py-4' agar ada jarak atas dan bawah di dalam navbar.
      - Menambahkan 'px-4 md:px-8' agar sejajar dengan container konten di bawahnya.
      - Menambahkan 'bg-white/70 backdrop-blur-md' (opsional) untuk kesan modern.
    */
    <div className="flex justify-between items-center w-full py-4 px-4 md:px-8 bg-white/50 backdrop-blur-sm sticky top-0 z-40 transition-all">
      {/* LEFT SIDE */}
      <div className="flex items-center gap-5">
        <button
          className="p-2 bg-gray-100 rounded-full hover:bg-blue-100 transition-colors"
          onClick={toggleSidebar}
        >
          <Menu className="w-5 h-5 text-gray-700" />
        </button>

        <div className="relative hidden sm:block">
          <input
            type="search"
            placeholder="Search products..."
            className="pl-10 pr-4 py-2 w-48 md:w-64 border-2 border-gray-200 bg-white rounded-xl focus:outline-none focus:border-indigo-500 transition-all text-sm"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="text-gray-400" size={18} />
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-3 md:gap-6">
        <div className="flex items-center gap-3 md:gap-5">
          <button
            onClick={toggleDarkMode}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            {isDarkMode ? (
              <Sun className="text-amber-500" size={22} />
            ) : (
              <Moon className="text-gray-600" size={22} />
            )}
          </button>

          <div className="relative p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
            <Bell className="text-gray-600" size={22} />
            <span className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-red-500 rounded-full">
              3
            </span>
          </div>
        </div>

        <hr className="hidden md:block w-0 h-8 border-l border-gray-200 mx-2" />

        {/* AUTH SECTION */}
        <div className="flex items-center gap-3">
          {isLoaded && isSignedIn ? (
            <div className="flex items-center gap-3 pl-2">
              <div className="hidden lg:block text-right">
                <p className="text-sm font-bold text-gray-800 leading-none">
                  {user?.fullName || user?.username}
                </p>
                <p className="text-[11px] text-gray-500 mt-1 uppercase tracking-wider">
                  Admin
                </p>
              </div>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-9 h-9 border border-gray-200",
                  },
                }}
              />
            </div>
          ) : (
            <SignInButton mode="modal">
              <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-all shadow-sm">
                <LogIn size={18} />
                <span className="font-semibold text-sm">Login</span>
              </button>
            </SignInButton>
          )}
        </div>

        <Link
          href="/settings"
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <Settings className="text-gray-600" size={22} />
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
