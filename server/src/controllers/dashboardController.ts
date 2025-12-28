import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

// Inisialisasi prisma
const prisma = new PrismaClient();

export const getDashboardMetrics = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // 1. Ambil Produk Populer (Stok Terbanyak)
    const popularProducts = await prisma.products.findMany({
      take: 15,
      orderBy: {
        Quantity: "desc",
      },
    });

    // 2. Ambil Penjualan (Sales Summary)
    const salesSummary = await prisma.salesSummary.findMany({
      take: 25,
      orderBy: {
        date: "desc",
      },
    });

    // 3. Ambil Pembelian (Purchase Summary)
    const purchaseSummary = await prisma.purchaseSummary.findMany({
      take: 25,
      orderBy: {
        date: "desc",
      },
    });

    // 4. Ambil Pengeluaran (Expense Summary & Category)
    const expenseSummary = await prisma.expenseSummary.findMany({
      take: 25,
      orderBy: {
        date: "desc",
      },
    });

    const expenseByCategorySummaryRaw = await prisma.expenseByCategory.findMany(
      {
        take: 25,
        orderBy: {
          date: "desc",
        },
      }
    );

    // Mengonversi BigInt ke string/number agar bisa di-serialize ke JSON
    const expenseByCategorySummary = expenseByCategorySummaryRaw.map(
      (item) => ({
        ...item,
        amount: item.amount.toString(),
      })
    );

    // 5. Hitung Total Informasi (Stat Cards)
    const totalKain = await prisma.products.count();
    const totalStokRollAggregate = await prisma.products.aggregate({
      _sum: {
        Quantity: true,
      },
    });

    const totalJenisKainGroup = await prisma.products.groupBy({
      by: ["jenisKain"],
    });

    // KIRIM RESPONS (Perbaikan error .json)
    res.json({
      popularProducts,
      salesSummary,
      purchaseSummary,
      expenseSummary,
      expenseByCategorySummary,
      totalInformasi: {
        totalKain,
        totalStokRoll: totalStokRollAggregate._sum.Quantity || 0,
        totalJenisKain: totalJenisKainGroup.length,
      },
    });
  } catch (error) {
    console.error("Error Dashboard:", error);
    res.status(500).json({ message: "Gagal mengambil data dashboard" });
  }
};
