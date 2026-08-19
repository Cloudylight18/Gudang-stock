import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getDashboardMetrics = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const popularProducts = await prisma.products.findMany({
      take: 15,
      include: {
        layout: true, 
      },
      orderBy: {
        stockQuantity: "desc",
      },
    });

    const operasionalSummary = await prisma.operasionalSummary.findMany({
      take: 25,
      orderBy: {
        tanggal: "asc", 
      },
    });

    const salesSummary = operasionalSummary.map((item) => ({
      salesSummaryId: item.summaryId,
      totalValue: item.totalKeluar,
      date: item.tanggal.toISOString(),
    }));

    const purchaseSummary = operasionalSummary.map((item) => ({
      purchaseSummaryId: item.summaryId,
      totalPurchased: item.totalMasuk,
      date: item.tanggal.toISOString(),
    }));

    // 3. EXPENSE SUMMARY (General)
    const expenseSummary = await prisma.expenseSummary.findMany({
      take: 5,
      orderBy: {
        date: "desc",
      },
    });

    // 4. EXPENSE BY CATEGORY (Untuk Pie Chart)
    const expenseByCategorySummaryRaw = await prisma.expenseByCategory.findMany({
      take: 15, // Ditingkatkan ke 15 agar Pie Chart lebih kaya data
      orderBy: {
        date: "desc",
      },
    });

    // Format jumlah menjadi string agar aman dikonsumsi Frontend
    const expenseByCategorySummary = expenseByCategorySummaryRaw.map((item) => ({
      ...item,
      amount: item.amount.toString(), 
    }));

    // 5. BONUS: Ringkasan Inventori (Unplaced vs Placed)
    // Berguna untuk widget tambahan di dashboard
    const [totalKain, kainTanpaRak] = await Promise.all([
      prisma.products.count(),
      prisma.products.count({ where: { location: null } })
    ]);

    // KIRIM RESPONSE KE FRONTEND
    res.json({
      popularProducts,
      salesSummary,
      purchaseSummary,
      expenseSummary,
      expenseByCategorySummary,
      inventoryStatus: {
        totalKain,
        kainTanpaRak,
        kainDiRak: totalKain - kainTanpaRak
      }
    });
  } catch (error: any) {
    console.error("Dashboard Controller Error:", error);
    res.status(500).json({ 
      message: "Gagal memuat data metrik dashboard",
      error: process.env.NODE_ENV === "development" ? error.message : undefined 
    });
  }
};