"use client";

import React, { useState, use } from "react";
import Header from "@/app/(components)/Header";
import { Barcode, Package, Trash2, ArrowLeft, ScanLine, CheckCircle2, Loader2, ShieldCheck, MapPin } from "lucide-react";
import Link from "next/link";
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

  const handleScanBarcode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput) return;

    const targetProduct = products?.find(
      (p) => p.productId.toUpperCase() === barcodeInput.toUpperCase()
    );

    // VALIDASI 1: Cek keberadaan produk
    if (!targetProduct) {
      toast.error(`BARCODE ${barcodeInput} TIDAK ADA DI SISTEM!`);
      setBarcodeInput("");
      return;
    }

    // VALIDASI 2: Cek Kategori (Kain Polosan tidak boleh masuk Rak Printing)
    if (targetProduct.category !== currentLayout?.type) {
      toast.error(`SALAH RAK! KAIN INI ${targetProduct.category}, RAK INI UNTUK ${currentLayout?.type}`);
      setBarcodeInput("");
      return;
    }

    try {
      // Kita gunakan FormData sesuai kebutuhan controller Anda
      const formData = new FormData();
      formData.append("location", rackId); 
      // Penting: Kirim data minimal atau data yang dibutuhkan backend saja
      formData.append("name", targetProduct.name);

      await updateProduct({
        productId: targetProduct.productId,
        formData: formData
      }).unwrap();

      toast.success(`${targetProduct.name} BERHASIL MASUK KE RAK ${rackId}`);
      setBarcodeInput("");
      refetch();
    } catch (error) {
      toast.error("GAGAL MEMPROSES PENEMPATAN");
    }
  };

  const handleRemoveFromRack = async (productId: string) => {
    if (confirm("Keluarkan kain dari rak ini? (Status akan menjadi 'Unplaced')")) {
      try {
        const formData = new FormData();
        formData.append("location", ""); // Kosongkan lokasi

        await updateProduct({ productId, formData }).unwrap();
        toast.success("Kain dikeluarkan dari rak");
        refetch();
      } catch (error) {
        toast.error("Gagal");
      }
    }
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center font-black animate-pulse">MEMUAT DATA RAK...</div>;

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
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">Rak Aktif: {currentLayout?.type}</span>
            </div>
            <h1 className="text-6xl font-black italic tracking-tighter uppercase">RAK {rackId}</h1>
          </div>

          <form onSubmit={handleScanBarcode} className="flex bg-white/10 p-2 rounded-full border border-white/20 backdrop-blur-md focus-within:bg-white/20 transition-all">
            <input 
              autoFocus
              className="bg-transparent px-8 py-4 outline-none font-bold text-lg w-72 uppercase placeholder:text-white/30"
              placeholder="SCAN BARCODE KAIN..."
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
            />
            <button type="submit" disabled={isUpdating} className="bg-emerald-500 hover:bg-emerald-400 p-5 rounded-full shadow-lg transition-all active:scale-90">
              {isUpdating ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
            </button>
          </form>
        </div>
        {/* Background Decorative Icon */}
        <ScanLine size={200} className="absolute -right-10 -bottom-10 opacity-10 rotate-12" />
      </div>

      {/* CONTENT LIST */}
      <div className="grid grid-cols-1 gap-4">
        <h3 className="px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Isi Rak Saat Ini ({itemsInRack.length} SKU)</h3>
        {itemsInRack.length > 0 ? (
          itemsInRack.map((item) => (
            <div key={item.productId} className="bg-white p-5 rounded-[2.5rem] border border-slate-100 flex items-center justify-between group hover:border-emerald-500 transition-all">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-slate-100 rounded-2xl overflow-hidden font-black flex items-center justify-center text-slate-300">
                  {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover" /> : <Package size={32}/>}
                </div>
                <div>
                  <p className="text-[10px] font-black text-emerald-600 italic tracking-widest uppercase">{item.productId}</p>
                  <h4 className="text-xl font-black text-slate-800 uppercase italic">{item.name}</h4>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[8px] font-black bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">{item.color}</span>
                    <span className="text-[8px] font-black bg-slate-900 text-white px-2 py-0.5 rounded-full">{item.quality}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-8 pr-4">
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-300 uppercase italic">Stock</p>
                  <p className="text-3xl font-black text-slate-800 tracking-tighter">{item.stockQuantity} <span className="text-xs">{item.unit}</span></p>
                </div>
                <button onClick={() => handleRemoveFromRack(item.productId)} className="p-4 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all">
                  <Trash2 size={24} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center bg-white rounded-[3rem] border-4 border-dashed border-slate-100">
             <Barcode size={64} className="mx-auto text-slate-200 mb-4" />
             <p className="text-slate-300 font-black uppercase italic tracking-widest">Silahkan Scan Barcode Kain untuk memasukkannya ke rak ini</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailLayout;