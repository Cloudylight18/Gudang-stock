"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, User, Lock, ArrowRight, Loader2, 
  Eye, EyeOff 
} from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function LoginPage() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/login`, {
        userId,
        password,
      });

      if (response.data.success) {
        Cookies.set("token", response.data.token, { expires: 1 });
        localStorage.setItem("user", JSON.stringify(response.data.user));
        
        if (response.data.aiGreeting) {
          toast.success(response.data.aiGreeting, { duration: 5000 });
        } else {
          toast.success(`Selamat Datang, ${response.data.user.name}!`);
        }
        
        window.location.href = "/dashboard";
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Login Gagal. Cek kembali akun Anda.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative"
      style={{ 
        /** * PASTIKAN: Simpan gambar Anda di /public/bg-login.jpg 
         * Ganti 'bg-login.jpg' sesuai nama file asli Anda.
         */
        backgroundImage: "url('/logo dewa.jpeg')" 
      }}
    >
      {/* Overlay: Membuat background sedikit gelap & blur agar form login menonjol */}
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"></div>

      <div className="relative group w-full max-w-[420px] z-10">
        {/* Efek Cahaya Gradient di Belakang Form */}
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-[3rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
        
        {/* Kotak Login (Glassmorphism Effect) */}
        <div className="relative bg-white/90 backdrop-blur-xl shadow-2xl rounded-[2.5rem] p-8 border border-white/50">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/10 rounded-3xl mb-4 text-emerald-600 shadow-inner">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-3xl font-[1000] text-slate-900 tracking-tighter uppercase italic leading-none">
              Stock <span className="text-emerald-600">Vision</span>
            </h1>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-3">
              Secure Asset Management Login
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest flex items-center gap-1">
                <User size={10} /> Username / ID
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
                className="w-full p-4 bg-white/50 rounded-2xl font-bold border-2 border-slate-100 focus:border-emerald-500 focus:bg-white outline-none transition-all placeholder:text-slate-300 text-slate-900 shadow-sm"
                placeholder="Masukkan ID Staff..."
              />
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest flex items-center gap-1">
                <Lock size={10} /> Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full p-4 bg-white/50 rounded-2xl font-bold border-2 border-slate-100 focus:border-emerald-500 focus:bg-white outline-none transition-all placeholder:text-slate-300 text-slate-900 pr-12 shadow-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 hover:bg-emerald-600 text-white p-5 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl shadow-emerald-900/20"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Masuk Ke Gudang <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200/50 text-center">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
              Sistem Internal Gudang Tekstil v2.0 <br />
              Penyimpanan Data Terenkripsi
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}