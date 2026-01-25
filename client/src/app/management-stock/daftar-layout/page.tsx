"use client";

import { useState, useEffect } from "react";
import Header from "@/app/(components)/Header";
import { 
  PlusCircle, Search, MapPin, Trash2, X, CheckCircle2, 
  Loader2, ChevronRight, LayoutGrid, Box, ArrowUpRight 
} from "lucide-react"; 
import Link from "next/link";
import { 
  useGetLayoutsQuery, 
  useCreateLayoutMutation, 
  useDeleteLayoutMutation,
  useGetProductsQuery 
} from "@/state/api";
import { toast } from "react-hot-toast";

const DaftarLayout = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [newLayout, setNewLayout] = useState({
    type: "POLOSAN" as "POLOSAN" | "PRINTING",
    baris: "A",
    kolom: "01"
  });

  // --- API HOOKS ---
  const { data: layouts, isLoading: isLayoutLoading, isError } = useGetLayoutsQuery();
  const { data: products } = useGetProductsQuery(); 
  const [createLayout, { isLoading: isCreating }] = useCreateLayoutMutation();
  const [deleteLayout] = useDeleteLayoutMutation();

  // --- FUNGSI HANDLE DELETE (PERBAIKAN ERROR) ---
  const handleDelete = async (id: string) => {
    if (confirm(`Hapus Rak ${id} secara permanen?`)) {
      try {
        await deleteLayout(id).unwrap();
        toast.success("Rak berhasil dihapus");
      } catch (err) {
        toast.error("Gagal menghapus rak");
      }
    }
  };

  // --- LOGIKA KALKULASI ---
  const calculateTotalStock = (layoutId: string) => {
    if (!products) return { meters: 0, yards: 0, totalRoll: 0 };
    const rackProducts = products.filter((p) => p.location === layoutId);
    
    return rackProducts.reduce((acc, curr) => {
      const qty = curr.stockQuantity || 0;
      const unit = curr.unit?.toUpperCase() || "METER";
      acc.totalRoll += 1;

      if (unit === "METER" || unit === "MTR" || unit === "M") {
        acc.meters += qty;
        acc.yards += qty * 1.09361;
      } else {
        acc.yards += qty;
        acc.meters += qty * 0.9144;
      }
      return acc;
    }, { meters: 0, yards: 0, totalRoll: 0 });
  };

  const handleCreateLayout = async (e: React.FormEvent) => {
    e.preventDefault();
    const layoutId = `${newLayout.baris}-${newLayout.kolom}`;
    try {
      await createLayout({
        layoutId,
        type: newLayout.type,
        baris: newLayout.baris,
        kolom: newLayout.kolom
      }).unwrap();
      toast.success(`RAK ${layoutId} AKTIF!`);
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Gagal membuat rak.");
    }
  };

  if (isLayoutLoading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin"></div>
        <LayoutGrid className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-500" size={24} />
      </div>
      <p className="mt-6 font-black text-slate-400 uppercase tracking-[0.3em] text-[10px]">Mapping Warehouse...</p>
    </div>
  );

  return (
    <div className="p-8 bg-[#F1F5F9] min-h-screen font-sans">
      {/* TOP SECTION: HEADER DENGAN GAYA STOCK VISION */}
      <div className="flex flex-col lg:flex-row justify-between items-end gap-6 mb-12">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
             <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">
               {layouts?.length || 0} SKU TERDAFTAR DI ASSETS
             </span>
          </div>
          {/* MODIFIKASI TEKS SESUAI GAMBAR (STOCK VISION STYLE) */}
          <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase flex flex-wrap gap-x-3 leading-none">
            <span className="text-slate-900">MASTER</span>
            <span className="text-emerald-500">LAYOUT RAK</span>
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-3 italic opacity-70">
            Pemetaan Visual Koordinat Gudang Utama
          </p>
        </div>

        <div className="flex flex-wrap gap-4 w-full lg:w-auto">
          <div className="bg-white px-8 py-5 rounded-[2rem] shadow-sm border border-slate-200/60 flex items-center gap-4">
             <div className="p-3 bg-slate-900 rounded-2xl text-white"><Box size={20}/></div>
             <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Kapasitas Rak</p>
                <p className="text-xl font-black text-slate-800 italic">85<span className="text-[10px] text-slate-400 ml-1">%</span></p>
             </div>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex-1 lg:flex-none bg-emerald-500 hover:bg-slate-900 text-white px-10 py-5 rounded-[2rem] font-black text-[10px] flex items-center justify-center gap-3 shadow-xl shadow-emerald-200 transition-all uppercase tracking-widest group"
          >
            <PlusCircle size={18} className="group-hover:rotate-90 transition-transform" /> Tambah Lokasi Rak
          </button>
        </div>
      </div>

      {/* SEARCH BAR (PREMIUM LOOK) */}
      <div className="mb-12 relative">
        <div className="absolute left-8 top-1/2 -translate-y-1/2 w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
          <Search size={18} />
        </div>
        <input 
          className="w-full pl-24 pr-10 py-8 bg-white/70 backdrop-blur-sm rounded-[2.5rem] shadow-sm border border-white outline-none font-bold text-sm focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/20 transition-all placeholder:text-slate-300 uppercase"
          placeholder="Cari Berdasarkan Kode Rak atau Tipe Simpan..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* RACK GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        {layouts?.filter(l => l.layoutId.toLowerCase().includes(searchTerm.toLowerCase())).map((layout) => {
          const stats = calculateTotalStock(layout.layoutId);
          const isPrinting = layout.type === 'PRINTING';

          return (
            <div key={layout.layoutId} className="group relative bg-white rounded-[3.5rem] p-2 border border-slate-200/50 hover:border-emerald-500/30 transition-all duration-500 shadow-sm hover:shadow-2xl">
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-start">
                  <div className={`p-4 rounded-2xl transition-colors ${isPrinting ? 'bg-purple-50 text-purple-500' : 'bg-blue-50 text-blue-500'}`}>
                    <MapPin size={24} />
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${isPrinting ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                    {layout.type}
                  </div>
                </div>

                <div>
                  <h3 className="text-5xl font-black text-slate-800 italic tracking-tighter">{layout.layoutId}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Isi: {stats.totalRoll} ROLL</p>
                  </div>
                </div>

                {/* VISUAL STOCK BAR */}
                <div className="space-y-4">
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${isPrinting ? 'bg-purple-500' : 'bg-emerald-500'}`} 
                      style={{ width: `${Math.min((stats.totalRoll / 20) * 100, 100)}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <p className="text-[7px] font-black text-slate-400 uppercase">Meters</p>
                      <p className="text-xs font-black text-slate-700">{stats.meters.toFixed(1)} M</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <p className="text-[7px] font-black text-slate-400 uppercase">Yards</p>
                      <p className="text-xs font-black text-slate-700">{stats.yards.toFixed(1)} Y</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link 
                    href={`/management-stock/daftar-layout/${layout.layoutId}`}
                    className="flex-1 bg-slate-900 text-white py-5 rounded-[1.8rem] text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 group/btn"
                  >
                    Detail Rak <ArrowUpRight size={14} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                  </Link>
                  <button 
                    onClick={() => handleDelete(layout.layoutId)}
                    className="p-5 bg-red-50 text-red-400 rounded-[1.8rem] hover:bg-red-500 hover:text-white transition-all shadow-sm"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL - SAMA SEPERTI SEBELUMNYA */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 p-3 hover:bg-slate-100 rounded-full transition-all">
              <X size={20} className="text-slate-400" />
            </button>

            <div className="relative mb-10 text-center">
              <h2 className="text-3xl font-black text-slate-800 uppercase italic">Aktivasi <span className="text-emerald-500">Rak Baru</span></h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2 italic">Daftarkan koordinat penyimpanan baru</p>
            </div>

            <form onSubmit={handleCreateLayout} className="space-y-6 relative">
              <div className="space-y-2 text-center">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kategori Penyimpanan</label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {['POLOSAN', 'PRINTING'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewLayout({...newLayout, type: type as any})}
                      className={`py-4 rounded-2xl font-black text-[10px] tracking-widest transition-all ${
                        newLayout.type === type 
                        ? 'bg-slate-900 text-white shadow-xl scale-105' 
                        : 'bg-slate-50 text-slate-400 border border-slate-100'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">Baris (Row)</label>
                  <select 
                    className="w-full p-5 bg-slate-50 rounded-2xl text-sm font-black border-2 border-transparent focus:border-emerald-500 outline-none transition-all cursor-pointer"
                    value={newLayout.baris}
                    onChange={(e) => setNewLayout({...newLayout, baris: e.target.value})}
                  >
                    {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">Nomor (Slot)</label>
                  <select 
                    className="w-full p-5 bg-slate-50 rounded-2xl text-sm font-black border-2 border-transparent focus:border-emerald-500 outline-none transition-all cursor-pointer"
                    value={newLayout.kolom}
                    onChange={(e) => setNewLayout({...newLayout, kolom: e.target.value})}
                  >
                    {Array.from({length: 30}, (_, i) => (i + 1).toString().padStart(2, '0')).map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isCreating}
                className="w-full bg-emerald-500 text-white font-black py-6 rounded-[2rem] flex items-center justify-center gap-3 uppercase text-[11px] tracking-[0.3em] shadow-2xl shadow-emerald-200 hover:bg-slate-900 transition-all disabled:opacity-50"
              >
                {isCreating ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                Verifikasi Lokasi Rak
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DaftarLayout;