"use client";

import { useGetProductsQuery, useGetStockLogsQuery } from "@/state/api";
import { Truck, LayoutGrid, TrendingUp, TrendingDown, ClipboardList } from "lucide-react";
import Daftarkain from "./Daftarkain";
import Laporan from "./Laporan";
import Ringkasanlayout from "./Ringkasanlayout";
import StatCard from "./StatCard";
import React from "react";

const Dashboard = () => {
  // 1. Ambil data real-time dari API
  const { data: products } = useGetProductsQuery();
  const { data: logs } = useGetStockLogsQuery();

  // 2. Hitung Kalkulasi Real-time
  const stats = React.useMemo(() => {
    if (!products) return { totalPcs: 0, occupancy: 0, l1Count: 0 };

    // A. Total PCS/Roll (Menjumlahkan semua stok yang ada)
    const totalPcs = products.reduce((acc, p) => acc + (p.stockQuantity || 0), 0);

    // B. Okupansi Rak (Contoh logika: jumlah produk yang punya lokasi / total produk)
    const productsWithLocation = products.filter(p => p.location).length;
    const occupancy = products.length > 0 
      ? Math.round((productsWithLocation / products.length) * 100) 
      : 0;

    // C. QC L1 (Menghitung produk dengan grade L1)
    const l1Count = products.filter(p => p.quality?.toUpperCase() === "L1").length;

    return { totalPcs, occupancy, l1Count };
  }, [products]);

  // 3. Hitung Perubahan (Change Percentage) dari Logs (Opsional/Contoh)
  const calculateChange = () => 5; // Anda bisa buat logika perbandingan stok kemarin vs hari ini di sini

  return (
    <div className="flex flex-col gap-8 p-6 bg-[#f4f7fe] min-h-screen">
      {/* ... Header tetap sama ... */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <Daftarkain />
        <Laporan />
        <Ringkasanlayout />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {/* STATS 1: AKTIVITAS (Data dari Laporan/Logs) */}
        <StatCard
          title="Aktivitas Gudang"
          primaryIcon={<Truck className="text-indigo-600 w-6 h-6" />}
          dateRange="Total Transaksi"
          details={[
            {
              title: "Item Masuk",
              amount: `${(logs as any)?.masuk?.length || 0} Trx`,
              changePercentage: 10,
              IconComponent: TrendingUp,
            },
            {
              title: "Item Keluar",
              amount: `${(logs as any)?.keluar?.length || 0} Trx`,
              changePercentage: -2,
              IconComponent: TrendingDown,
            },
          ]}
        />

        {/* STATS 2: OKUPANSI (DATA REAL-TIME PRODUK) */}
        <StatCard
          title="Okupansi Rak & PCS"
          primaryIcon={<LayoutGrid className="text-emerald-600 w-6 h-6" />}
          dateRange="Status Gudang"
          details={[
            {
              title: "Rak Terisi",
              amount: `${stats.occupancy}%`,
              changePercentage: 2,
              IconComponent: TrendingUp,
            },
            {
              title: "Total Stok",
              amount: `${stats.totalPcs.toLocaleString()} Yd`,
              changePercentage: calculateChange(),
              IconComponent: TrendingUp,
            },
          ]}
        />

        {/* STATS 3: QUALITY CONTROL */}
        <StatCard
          title="Quality Control"
          primaryIcon={<ClipboardList className="text-amber-600 w-6 h-6" />}
          dateRange="Grade Premium"
          details={[
            {
              title: "Total L1",
              amount: `${stats.l1Count} SKU`,
              changePercentage: 15,
              IconComponent: TrendingUp,
            },
            {
              title: "Sisa SKU",
              amount: `${(products?.length || 0) - stats.l1Count} SKU`,
              changePercentage: -5,
              IconComponent: TrendingDown,
            },
          ]}
        />
      </div>
    </div>
  );
};

export default Dashboard;