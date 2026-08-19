"use client";

import { useGetLayoutsQuery, useGetProductsQuery } from "@/state/api";
import { LayoutGrid, Ruler, AlertCircle, Box, Package } from "lucide-react";
import React, { useMemo } from "react";

const CardSalesSummary = () => {
  // Ambil kedua data untuk sinkronisasi manual di frontend
  const { data: layouts, isLoading: isLayoutLoading, isError } = useGetLayoutsQuery();
  const { data: products, isLoading: isProductLoading } = useGetProductsQuery();

  // --- LOGIKA KALKULASI (Sama persis dengan DaftarLayout.tsx) ---
  const processedData = useMemo(() => {
    if (!layouts || !products) return [];

    return layouts.map((layout) => {
      // Filter produk yang ada di rak ini
      const rackProducts = products.filter((p) => p.location === layout.layoutId);
      
      const stats = rackProducts.reduce((acc, curr) => {
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

      return {
        ...layout,
        ...stats
      };
    });
  }, [layouts, products]);

  // Hitung Total Keseluruhan untuk Footer
  const grandTotal = useMemo(() => {
    return processedData.reduce((acc, curr) => {
      acc.m += curr.meters;
      acc.y += curr.yards;
      return acc;
    }, { m: 0, y: 0 });
  }, [processedData]);

  if (isError) {
    return (
      <div className="flex items-center justify-center m-5 p-4 bg-red-50 rounded-xl text-red-600 text-[10px] font-black gap-2 uppercase">
        <AlertCircle size={16} /> Gagal Sinkronisasi Data Layout
      </div>
    );
  }

  const isLoading = isLayoutLoading || isProductLoading;

  return (
    <div className="row-span-3 xl:row-span-6 bg-white shadow-xl rounded-[2.5rem] flex flex-col overflow-hidden border border-slate-100">
      {isLoading ? (
        <div className="p-8 animate-pulse space-y-6">
          <div className="h-10 bg-slate-100 rounded-xl w-1/2"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-14 bg-slate-50 rounded-2xl"></div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* HEADER (Gaya Stock Vision) */}
          <div className="bg-slate-50/50 p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg">
                  <LayoutGrid size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-800 italic uppercase tracking-tighter">
                    Ringkasan <span className="text-emerald-500">Layout</span>
                  </h2>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                    Real-time Warehouse Mapping
                  </p>
                </div>
              </div>
              <div className="text-right bg-white px-3 py-1 rounded-full border border-slate-200">
                <span className="text-lg font-black text-slate-700 italic">
                  {processedData.length}
                </span>
                <span className="text-[8px] text-slate-400 font-bold ml-1 uppercase">Rak</span>
              </div>
            </div>
          </div>

          {/* TABLE BODY */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white/95 backdrop-blur-md z-10">
                <tr className="text-[9px] uppercase tracking-[0.2em] text-slate-400 font-black border-b border-slate-50">
                  <th className="px-6 py-4">Kode Rak</th>
                  <th className="px-6 py-4 text-center">Quantity (Meter)</th>
                  <th className="px-6 py-4 text-center">Quantity (Yards)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {processedData.map((layout) => (
                  <tr key={layout.layoutId} className="hover:bg-slate-50/80 transition-all group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-700 italic group-hover:text-emerald-500 transition-colors">
                          {layout.layoutId}
                        </span>
                        <div className="flex items-center gap-1">
                          <Package size={8} className="text-slate-300" />
                          <span className="text-[8px] text-slate-400 font-bold uppercase">
                            {layout.totalRoll} Rolls
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-xs font-black text-slate-600">
                        {layout.meters.toLocaleString("id-ID", { maximumFractionDigits: 1 })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-xs font-black text-emerald-500">
                        {layout.yards.toLocaleString("id-ID", { maximumFractionDigits: 1 })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* FOOTER (Dark Mode Style) */}
          <div className="p-6 bg-slate-900 border-t border-slate-800">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Ruler size={12} />
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Total Meter</p>
                </div>
                <p className="text-lg font-black text-white italic leading-none">
                  {grandTotal.m.toLocaleString("id-ID", { maximumFractionDigits: 0 })}
                  <span className="text-[10px] ml-1 text-slate-500 not-italic">M</span>
                </p>
              </div>
              <div className="space-y-1 text-right border-l border-slate-800 pl-4">
                <div className="flex items-center justify-end gap-2 text-blue-400">
                  <Box size={12} />
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Total Yard</p>
                </div>
                <p className="text-lg font-black text-white italic leading-none">
                  {grandTotal.y.toLocaleString("id-ID", { maximumFractionDigits: 0 })}
                  <span className="text-[10px] ml-1 text-slate-500 not-italic">Yd</span>
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CardSalesSummary;