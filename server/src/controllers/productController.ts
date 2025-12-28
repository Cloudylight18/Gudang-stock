import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * 1. MENGAMBIL SEMUA BARANG (READ)
 */
export const getProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const search = req.query.search?.toString();

    const products = await prisma.products.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { jenisKain: { contains: search, mode: "insensitive" } },
              { warna: { contains: search, mode: "insensitive" } },
              { productId: { contains: search, mode: "insensitive" } },
              { Desain: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}, // Jika tidak ada search, ambil semua
      orderBy: {
        name: "asc",
      },
    });
    res.json(products);
  } catch (error) {
    console.error("Error GetProducts:", error);
    res.status(500).json({ message: "Gagal mengambil data dari gudang." });
  }
};

/**
 * 2. MENAMBAH BARANG BARU (CREATE)
 */
export const createProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      productId,
      name,
      Quantity,
      image,
      jenisKain,
      warna,
      Desain,
      width,
      location,
    } = req.body;

    // Validasi field wajib
    if (!productId || !name || Quantity === undefined) {
      res
        .status(400)
        .json({ message: "Barcode (ID), Nama, dan Stok harus diisi." });
      return;
    }

    const product = await prisma.products.create({
      data: {
        productId,
        name,
        Quantity: Number(Quantity),
        image: image || null,
        jenisKain: jenisKain || "Lainnya",
        warna: warna || "N/A",
        Desain: Desain || "-",
        width: width ? Number(width) : 0,
        location: location || null,
      },
    });
    res.status(201).json(product);
  } catch (error) {
    console.error("Error CreateProduct:", error);
    res
      .status(500)
      .json({
        message: "Gagal menambah barang. Periksa apakah Barcode sudah ada.",
      });
  }
};

/**
 * 3. MENGEDIT DATA BARANG (UPDATE)
 */
export const updateProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { productId } = req.params;
    const updateData = req.body;

    // Pastikan konversi tipe data angka dilakukan jika data dikirim
    if (updateData.Quantity !== undefined)
      updateData.Quantity = Number(updateData.Quantity);
    if (updateData.width !== undefined)
      updateData.width = Number(updateData.width);

    const updatedProduct = await prisma.products.update({
      where: { productId },
      data: updateData,
    });

    res.json(updatedProduct);
  } catch (error) {
    console.error("Error UpdateProduct:", error);
    // Jika Prisma tidak menemukan ID, ia akan melempar error
    res
      .status(404)
      .json({ message: "Gagal memperbarui. Barang tidak ditemukan." });
  }
};

/**
 * 4. MENGHAPUS BARANG (DELETE)
 */
export const deleteProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { productId } = req.params;

    // Cek relasi transaksi (Penting!)
    // Pastikan nama tabel 'sales' dan 'purchases' sesuai dengan schema.prisma Anda
    const [hasSales, hasPurchases] = await Promise.all([
      prisma.sales.findFirst({ where: { productId } }),
      prisma.purchases.findFirst({ where: { productId } }),
    ]);

    if (hasSales || hasPurchases) {
      res.status(400).json({
        message: "Barang memiliki riwayat transaksi dan tidak bisa dihapus.",
      });
      return;
    }

    await prisma.products.delete({
      where: { productId },
    });

    res.json({ message: "Barang berhasil dihapus." });
  } catch (error) {
    console.error("Error DeleteProduct:", error);
    res.status(500).json({ message: "Gagal menghapus barang." });
  }
};
