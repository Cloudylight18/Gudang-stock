"use client";

import { useGetStockLogsQuery } from "@/state/api";
import { TrendingDown, TrendingUp, Activity, Package } from "lucide-react";
import numeral from "numeral";
import React from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { format, parseISO, startOfDay } from "date-fns";

const CardPurchaseSummary = () => {
  // Gunakan Query yang sama dengan Laporan Barang Masuk & Keluar
  const { data: logs, isLoading } = useGetStockLogsQuery();

  const chartData = React.useMemo(() => {
    const masuk = (logs as any)?.masuk || [];
    const keluar = (logs as any)?.keluar || [];

    // Mengelompokkan data berdasarkan tanggal untuk grafik
    const dailyData: { [key: string]: { date: string; masuk: number; keluar: number } } = {};

    masuk.forEach((item: any) => {
      const d = format(parseISO(item.tanggal), "yyyy-MM-dd");
      if (!dailyData[d]) dailyData[d] = { date: d, masuk: 0, keluar: 0 };
      dailyData[d].masuk += item.jumlah;
    });

    keluar.forEach((item: any) => {
      const d = format(parseISO(item.tanggal), "yyyy-MM-dd");
      if (!dailyData[d]) dailyData[d] = { date: d, masuk: 0, keluar: 0 };
      dailyData[d].keluar += item.jumlah;
    });

    // Mengurutkan berdasarkan tanggal dan ambil 15 hari terakhir
    return Object.values(dailyData)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-15);
  }, [logs]);

  // Mengambil total transaksi terakhir untuk header stat
  const totalMasukHariIni = React.useMemo(() => {
    const masuk = (logs as any)?.masuk || [];
    return masuk.length > 0 ? masuk[masuk.length - 1].jumlah : 0;
  }, [logs]);

  const totalKeluarHariIni = React.useMemo(() => {
    const keluar = (logs as any)?.keluar || [];
    return keluar.length > 0 ? keluar[keluar.length - 1].jumlah : 0;
  }, [logs]);

  return (
    <div className="flex flex-col justify-between row-span-2 xl:row-span-3 col-span-1 md:col-span-2 xl:col-span-1 bg-white shadow-xl rounded-[2rem] border border-slate-100 overflow-hidden">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-full gap-3 p-10">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sinkronisasi Log...</p>
        </div>
      ) : (
        <>
          {/* HEADER */}
          <div className="px-7 pt-6 pb-4 bg-slate-50/50 border-b border-slate-100">
            <div className="flex items-center gap-2 mb-1">
              <Activity size={16} className="text-indigo-600" />
              <h2 className="text-sm font-black text-slate-800 uppercase italic tracking-tighter">
                Arus Kas <span className="text-indigo-600">Stock Goods</span>
              </h2>
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Perbandingan Masuk vs Keluar</p>
          </div>

          {/* BODY STATS */}
          <div className="px-7 pt-6">
            <div className="grid grid-cols-2 gap-6 p-4 bg-slate-50 rounded-3xl border border-slate-100">
              <div className="border-r border-slate-200">
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1 flex items-center gap-1">
                  <TrendingUp size={10} className="text-emerald-500" /> Masuk Terakhir
                </p>
                <p className="text-2xl font-black text-slate-800 italic leading-none">
                  {numeral(totalMasukHariIni).format("0,0")}
                  <span className="text-[10px] ml-1 text-slate-400 not-italic">YD</span>
                </p>
              </div>
              <div>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1 flex items-center gap-1">
                  <TrendingDown size={10} className="text-rose-500" /> Keluar Terakhir
                </p>
                <p className="text-2xl font-black text-slate-800 italic leading-none">
                  {numeral(totalKeluarHariIni).format("0,0")}
                  <span className="text-[10px] ml-1 text-slate-400 not-italic">YD</span>
                </p>
              </div>
            </div>
          </div>

          {/* CHART CONTAINER */}
          <div className="w-full h-64 px-4 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorMasuk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorKeluar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  tick={{fontSize: 9, fill: '#94a3b8', fontWeight: 'bold'}} 
                  axisLine={false} 
                  tickLine={false}
                  tickFormatter={(val) => format(parseISO(val), "dd MMM")}
                />
                <YAxis hide={true} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "20px",
                    border: "none",
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                    fontSize: "12px",
                    fontWeight: "900"
                  }}
                  itemStyle={{ padding: "0px" }}
                />
                <Area
                  type="step"
                  dataKey="masuk"
                  name="Barang Masuk"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorMasuk)"
                  strokeWidth={3}
                />
                <Area
                  type="step"
                  dataKey="keluar"
                  name="Barang Keluar"
                  stroke="#f43f5e"
                  fillOpacity={1}
                  fill="url(#colorKeluar)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          {/* LEGEND MANUAL */}
          <div className="flex justify-center gap-8 pb-8">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">In Goods</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Out Goods</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CardPurchaseSummary;