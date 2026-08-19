"use client";

import { useGetStockLogsQuery } from "@/state/api";
import { ArrowUpRight, Truck, Calendar } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const BarangKeluarPage = () => {
  const { data: logs, isLoading, isError } = useGetStockLogsQuery();
  
  // Perbaikan: Kita casting sebagai 'any' atau pastikan akses ke logs.keluar aman
  const historyKeluar = (logs as any)?.keluar || [];

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="font-black text-rose-600 uppercase tracking-[0.3em] text-[10px]">Menarik Data Pengiriman...</p>
    </div>
  );

  if (isError) return <div className="p-10 text-center text-red-500 font-bold uppercase italic tracking-widest">Gagal memuat history pengiriman.</div>;

  return (
    <div className="mx-auto pb-10 w-full p-4 md:p-8 bg-[#f8fafc] min-h-screen">
      <div className="mb-12">
        <h1 className="text-4xl font-[900] text-slate-900 tracking-tighter uppercase italic leading-none">
          Barang <span className="text-rose-600">Keluar</span>
        </h1>
        <p className="text-slate-400 text-[10px] font-[1000] uppercase tracking-[0.3em] mt-3 flex items-center gap-2 italic">
          <ArrowUpRight size={14} className="text-rose-500" />
          Arsip pengiriman 
        </p>
      </div>

      <div className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/30 text-[10px] font-black text-slate-400 uppercase italic">
                <th className="px-10 py-8 text-left uppercase tracking-[0.2em]">Waktu Keluar</th>
                <th className="px-6 py-8 text-left uppercase tracking-[0.2em]">SKU & Nama Produk</th>
                <th className="px-6 py-8 text-left uppercase tracking-[0.2em]">Qty Keluar</th>
                <th className="px-10 py-8 text-left uppercase tracking-[0.2em]">Penerima / Tujuan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {historyKeluar.map((log: any) => (
                <tr key={log.keluarId} className="hover:bg-rose-50/10 transition-all group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-3">
                      <Calendar size={16} className="text-slate-300" />
                      <div>
                        <p className="text-[11px] font-[1000] text-slate-700">
                          {format(new Date(log.tanggal), "dd MMMM yyyy", { locale: id })}
                        </p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">
                          Pukul {format(new Date(log.tanggal), "HH:mm")} WIB
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-rose-600 uppercase mb-1">{log.product?.productId}</span>
                      <h3 className="text-[13px] font-[1000] text-slate-800 uppercase italic leading-none">{log.product?.name}</h3>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="bg-rose-50 border border-rose-100 px-4 py-2 rounded-2xl w-fit">
                      <span className="text-lg font-[1000] text-rose-700 italic">-{log.jumlah}</span>
                      <span className="text-[9px] font-black text-rose-600 uppercase ml-1">{log.product?.unit}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Truck size={14} className="text-slate-300" />
                      <span className="text-[11px] font-black uppercase italic tracking-tighter">
                        {log.penerima || "Umum"}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BarangKeluarPage;