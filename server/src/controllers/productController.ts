import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * HELPER: Generate Barcode Otomatis (Format: 26A201XXXX)
 */
const generateNextBarcode = async () => {
  const prefix = "26A201";
  
  // Cari barcode terakhir yang menggunakan prefix tersebut
  const lastProduct = await prisma.products.findFirst({
    where: { productId: { startsWith: prefix } },
    orderBy: { productId: "desc" },
  });

  let nextNumber = 1;

  if (lastProduct) {
    // Ambil 4 digit terakhir, ubah ke angka, lalu +1
    const lastSequence = lastProduct.productId.replace(prefix, "");
    const parsed = parseInt(lastSequence);
    if (!isNaN(parsed)) {
      nextNumber = parsed + 1;
    }
  }

  // Gabungkan prefix dengan angka yang dipadding 0 (misal: 0001)
  return `${prefix}${nextNumber.toString().padStart(4, "0")}`;
};

// 1. GET ALL PRODUCTS (Termasuk Search Deskripsi)
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const search = req.query.search?.toString();
    const products = await prisma.products.findMany({
      where: search
        ? {
            OR: [
              { productId: { contains: search, mode: "insensitive" } },
              { name: { contains: search, mode: "insensitive" } },
              { color: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } }, // Tambah pencarian deskripsi
            ],
          }
        : {},
      include: { layout: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving products" });
  }
};

// 2. GET PRODUCT BY BARCODE
export const getProductByBarcode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { barcode } = req.params;
    const product = await prisma.products.findUnique({
      where: { productId: barcode },
      include: { layout: true }
    });
    if (!product) {
      res.status(404).json({ message: "Barcode tidak ditemukan!" });
      return;
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Error scanning barcode" });
  }
};

// 3. CREATE PRODUCT (Barcode Otomatis & Deskripsi)
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      name, stockQuantity, unit, 
      color, category, quality, location, kombinasi, description 
    } = req.body;
    
    // Generate barcode otomatis di backend
    const autoProductId = await generateNextBarcode();

    const imageUrl = req.file ? req.file.filename : null;
    const finalKombinasi = category === "PRINTING" ? kombinasi : null;

    const result = await prisma.$transaction(async (tx) => {
      const newP = await tx.products.create({
        data: { 
          productId: autoProductId, 
          name, 
          stockQuantity: parseFloat(stockQuantity) || 0, 
          unit: unit || "YARD", 
          color,
          category,
          description: description || null,
          kombinasi: finalKombinasi,
          quality: quality || "L1",
          location: location || null,
          imageUrl 
        }
      });

      await tx.barangMasuk.create({
        data: { 
          productId: newP.productId, 
          jumlah: parseFloat(stockQuantity) || 0, 
          keterangan: "Stok Awal (Pendaftaran)" 
        }
      });

      return newP;
    });

    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ message: "Gagal buat produk: " + error.message });
  }
};

// 4. UPDATE PRODUCT (Bisa Edit Deskripsi)
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const { location, stockQuantity, category, kombinasi, description, ...rest } = req.body;
    
    const imageUrl = req.file ? req.file.filename : undefined;

    let finalKombinasi = kombinasi;
    if (category) {
      finalKombinasi = category === "PRINTING" ? kombinasi : null;
    }

    const updated = await prisma.products.update({
      where: { productId },
      data: { 
        ...rest,
        category,
        description: description,
        kombinasi: finalKombinasi,
        location: location === "" ? null : location,
        stockQuantity: stockQuantity ? parseFloat(stockQuantity) : undefined,
        imageUrl: imageUrl 
      }
    });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: "Gagal update: " + error.message });
  }
};

// 5. PROCESS SHIPPING (Massal)
export const processShipping = async (req: Request, res: Response): Promise<void> => {
  try {
    const { items, destination } = req.body;

    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        await tx.products.update({
          where: { productId: item.sku },
          data: { stockQuantity: { decrement: parseFloat(item.yard) } },
        });

        await tx.barangKeluar.create({
          data: {
            productId: item.sku,
            jumlah: parseFloat(item.yard),
            penerima: destination || "Customer Umum",
          },
        });
      }
    });

    res.status(200).json({ message: "Stok berhasil dikurangi" });
  } catch (error: any) {
    res.status(500).json({ message: "Gagal memproses pengiriman", error: error.message });
  }
};

// 6. UPDATE PRODUCT STOCK (Manual)
export const updateProductStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const { amountOut, destination } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      await tx.products.update({
        where: { productId },
        data: { stockQuantity: { decrement: parseFloat(amountOut) } },
      });
      return await tx.barangKeluar.create({
        data: {
          productId,
          jumlah: parseFloat(amountOut),
          penerima: destination || "Umum",
        },
      });
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Gagal update stok" });
  }
};

// 7. GET STOCK LOGS
export const getStockLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const [masuk, keluar] = await Promise.all([
      prisma.barangMasuk.findMany({ include: { product: true }, orderBy: { tanggal: "desc" } }),
      prisma.barangKeluar.findMany({ include: { product: true }, orderBy: { tanggal: "desc" } })
    ]);
    res.json({ masuk, keluar });
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil log" });
  }
};

// 8. DELETE PRODUCT
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    await prisma.products.delete({ where: { productId } });
    res.json({ message: "Produk berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: "Gagal hapus produk" });
  }
};