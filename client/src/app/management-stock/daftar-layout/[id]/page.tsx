"use client";

import React, { useState, use } from "react";
import Header from "@/app/(components)/Header";
import { Barcode, Package, Trash2, ArrowLeft, ScanLine, CheckCircle2, Loader2, MapPin } from "lucide-react";
import Link from "next/link";
import Image from "next/image"; // Import komponen Image Next.js
import { useGetProductsQuery, useUpdateProductMutation, useGetLayoutsQuery } from "@/state/api";
import { toast } from "react-hot-toast";

const DetailLayout = ({ params }: { params: Promise<{ id: string }> }) => {
  const resolvedParams = use(params);
  const rackId = resolvedParams.id;
  const [barcodeInput, setBarcodeInput] = useState("");

  const { data: products, isLoading, refetch } = useGetProductsQuery();
  const { data: layouts } = useGetLayoutsQuery();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const currentLayout = layouts?.find(l => l.layoutId === rackId);
  const itemsInRack = products?.filter((p) => p.location === rackId) || [];

  // Tentukan Base URL untuk gambar (Sesuaikan dengan backend Anda)
  const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  const handleScanBarcode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput) return;

    const targetProduct = products?.find(
      (p) => p.productId.toUpperCase() === barcodeInput.toUpperCase()
    );

    if (!targetProduct) {
      toast.error(`BARCODE ${barcodeInput} TIDAK ADA DI SISTEM!`);
      setBarcodeInput("");
      return;
    }

    if (targetProduct.category !== currentLayout?.type) {
      toast.error(`SALAH RAK! KAIN INI ${targetProduct.category}, RAK INI UNTUK ${currentLayout?.type}`);
      setBarcodeInput("");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("location", rackId); 
      formData.append("name", targetProduct.name);

      await updateProduct({
        productId: targetProduct.productId,
        formData: formData
      }).unwrap();

      toast.success(`${targetProduct.name} MASUK KE RAK ${rackId}`);
      setBarcodeInput("");
      refetch();
    } catch (error) {
      toast.error("GAGAL MEMPROSES PENEMPATAN");
    }
  };

  const handleRemoveFromRack = async (productId: string) => {
    if (confirm("Keluarkan kain dari rak ini?")) {
      try {
        const formData = new FormData();
        formData.append("location", ""); 

        await updateProduct({ productId, formData }).unwrap();
        toast.success("Kain dikeluarkan dari rak");
        refetch();
      } catch (error) {
        toast.error("Gagal");
      }
    }
  };

  if (isLoading) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
      <Loader2 className="animate-spin text-emerald-500" size={40} />
      <p className="font-black text-slate-400 tracking-widest text-xs uppercase italic">Sinkronisasi Data Rak...</p>
    </div>
  );

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <Link href="/management-stock/daftar-layout" className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 font-black text-[10px] uppercase mb-8 transition-all tracking-widest">
        <ArrowLeft size={14} /> Kembali ke Denah Layout
      </Link>

      {/* HEADER SCANNER */}
      <div className="bg-slate-900 rounded-[3rem] p-10 text-white mb-10 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="text-emerald-500" size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 italic">Area Penyimpanan: {currentLayout?.type}</span>
            </div>
            <h1 className="text-6xl font-black italic tracking-tighter uppercase leading-none">RAK {rackId}</h1>
          </div>

          <form onSubmit={handleScanBarcode} className="flex bg-white/10 p-2 rounded-full border border-white/20 backdrop-blur-md focus-within:bg-white/20 transition-all">
            <input 
              autoFocus
              className="bg-transparent px-8 py-4 outline-none font-bold text-lg w-72 uppercase placeholder:text-white/30"
              placeholder="SCAN BARCODE KAIN..."
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
            />
            <button type="submit" disabled={isUpdating} className="bg-emerald-500 hover:bg-emerald-400 p-5 rounded-full shadow-lg transition-all active:scale-90 flex items-center justify-center">
              {isUpdating ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
            </button>
          </form>
        </div>
        <ScanLine size={200} className="absolute -right-10 -bottom-10 opacity-10 rotate-12" />
      </div>

      {/* CONTENT LIST */}
      <div className="grid grid-cols-1 gap-4">
        <h3 className="px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
          Isi Rak Saat Ini ({itemsInRack.length} SKU)
        </h3>

        {itemsInRack.length > 0 ? (
          itemsInRack.map((item) => (
            <div key={item.productId} className="bg-white p-4 rounded-[2.5rem] border border-slate-100 flex items-center justify-between group hover:border-emerald-500/30 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
              <div className="flex items-center gap-6">
                {/* PERBAIKAN GAMBAR: Menggunakan Frame yang Konsisten */}
                <div className="w-24 h-24 bg-slate-50 rounded-[1.8rem] overflow-hidden relative flex items-center justify-center border border-slate-100 group-hover:scale-105 transition-transform">
                  {item.imageUrl ? (
                    <Image 
                      src={`${IMAGE_BASE_URL}/assets/${item.imageUrl}`} // Path lengkap ke backend
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                      priority
                    />
                  ) : (
                    <Package size={32} className="text-slate-200" />
                  )}
                </div>

                <div>
                  <p className="text-[10px] font-black text-emerald-600 italic tracking-widest uppercase mb-1">{item.productId}</p>
                  <h4 className="text-2xl font-black text-slate-800 uppercase italic leading-none">{item.name}</h4>
                  <div className="flex gap-2 mt-3">
                    <span className="text-[8px] font-black bg-slate-100 px-3 py-1 rounded-full text-slate-500 uppercase tracking-widest">{item.color}</span>
                    <span className="text-[8px] font-black bg-slate-900 text-white px-3 py-1 rounded-full uppercase tracking-widest">{item.quality}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8 pr-6">
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-300 uppercase italic tracking-tighter">Volume Tersimpan</p>
                  <p className="text-4xl font-black text-slate-800 tracking-tighter italic">
                    {item.stockQuantity} <span className="text-[10px] text-slate-400 -ml-1 uppercase tracking-normal">{item.unit}</span>
                  </p>
                </div>
                <button 
                  onClick={() => handleRemoveFromRack(item.productId)} 
                  className="p-5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-[1.5rem] transition-all"
                >
                  <Trash2 size={24} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-24 text-center bg-white rounded-[4rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center">
             <div className="p-8 bg-slate-50 rounded-full mb-6">
                <Barcode size={64} className="text-slate-200" />
             </div>
             <p className="text-slate-300 font-black uppercase italic tracking-[0.2em] text-xs">Silahkan Scan Barcode Kain</p>
             <p className="text-slate-200 text-[10px] mt-1 font-bold uppercase tracking-widest">Aktivasi Penempatan untuk Rak {rackId}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailLayout;