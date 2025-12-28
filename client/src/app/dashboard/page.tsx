"use client";

import {
  CheckCircle,
  Package,
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  Box,
} from "lucide-react";
import CardExpenseSummary from "./CardExpenseSummary";
import CardPopularProducts from "./CardPopularProducts";
import CardPurchaseSummary from "./CardPurchaseSummary";
import CardSalesSummary from "./CardSalesSummary";
import StatCard from "./StatCard";
import { useGetDashboardMetricsQuery } from "@/state/api";

const Dashboard = () => {
  // Ambil data dari API terbaru yang kita buat di backend
  const { data: dashboardMetrics, isLoading } = useGetDashboardMetricsQuery();

  if (isLoading)
    return (
      <div className="p-8 text-center font-bold text-indigo-600">
        Sinkronisasi Gudang AI...
      </div>
    );

  // Ekstrak data total informasi dari backend
  const info = dashboardMetrics?.totalInformasi;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 xl:overflow-auto gap-10 pb-4 custom-grid-rows">
      {/* 1. Produk Populer (Sudah Terhubung ke Quantity) */}
      <CardPopularProducts />

      {/* 2. Grafik Penjualan */}
      <CardSalesSummary />

      {/* 3. Ringkasan Pembelian */}
      <CardPurchaseSummary />

      {/* 4. Ringkasan Pengeluaran */}
      <CardExpenseSummary />

      {/* 5. STAT CARD: Ringkasan Stok Gudang (Data Real dari Backend) */}
      <StatCard
        title="Ringkasan Stok Tekstil"
        primaryIcon={<Package className="text-indigo-600 w-6 h-6" />}
        dateRange="Status Real-time"
        details={[
          {
            title: "Total SKU Kain",
            amount: info?.totalKain?.toString() || "0",
            changePercentage: 10, // Anda bisa menghitung growth dari data backend nanti
            IconComponent: TrendingUp,
          },
          {
            title: "Total Roll di Gudang",
            amount: info?.totalStokRoll?._sum?.Quantity?.toString() || "0",
            changePercentage: 5,
            IconComponent: TrendingUp,
          },
        ]}
      />

      {/* 6. STAT CARD: Diversitas Kain */}
      <StatCard
        title="Kategori & Desain"
        primaryIcon={<Layers className="text-indigo-600 w-6 h-6" />}
        dateRange="Klasifikasi AI"
        details={[
          {
            title: "Jenis Kain Aktif",
            amount: info?.totalJenisKain?.toString() || "0",
            changePercentage: 0,
            IconComponent: Activity,
          },
          {
            title: "Varian Desain",
            amount: dashboardMetrics?.stockByDesain?.length?.toString() || "0",
            changePercentage: 2,
            IconComponent: TrendingUp,
          },
        ]}
      />

      {/* 7. STAT CARD: Status Operasional */}
      <StatCard
        title="Status Pengiriman"
        primaryIcon={<CheckCircle className="text-indigo-600 w-6 h-6" />}
        dateRange="Update Hari Ini"
        details={[
          {
            title: "Siap Kirim",
            amount: "42 Roll",
            changePercentage: 12,
            IconComponent: TrendingUp,
          },
          {
            title: "Barang Pending",
            amount: "5 Roll",
            changePercentage: -15,
            IconComponent: TrendingDown,
          },
        ]}
      />
    </div>
  );
};

export default Dashboard;
