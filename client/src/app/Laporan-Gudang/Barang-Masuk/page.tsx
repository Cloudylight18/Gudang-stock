"use client";

import { useGetStockLogsQuery } from "@/state/api";
import { 
  ArrowDownCircle, 
  Calendar, 
  Package, 
  Tag, 
  Hash, 
  ClipboardList 
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const LaporanBarangMasuk = () => {
  const { data: logs, isLoading, isError } = useGetStockLogsQuery();

  // REVISI: Paksa TypeScript untuk mengenali 'logs' sebagai object yang memiliki properti 'masuk'
  const barangMasuk = (logs as any)?.masuk || [];

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="font-black text-emerald-600 uppercase tracking-[0.3em] text-[10px]">Memuat Log Barang Masuk...</p>
    </div>
  );

  if (isError) return (
    <div className="p-10 text-center text-red-500 font-bold uppercase italic tracking-widest">
      Gagal memuat history barang masuk.
    </div>
  );

  return (
    <div className="mx-auto pb-10 w-full p-4 md:p-8 bg-[#f8fafc] min-h-screen">
      {/* HEADER */}
      <div className="mb-12">
        <h1 className="text-4xl font-[900] text-slate-900 tracking-tighter uppercase italic leading-none">
          Incoming <span className="text-emerald-600">Goods</span>
        </h1>
        <p className="text-slate-400 text-[10px] font-[1000] uppercase tracking-[0.3em] mt-3 flex items-center gap-2 italic">
          <ArrowDownCircle size={14} className="text-emerald-500" />
          Log Aktivitas Pendaftaran & Restock
        </p>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/30 text-[10px] font-black text-slate-400 uppercase italic">
                <th className="px-10 py-8 text-left uppercase tracking-[0.2em]">Waktu Input</th>
                <th className="px-6 py-8 text-left uppercase tracking-[0.2em]">Informasi Produk</th>
                <th className="px-6 py-8 text-left uppercase tracking-[0.2em]">Kategori</th>
                <th className="px-6 py-8 text-left uppercase tracking-[0.2em]">Jumlah Masuk</th>
                <th className="px-10 py-8 text-left uppercase tracking-[0.2em]">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {barangMasuk.length > 0 ? (
                barangMasuk.map((log: any) => (
                  <tr key={log.masukId || log.id} className="hover:bg-emerald-50/20 transition-all group">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-3">
                        <Calendar size={16} className="text-slate-300" />
                        <div>
                          <p className="text-[11px] font-[1000] text-slate-700">
                            {log.tanggal ? format(new Date(log.tanggal), "dd MMMM yyyy", { locale: id }) : "-"}
                          </p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">
                            Pukul {log.tanggal ? format(new Date(log.tanggal), "HH:mm") : "--:--"} WIB
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-6">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                          <Hash size={10} className="text-emerald-500" />
                          <span className="text-[10px] font-black text-emerald-600 uppercase">
                            {log.product?.productId || "SKU-MISSING"}
                          </span>
                        </div>
                        <h3 className="text-[13px] font-[1000] text-slate-800 uppercase italic leading-none">
                          {log.product?.name || "Produk Terhapus"}
                        </h3>
                      </div>
                    </td>

                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2">
                        <Tag size={12} className="text-slate-300" />
                        <span className="text-[10px] font-black text-slate-500 uppercase italic">
                          {log.product?.category || "N/A"}
                          {log.product?.kombinasi && ` (${log.product.kombinasi})`}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-6">
                      <div className="bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-2xl w-fit">
                        <span className="text-lg font-[1000] text-emerald-700 italic">
                          +{log.jumlah}
                        </span>
                        <span className="text-[9px] font-black text-emerald-600 uppercase ml-1">
                          {log.product?.unit || "YD"}
                        </span>
                      </div>
                    </td>

                    <td className="px-10 py-6">
                      <div className="flex items-center gap-2 text-slate-400">
                        <ClipboardList size={14} />
                        <span className="text-[10px] font-bold uppercase italic">
                          {log.keterangan || "Stok Masuk"}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-300 italic uppercase font-black text-xs tracking-widest opacity-50">
                    Belum ada riwayat barang masuk
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LaporanBarangMasuk;