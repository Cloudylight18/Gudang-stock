import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 1. AMBIL SEMUA DAFTAR RAK (Termasuk Hitungan Produk)
export const getLayouts = async (req: Request, res: Response): Promise<void> => {
  try {
    const layouts = await prisma.layouts.findMany({
      include: {
        _count: {
          select: { products: true }, // Menghitung otomatis jumlah kain di tiap rak
        },
      },
      orderBy: [
        { baris: "asc" },
        { kolom: "asc" }
      ]
    });

    // Mapping agar sesuai dengan interface Frontend (menambahkan properti totalKain)
    const formatted = layouts.map(l => ({
      ...l,
      totalKain: l._count.products 
    }));

    res.json(formatted);
  } catch (error: any) {
    res.status(500).json({ message: "Gagal mengambil data layout rak: " + error.message });
  }
};

// 2. BUAT RAK BARU
export const createLayout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { layoutId, type, baris, kolom } = req.body;

    // Validasi input wajib
    if (!layoutId || !type || !baris || !kolom) {
      res.status(400).json({ message: "Semua field (ID, Tipe, Baris, Kolom) wajib diisi!" });
      return;
    }

    const newLayout = await prisma.layouts.create({
      data: { 
        layoutId: layoutId.toUpperCase(), // Standarisasi ID jadi Huruf Kapital
        type, 
        baris: baris.toUpperCase(), 
        kolom 
      },
    });

    res.status(201).json(newLayout);
  } catch (error: any) {
    // Error handling jika layoutId duplikat (P2002 adalah kode error Prisma untuk Unique Constraint)
    if (error.code === 'P2002') {
      res.status(400).json({ message: `Rak dengan ID ${req.body.layoutId} sudah terdaftar!` });
    } else {
      res.status(500).json({ message: "Gagal membuat rak sistem." });
    }
  }
};

// 3. HAPUS RAK
export const deleteLayout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Cek apakah ada produk di dalam rak sebelum dihapus
    const rackContent = await prisma.products.count({
      where: { location: id }
    });

    if (rackContent > 0) {
      res.status(400).json({ 
        message: `Gagal menghapus! Masih ada ${rackContent} kain di dalam rak ini. Kosongkan rak terlebih dahulu.` 
      });
      return;
    }

    await prisma.layouts.delete({
      where: { layoutId: id },
    });

    res.json({ message: "Rak berhasil dihapus dari denah" });
  } catch (error: any) {
    res.status(500).json({ message: "Gagal menghapus rak: " + error.message });
  }
};