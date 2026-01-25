"use client";

import { useState, useEffect, useRef } from "react";
import { 
  PlusCircle, Trash2, ArrowLeft, ScanLine, Truck, Search,
  X, Edit, Eye, CheckCircle, Phone, Mail, MapPin, Calendar, Zap, Printer
} from "lucide-react";
import Header from "@/app/(components)/Header";
import { useLazyGetProductByBarcodeQuery, useCreateShippingMutation } from "@/state/api";
import { useReactToPrint } from "react-to-print";

const PengirimanPage = () => {
  const [view, setView] = useState<"list" | "create">("list");
  
  // LOGIKA PERSISTENCE
  const [shippingList, setShippingList] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("stock_vision_shipping");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [selectedDetail, setSelectedDetail] = useState<any | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [scannedItems, setScannedItems] = useState<any[]>([]);
  const [customerInfo, setCustomerInfo] = useState({ 
    nama: "", email: "", kontak: "", alamat: "" 
  });
  
  const inputRef = useRef<HTMLInputElement>(null);
  const printRef = useRef<HTMLDivElement>(null); // Ref untuk cetak
  const [triggerScan] = useLazyGetProductByBarcodeQuery();
  const [processShipping, { isLoading: isShipping }] = useCreateShippingMutation();

  // Fungsi Cetak
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Surat_Jalan_${selectedDetail?.noSurat || "Draft"}`,
  });

  useEffect(() => {
    localStorage.setItem("stock_vision_shipping", JSON.stringify(shippingList));
  }, [shippingList]);

  const totalRoll = scannedItems.length;
  const totalYard = scannedItems.reduce((acc, item) => acc + (Number(item.yard) || 0), 0);

  useEffect(() => {
    if (view === "create" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [view]);

  const executeScan = async (code: string) => {
    const cleanCode = code.trim();
    if (!cleanCode) return;
    try {
      const { data: product, error } = await triggerScan(cleanCode);
      if (error || !product) {
        alert("Barcode tidak terdaftar!");
        setBarcodeInput("");
        return;
      }
      if (scannedItems.some(item => item.sku === product.productId)) {
        alert("Kain sudah ada di daftar!");
      } else {
        setScannedItems(prev => [{
          sku: product.productId,
          nama: product.name,
          yard: product.stockQuantity,
          unit: product.unit || "Yd"
        }, ...prev]);
      }
    } catch (err) { console.error(err); }
    setBarcodeInput("");
    inputRef.current?.focus();
  };

  const handleSaveShipping = async () => {
    if (scannedItems.length === 0) return alert("Scan kain terlebih dahulu!");
    if (!customerInfo.nama) return alert("Nama perusahaan wajib diisi!");

    try {
      await processShipping({
        items: scannedItems,
        destination: customerInfo.nama
      }).unwrap();

      const newData = {
        id: editingId || Date.now(),
        ...customerInfo,
        items: scannedItems,
        totalRoll: scannedItems.length,
        totalYard: totalYard,
        tanggal: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        noSurat: editingId 
          ? shippingList.find(s => s.id === editingId)?.noSurat 
          : `SJ-${Math.floor(1000 + Math.random() * 9000)}`
      };

      if (editingId) {
        setShippingList(shippingList.map(item => item.id === editingId ? newData : item));
      } else {
        setShippingList([newData, ...shippingList]);
      }

      alert(editingId ? "Surat Jalan Diperbarui!" : "Surat Jalan Berhasil Disimpan!");
      resetForm();
    } catch (err) {
      alert("Gagal memproses pengiriman.");
    }
  };

  const resetForm = () => {
    setScannedItems([]);
    setCustomerInfo({ nama: "", email: "", kontak: "", alamat: "" });
    setEditingId(null);
    setView("list");
  };

  const handleDelete = (id: number) => {
    if(confirm("Hapus data surat jalan secara permanen?")) {
      setShippingList(shippingList.filter(item => item.id !== id));
    }
  };

  // --- TAMPILAN CREATE ---
  if (view === "create") {
    return (
      <div className="mx-auto pb-10 w-full p-8 bg-[#f4f7fe] min-h-screen">
        <div className="flex justify-between items-center mb-10">
           <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200">
                <Truck className="text-white w-6 h-6" />
              </div>
              <h1 className="text-4xl font-[1000] text-slate-900 italic uppercase tracking-tighter">
                {editingId ? "EDIT" : "DELIVERY"} <span className="text-indigo-600">ORDER</span>
              </h1>
           </div>
          <button 
            onClick={handleSaveShipping}
            disabled={isShipping || scannedItems.length === 0}
            className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase shadow-xl hover:bg-indigo-700 disabled:bg-slate-300 flex items-center gap-3 transition-all transform hover:-translate-y-1"
          >
            {isShipping ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CheckCircle className="w-4 h-4" />} 
            {editingId ? "PERBARUI DATA" : "FINALISASI DATA"}
          </button>
        </div>

        <div className="grid grid-cols-12 gap-10">
          <div className="col-span-4">
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
              <h3 className="font-black uppercase text-sm text-slate-800 italic mb-8 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div> INFORMASI TUJUAN
              </h3>
              <div className="space-y-4">
                <input type="text" placeholder="Nama Perusahaan" className="w-full px-6 py-4 bg-slate-50 rounded-2xl text-xs font-bold outline-none border border-transparent focus:border-indigo-200 shadow-inner" value={customerInfo.nama} onChange={(e) => setCustomerInfo({...customerInfo, nama: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="Email" className="w-full px-6 py-4 bg-slate-50 rounded-2xl text-xs font-bold outline-none shadow-inner" value={customerInfo.email} onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})} />
                  <input type="text" placeholder="Kontak" className="w-full px-6 py-4 bg-slate-50 rounded-2xl text-xs font-bold outline-none shadow-inner" value={customerInfo.kontak} onChange={(e) => setCustomerInfo({...customerInfo, kontak: e.target.value})} />
                </div>
                <textarea placeholder="Alamat Lengkap" className="w-full px-6 py-4 bg-slate-50 rounded-2xl text-xs font-bold outline-none h-32 resize-none shadow-inner" value={customerInfo.alamat} onChange={(e) => setCustomerInfo({...customerInfo, alamat: e.target.value})} />
              </div>
              <button onClick={resetForm} className="mt-8 flex items-center justify-center gap-2 w-full text-slate-400 font-black text-[10px] uppercase hover:text-red-500 transition-colors italic border-t border-slate-50 pt-6">
                <ArrowLeft size={14}/> BATALKAN & KEMBALI
              </button>
            </div>
          </div>

          <div className="col-span-8 flex flex-col">
            <div className="bg-white p-3 rounded-[2.5rem] shadow-xl border-[3px] border-indigo-600 flex items-center mb-8">
                <div className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600"><ScanLine size={32} /></div>
                <input ref={inputRef} type="text" value={barcodeInput} onChange={(e) => setBarcodeInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && executeScan(barcodeInput)} placeholder="SCAN BARCODE KAIN..." className="flex-grow bg-transparent border-none outline-none px-8 font-[1000] text-xl tracking-widest text-slate-700 uppercase" />
                <button onClick={() => executeScan(barcodeInput)} className="bg-slate-900 text-white px-10 py-5 rounded-[1.5rem] font-black text-xs uppercase shadow-lg">INPUT</button>
            </div>

            <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col flex-grow min-h-[400px]">
                <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                  <h3 className="font-black text-xs uppercase text-slate-800 italic">DAFTAR MUATAN KELUAR</h3>
                  <span className="bg-emerald-50 text-emerald-600 text-[10px] px-4 py-2 rounded-full font-black italic">{scannedItems.length} ITEMS</span>
                </div>
                <div className="overflow-y-auto flex-grow">
                  <table className="w-full text-left">
                    <tbody className="divide-y divide-slate-50">
                      {scannedItems.map((item, i) => (
                        <tr key={i} className="hover:bg-slate-50"><td className="px-10 py-5"><p className="font-black text-xs uppercase text-slate-800">{item.nama}</p><p className="text-[9px] font-bold text-indigo-400">#{item.sku}</p></td><td className="text-center font-black text-xs text-slate-700">{item.yard} {item.unit}</td><td className="px-10 text-right"><button onClick={() => setScannedItems(scannedItems.filter((_, idx) => idx !== i))} className="p-2 text-slate-200 hover:text-red-500"><X size={20}/></button></td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="bg-slate-900 p-8 grid grid-cols-2 gap-4">
                  <div className="text-center border-r border-slate-700"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">MUATAN</p><p className="text-3xl font-[1000] text-white italic">{totalRoll} <span className="text-xs text-indigo-400 font-black">Roll</span></p></div>
                  <div className="text-center"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">PANJANG</p><p className="text-3xl font-[1000] text-white italic">{totalYard.toFixed(1)} <span className="text-xs text-indigo-400 font-black">Yd</span></p></div>
                </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- TAMPILAN LIST ---
  return (
    <div className="p-8 bg-[#f4f7fe] min-h-screen relative">
      <div className="flex justify-between items-end mb-12">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-md shadow-indigo-100"><Zap size={18} className="text-white fill-current" /></div>
            <h1 className="text-3xl font-[1000] text-slate-900 uppercase italic tracking-tighter">LOG <span className="text-indigo-600">DELIVERY</span></h1>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] ml-11 italic">Arsip Pengiriman Aktif</p>
        </div>
        <button onClick={() => setView("create")} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase shadow-xl hover:scale-105 transition-all flex items-center gap-3"><PlusCircle size={18} /> BUAT SURAT JALAN</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {shippingList.map((item) => (
          <div key={item.id} className="bg-white rounded-[3rem] border border-slate-100 p-8 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[5rem] -mr-12 -mt-12 group-hover:bg-indigo-100 transition-colors"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8">
                <span className="bg-slate-900 text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase italic tracking-widest">{item.noSurat}</span>
                <div className="flex gap-1">
                  <button onClick={() => setSelectedDetail(item)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:text-indigo-600 transition-all shadow-sm"><Eye size={16} /></button>
                  <button onClick={() => handleDelete(item.id)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:text-red-600 transition-all shadow-sm"><Trash2 size={16} /></button>
                </div>
              </div>
              <div className="mb-8">
                <h4 className="text-xl font-[1000] text-slate-800 uppercase italic leading-none mb-2">{item.nama}</h4>
                <p className="text-[10px] font-bold text-slate-400 flex items-center gap-2 italic"><MapPin size={12} /> {item.alamat || "N/A"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                 <div className="bg-slate-50/50 p-4 rounded-3xl"><p className="text-[8px] font-black text-slate-400 uppercase mb-1">Items</p><p className="text-2xl font-[1000] text-slate-800 italic">{item.totalRoll} <span className="text-[10px] text-indigo-500 font-black">Roll</span></p></div>
                 <div className="bg-slate-50/50 p-4 rounded-3xl"><p className="text-[8px] font-black text-slate-400 uppercase mb-1">Length</p><p className="text-2xl font-[1000] text-slate-800 italic">{item.totalYard.toFixed(1)} <span className="text-[10px] text-indigo-500 font-black">Yd</span></p></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- MODAL DETAIL & PRINT TEMPLATE --- */}
      {selectedDetail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-2xl rounded-[4rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-12 relative">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <span className="bg-indigo-600 text-white text-[10px] font-black px-5 py-2 rounded-full uppercase italic tracking-[0.3em]">{selectedDetail.noSurat}</span>
                  <h2 className="text-4xl font-[1000] text-slate-900 uppercase italic mt-6 tracking-tighter">{selectedDetail.nama}</h2>
                </div>
                <div className="flex gap-2">
                  <button onClick={handlePrint} className="p-5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-[2rem] transition-all flex items-center gap-2 font-black text-xs uppercase shadow-lg shadow-indigo-200">
                    <Printer size={20} /> PRINT SJ
                  </button>
                  <button onClick={() => setSelectedDetail(null)} className="p-5 bg-slate-100 text-slate-400 hover:text-red-500 rounded-[2rem] transition-all"><X size={24} /></button>
                </div>
              </div>

              {/* TAMPILAN LIST BARANG DI MODAL */}
              <div className="bg-slate-50 rounded-[3rem] p-10 border border-slate-100 shadow-inner overflow-hidden">
                <h4 className="font-black text-[11px] uppercase text-slate-400 mb-6 italic flex items-center gap-3">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div> DETAIL CARGO MUATAN
                </h4>
                <div className="max-h-[300px] overflow-y-auto space-y-4 pr-3">
                  {selectedDetail.items.map((barang: any, idx: number) => (
                    <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-100 flex justify-between items-center shadow-sm">
                      <div><p className="text-sm font-black text-slate-800 uppercase italic">{barang.nama}</p><p className="text-[10px] font-bold text-indigo-400 uppercase mt-1">ID: {barang.sku}</p></div>
                      <p className="text-lg font-[1000] text-slate-900 italic">{barang.yard} <span className="text-[11px] text-slate-400 font-black">Yd</span></p>
                    </div>
                  ))}
                </div>
              </div>

              {/* TEMPLATE TERSEMBUNYI UNTUK PRINT (UKURAN A4) */}
              <div className="hidden">
                <div ref={printRef} className="p-16 text-slate-900 font-sans">
                  <div className="flex justify-between border-b-4 border-slate-900 pb-8 mb-10">
                    <div><h1 className="text-4xl font-black italic uppercase tracking-tighter">STOCK<span className="text-indigo-600">VISION</span></h1><p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Inventory & Logistics System</p></div>
                    <div className="text-right font-black uppercase"><h2 className="text-2xl italic">Surat Jalan</h2><p className="text-sm">NO: {selectedDetail.noSurat}</p></div>
                  </div>
                  <div className="grid grid-cols-2 gap-10 mb-10 text-xs">
                    <div><p className="font-black text-slate-400 mb-2 uppercase">Pengirim:</p><p className="font-bold">GUDANG UTAMA STOCK VISION</p><p>Jl. Industri Raya No. 45</p><p>Kota Bandung, Jawa Barat</p></div>
                    <div className="text-right"><p className="font-black text-slate-400 mb-2 uppercase">Tujuan:</p><p className="font-black text-lg">{selectedDetail.nama}</p><p className="font-bold">{selectedDetail.alamat}</p><p>{selectedDetail.kontak}</p></div>
                  </div>
                  <table className="w-full mb-10">
                    <thead><tr className="border-y-2 border-slate-900 text-xs font-black uppercase text-left"><th className="py-4">Item SKU</th><th className="py-4">Deskripsi Barang</th><th className="py-4 text-right">Qty</th><th className="py-4 text-right">Unit</th></tr></thead>
                    <tbody className="text-xs font-bold divide-y divide-slate-100">
                      {selectedDetail.items.map((b: any, i: number) => (
                        <tr key={i}><td className="py-4">{b.sku}</td><td className="py-4 uppercase">{b.nama}</td><td className="py-4 text-right">{b.yard}</td><td className="py-4 text-right">{b.unit}</td></tr>
                      ))}
                    </tbody>
                    <tfoot><tr className="border-t-2 border-slate-900 font-black"><td colSpan={2} className="py-4 uppercase">Total Muatan</td><td className="py-4 text-right">{selectedDetail.totalRoll} Roll</td><td className="py-4 text-right">{selectedDetail.totalYard} Yd</td></tr></tfoot>
                  </table>
                  <div className="grid grid-cols-3 gap-10 text-center text-[10px] font-black uppercase mt-20 italic">
                    <div><p className="mb-20">Penerima,</p><div className="border-b border-slate-900 w-32 mx-auto"></div><p className="mt-2">( ________________ )</p></div>
                    <div><p className="mb-20">Driver,</p><div className="border-b border-slate-900 w-32 mx-auto"></div><p className="mt-2">( ________________ )</p></div>
                    <div><p className="mb-20">Hormat Kami,</p><div className="border-b border-slate-900 w-32 mx-auto"></div><p className="mt-2">( Bagian Gudang )</p></div>
                  </div>
                  <div className="mt-20 pt-10 border-t border-slate-100 text-[8px] text-center text-slate-400 font-bold uppercase tracking-widest">Dokumen ini dihasilkan secara otomatis oleh Stock Vision System • {new Date().toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PengirimanPage;