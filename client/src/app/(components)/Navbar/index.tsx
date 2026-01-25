"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsDarkMode, setIsSidebarCollapsed } from "@/state";
import { 
  Menu, Moon, Sun, LogOut, User as UserIcon, 
  Settings, Camera, X, Check, ChevronDown, Loader2 
} from "lucide-react"; 
import Cookies from "js-cookie";
import axios from "axios";
import { toast } from "react-hot-toast";

const Navbar = () => {
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const isSidebarCollapsed = useAppSelector((state) => state.global.isSidebarCollapsed);
  
  const [userData, setUserData] = useState<{ name: string; userId: string; image?: string } | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

  // --- HELPER UNTUK MENDAPATKAN URL GAMBAR PROFIL ---
  const getProfileImageUrl = (imagePath?: string) => {
    if (!imagePath) return null;
    // Jika path sudah berupa URL lengkap, gunakan langsung
    if (imagePath.startsWith("http")) return imagePath;
    // Arahkan ke sub-folder uploads/profil di server
    return `${baseUrl}/uploads/profiles/${imagePath}`;
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUserData(parsed);
      setNewName(parsed.name);
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    Cookies.remove("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const handleUpdateProfile = async () => {
    if (!userData || !newName) return;
    
    setIsUploading(true);
    try {
      const response = await axios.patch(
        `${baseUrl}/users/${userData.userId}`,
        { name: newName }
      );

      if (response.data.success) {
        const updated = { ...userData, name: response.data.user.name };
        setUserData(updated);
        localStorage.setItem("user", JSON.stringify(updated));
        toast.success("Profil diperbarui");
        setIsModalOpen(false);
      }
    } catch (error) {
      toast.error("Gagal memperbarui profil");
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userData) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran file terlalu besar (Max 2MB)");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    setIsUploading(true);
    try {
      const response = await axios.patch(
        `${baseUrl}/users/${userData.userId}`, 
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.data.success) {
        // Ambil nama file dari response server
        const updatedImage = response.data.user.image;
        
        const updated = { ...userData, image: updatedImage };
        setUserData(updated);
        localStorage.setItem("user", JSON.stringify(updated));
        
        toast.success("Foto profil berhasil diperbarui!");
      }
    } catch (error: any) {
      console.error("Upload Error:", error);
      toast.error(error.response?.data?.message || "Gagal upload gambar");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <nav className="flex justify-between items-center w-full py-3 px-4 md:px-8 bg-white dark:bg-slate-900 shadow-sm border-b border-gray-100 dark:border-slate-800 sticky top-0 z-50 transition-all">
      <div className="flex items-center gap-4">
        <button
          className="p-2 bg-gray-100 dark:bg-slate-800 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
          onClick={() => dispatch(setIsSidebarCollapsed(!isSidebarCollapsed))}
        >
          <Menu className="w-5 h-5 text-emerald-600" />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={() => dispatch(setIsDarkMode(!isDarkMode))} 
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
        >
          {isDarkMode ? <Sun className="text-orange-500" size={20} /> : <Moon className="text-gray-500" size={20} />}
        </button>

        <hr className="w-px h-6 bg-gray-200 dark:bg-slate-700 mx-2" />

        {userData && (
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 p-1 pr-2 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-2xl transition-all border border-transparent hover:border-gray-200 dark:hover:border-slate-700"
            >
              <div className="relative w-9 h-9 bg-emerald-600 rounded-full overflow-hidden flex items-center justify-center text-white border-2 border-white dark:border-slate-800 shadow-sm">
                {userData.image ? (
                  <img 
                    src={getProfileImageUrl(userData.image)!} 
                    alt="profile" 
                    className="w-full h-full object-cover" 
                    onError={(e) => { e.currentTarget.src = "https://placehold.co/100x100?text=User"; }}
                  />
                ) : (
                  <UserIcon size={18} />
                )}
              </div>
              <div className="flex flex-col text-left hidden sm:flex">
                <span className="font-bold text-xs text-gray-800 dark:text-gray-200 leading-none truncate max-w-[100px]">
                  {userData.name}
                </span>
                <span className="text-[9px] text-emerald-600 font-black uppercase tracking-tighter">Master Admin</span>
              </div>
              <ChevronDown size={14} className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-60 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 py-2 z-[60] overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-50 dark:border-slate-700 mb-1 bg-slate-50/50 dark:bg-slate-900/50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID Pegawai</p>
                  <p className="text-xs font-bold text-emerald-600 truncate">{userData.userId}</p>
                </div>
                
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 transition-all"
                >
                  <Settings size={16} /> Pengaturan Profil
                </button>
                
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all font-bold border-t border-gray-50 dark:border-slate-700"
                >
                  <LogOut size={16} /> Keluar Sistem
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase italic leading-none">
                  Edit <span className="text-emerald-600">Profil</span>
                </h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Update Informasi Akun</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-8">
              <div className="flex flex-col items-center">
                <div className="relative group cursor-pointer">
                  <div className="w-28 h-28 bg-emerald-100 dark:bg-slate-700 rounded-full overflow-hidden border-4 border-emerald-500 shadow-xl flex items-center justify-center">
                    {isUploading ? (
                      <Loader2 className="animate-spin text-emerald-600" size={32} />
                    ) : userData?.image ? (
                      <img 
                        src={getProfileImageUrl(userData.image)!} 
                        alt="preview" 
                        className="w-full h-full object-cover" 
                        onError={(e) => { e.currentTarget.src = "https://placehold.co/200x200?text=Error"; }}
                      />
                    ) : (
                      <UserIcon size={48} className="text-emerald-600" />
                    )}
                  </div>
                  <label className="absolute bottom-1 right-1 bg-slate-900 text-white p-2.5 rounded-full cursor-pointer hover:bg-emerald-600 transition-all shadow-lg hover:scale-110 active:scale-90">
                    <Camera size={18} />
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                  <UserIcon size={12} /> Nama Lengkap
                </label>
                <input 
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Masukkan nama baru..."
                  className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-transparent focus:border-emerald-500 outline-none font-bold text-slate-800 dark:text-white transition-all shadow-inner"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 p-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Batal
                </button>
                <button 
                  onClick={handleUpdateProfile}
                  disabled={isUploading}
                  className="flex-[2] bg-slate-900 hover:bg-emerald-600 text-white p-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-50"
                >
                  {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />} Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;