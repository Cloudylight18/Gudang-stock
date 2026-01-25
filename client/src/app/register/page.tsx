"use client";

import React, { useState } from "react";
import { UserPlus, User, Mail, Lock, ArrowRight, Loader2, ShieldAlert } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    userId: "",
    name: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/register`,
        formData
      );

      if (response.status === 201) {
        toast.success("Akun Staff Berhasil Dibuat!");
        router.push("/login"); // Setelah daftar, arahkan ke login
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal mendaftar. Username/Email mungkin sudah ada.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px]">
      <div className="relative group w-full max-w-[480px]">
        {/* Glow Effect (Indigo-Emerald Mix) */}
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-indigo-600 rounded-[3rem] blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
        
        <div className="relative bg-white/95 backdrop-blur-sm shadow-2xl rounded-[2.5rem] p-8 md:p-10 border border-white">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-50 rounded-2xl mb-4 text-indigo-600 shadow-inner">
              <UserPlus size={28} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
              Staff <span className="text-indigo-600">Registration</span>
            </h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-3">
              Daftarkan Akses Gudang Baru
            </p>
          </div>

          <form onSubmit={handleSignUp} className="grid grid-cols-1 gap-4">
            {/* Username/ID Field */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest flex items-center gap-1">
                <ShieldAlert size={10} /> Username / Staff ID
              </label>
              <input
                name="userId"
                type="text"
                required
                value={formData.userId}
                onChange={handleChange}
                className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-300"
                placeholder="Misal: STAF-001"
              />
            </div>

            {/* Name Field */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest flex items-center gap-1">
                <User size={10} /> Nama Lengkap
              </label>
              <input
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-300"
                placeholder="Nama Anda..."
              />
            </div>

            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest flex items-center gap-1">
                <Mail size={10} /> Email Resmi
              </label>
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-300"
                placeholder="email@perusahaan.com"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest flex items-center gap-1">
                <Lock size={10} /> Buat Password
              </label>
              <input
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-300"
                placeholder="••••••••"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 hover:bg-indigo-600 text-white p-5 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl mt-4"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Daftarkan Akun <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-8 pt-6 border-t border-slate-50 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Sudah Punya Akses?{" "}
              <Link href="/login" className="text-indigo-600 hover:text-slate-900 transition-colors">
                Login Di Sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}