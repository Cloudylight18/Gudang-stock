"use client";

import { useState } from "react";
import { 
  Package, Edit3, Trash2, Award, PlusCircle, 
  Search, X, Hash, ArrowRight, Tag, Layers, MapPin 
} from "lucide-react";
import { useGetProductsQuery, useDeleteProductMutation } from "@/state/api";
import TambahKain from "./tambah-kain"; 
import { toast } from "react-hot-toast";

const DaftarKain = () => {
  const [inputValue, setInputValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const { data: products, isLoading, isError } = useGetProductsQuery(searchTerm);
  const [deleteProduct] = useDeleteProductMutation();

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

  const handleSearchExecute = () => {
    setSearchTerm(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearchExecute();
  };

  const handleDelete = async (productId: any) => {
    if (confirm("Hapus kain ini secara permanen?")) {
      try {
        await deleteProduct(productId).unwrap();
        toast.success("Data berhasil dihapus");
      } catch (err) {
        toast.error("Gagal menghapus data");
      }
    }
  };

  const getImageUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace(/^\/?(assets|uploads)\//, '');
    return `${baseUrl}/assets/${cleanPath}`;
  };

  // --- STYLE UI HELPERS ---
  const getGradeStyle = (grade: any) => {
    const g = String(grade || "").toUpperCase();
    switch (g) {
      case "L1": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "L2": return "bg-blue-100 text-blue-700 border-blue-200";
      case "L3": return "bg-amber-100 text-amber-700 border-amber-200";
      default: return "bg-slate-100 text-slate-500 border-slate-200";
    }
  };

  const getCategoryStyle = (category: any) => {
    const cat = String(category || "").toUpperCase();
    if (cat === "POLOSAN") return "bg-indigo-50 text-indigo-600 border-indigo-100";
    if (cat === "PRINTING") return "bg-purple-50 text-purple-600 border-purple-100";
    return "bg-slate-50 text-slate-600 border-slate-100";
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-white">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-black text-emerald-600 uppercase tracking-widest text-[10px]">Syncing Assets...</p>
    </div>
  );

  return (
    <div className="mx-auto pb-10 w-full p-4 md:p-8 bg-[#f8fafc] min-h-screen font-sans">
      <div className="flex flex-col gap-8 mb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
              Stock <span className="text-emerald-600">Vision</span>
            </h1>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              {(products as any[])?.length || 0} SKU Terdaftar di Assets
            </p>
          </div>
          
          <button 
            onClick={() => { setSelectedProduct(null); setIsModalOpen(true); }}
            className="bg-slate-900 hover:bg-emerald-600 text-white px-8 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 transition-all shadow-lg"
          >
            <PlusCircle size={18} /> Registrasi kain
          </button>
        </div>

        {/* SEARCH BAR */}
        <div className="relative w-full max-w-4xl mx-auto group">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-[2.5rem] blur opacity-10 group-focus-within:opacity-20 transition duration-500"></div>
          <div className="relative flex items-center bg-white rounded-[2.2rem] border border-slate-200 p-2 shadow-sm transition-all focus-within:ring-4 focus-within:ring-emerald-500/5">
            <div className="pl-6 pr-4"><Search className="text-slate-400" size={22} /></div>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Cari nama, warna, atau SKU..."
              className="flex-1 py-4 text-sm font-bold outline-none bg-transparent text-slate-700"
            />
            <div className="flex items-center gap-2 pr-4 ml-2 border-l border-slate-100 pl-4">
              {inputValue && <button onClick={() => { setInputValue(""); setSearchTerm(""); }} className="p-2 text-slate-300 hover:text-red-500"><X size={20} /></button>}
              <button 
                onClick={handleSearchExecute}
                className={`p-3 rounded-2xl transition-all shadow-md ${inputValue !== searchTerm ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-300'}`}
              >
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE UNIT */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                <th className="px-10 py-6 text-left">Produk (Asset Pic)</th>
                <th className="px-6 py-6 text-left">Layout / Rak</th>
                <th className="px-6 py-6 text-left">Grade</th>
                <th className="px-6 py-6 text-left">Kategori</th>
                <th className="px-6 py-6 text-left">Qty</th>
                <th className="px-10 py-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isError ? (
                 <tr><td colSpan={6} className="py-20 text-center text-red-500 font-black uppercase tracking-widest">Database Error</td></tr>
              ) : (products as any[])?.length === 0 ? (
                <tr><td colSpan={6} className="py-20 text-center text-slate-400 font-bold italic uppercase tracking-widest">Data Kosong</td></tr>
              ) : (products as any[])?.map((product: any) => (
                <tr key={product.productId} className="hover:bg-slate-50/80 transition-all group">
                  <td className="px-10 py-5">
                    <div className="flex items-center gap-5">
                      <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                        {product.imageUrl ? (
                          <img 
                            src={getImageUrl(product.imageUrl)} 
                            className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" 
                            alt={product.name} 
                            onError={(e) => { e.currentTarget.src = "https://placehold.co/100x100?text=No+Asset"; }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300"><Package size={24}/></div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <Hash size={10} className="text-emerald-500" />
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter leading-none">{product.productId}</p>
                        </div>
                        <h3 className="text-[13px] font-black text-slate-800 uppercase italic leading-none">{product.name}</h3>
                        <p className="text-[10px] font-bold text-emerald-600 uppercase italic mt-1">{product.color || "Polos"}</p>
                      </div>
                    </div>
                  </td>

                  {/* KOLOM LAYOUT - DENGAN LOGIKA PENGECEKAN */}
                  <td className="px-6 py-5">
                    {product.location ? (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-xl w-fit shadow-lg shadow-slate-900/10">
                           <MapPin size={12} className="text-emerald-400" />
                           <span className="text-[11px] font-black uppercase tracking-tight">{product.location}</span>
                        </div>
                        {product.kombinasi && (
                          <div className="flex items-center gap-1.5 text-amber-600 ml-1">
                             <Layers size={10} />
                             <span className="text-[9px] font-black uppercase italic">Kombinasi {product.kombinasi}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-500 px-3 py-1.5 rounded-xl w-fit italic">
                         <X size={12} />
                         <span className="text-[9px] font-black uppercase tracking-widest">Belum Masuk Layout</span>
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-5">
                    <div className={`flex items-center gap-2 border px-3 py-1.5 rounded-xl w-fit ${getGradeStyle(product.quality)}`}>
                        <Award size={12} /><span className="text-[10px] font-black uppercase italic">{product.quality || "N/A"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className={`flex items-center gap-2 border px-3 py-1.5 rounded-xl w-fit ${getCategoryStyle(product.category)}`}>
                        <Tag size={12} /><span className="text-[10px] font-black uppercase italic">{product.category || "Umum"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-xl font-black italic text-slate-800 tracking-tighter">{product.stockQuantity}</span>
                      <span className="text-[9px] font-black text-slate-400 uppercase -mt-1 tracking-widest">{product.unit || "Yd"}</span>
                    </div>
                  </td>
                  <td className="px-10 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => { setSelectedProduct(product); setIsModalOpen(true); }} className="p-3 bg-white shadow-md text-slate-400 hover:text-emerald-600 rounded-xl border border-slate-100 transition-all"><Edit3 size={18} /></button>
                      <button onClick={() => handleDelete(product.productId)} className="p-3 bg-white shadow-md text-slate-400 hover:text-red-600 rounded-xl border border-slate-100 transition-all"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <TambahKain isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setSelectedProduct(null); }} initialData={selectedProduct} />
    </div>
  );
};

export default DaftarKain;