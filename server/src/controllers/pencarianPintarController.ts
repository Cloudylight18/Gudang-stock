import { Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export const searchPintar = async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ success: false, message: "Query kosong" });
    }

    const cleanQuery = query.toLowerCase();
    
    // 1. NORMALISASI: Pisahkan angka yang menempel (contoh: "rayon45" -> "rayon 45")
    const normalizedQuery = cleanQuery.replace(/([a-zA-Z]+)(\d+)/g, "$1 $2");
    
    // 2. DETEKSI QUANTITY: Mencari angka yang diikuti satuan stok (yds/meter/dll)
    const qtyMatch = normalizedQuery.match(/(\d+)\s*(yard|yds|meter|m|pcs|roll)?/);
    const targetQty = qtyMatch ? parseFloat(qtyMatch[1]) : null;

    // 3. STOPWORDS & TOKENIZING: Menghapus kata umum agar tidak merusak filter AND
    // "motif" ditambahkan ke stopWords karena seringkali tidak tertulis di kolom database
    const stopWords = [
      "carikan", "saya", "kain", "warna", "yang", "ada", "minta", 
      "tolong", "stok", "desain", "design", "cari", "tampilkan", "motif"
    ];

    // Pemisahan kata dengan tipe data eksplisit (w: string) untuk menghapus error TS7006
    const allWords: string[] = normalizedQuery.split(/[\s,]+/).filter((w: string) => w.length > 0);
    const filteredKeywords: string[] = allWords.filter((w: string) => !stopWords.includes(w) && w.length > 1);

    // 4. FUNGSI PEMBUAT FILTER (Reusable)
    const buildSearchFilter = (mode: 'AND' | 'OR'): Prisma.ProductsWhereInput => {
      const filters: Prisma.ProductsWhereInput[] = [];

      filteredKeywords.forEach((word: string) => {
        // Jika kata kunci adalah angka quantity, abaikan dari pencarian teks
        if (qtyMatch && word === qtyMatch[1]) return;

        filters.push({
          OR: [
            { name: { contains: word, mode: 'insensitive' as Prisma.QueryMode } },
            { productId: { contains: word, mode: 'insensitive' as Prisma.QueryMode } },
            { color: { contains: word, mode: 'insensitive' as Prisma.QueryMode } },
            { design: { contains: word, mode: 'insensitive' as Prisma.QueryMode } },
            { description: { contains: word, mode: 'insensitive' as Prisma.QueryMode } }
          ]
        });
      });

      // Tambahkan filter stok minimal jika terdeteksi
      if (targetQty) {
        filters.push({ stockQuantity: { gte: targetQty } });
      }

      return mode === 'AND' ? { AND: filters } : { OR: filters };
    };

    // 5. EKSEKUSI PENCARIAN BERLAPIS (Weighted Strategy)
    // Strategi 1: Cari yang BENAR-BENAR cocok semua kata (Sangat Akurat)
    let results = await prisma.products.findMany({
      where: buildSearchFilter('AND'),
      include: { layout: true },
      orderBy: { stockQuantity: 'desc' },
      take: 20
    });

    // Strategi 2: Jika Strategi 1 GAGAL (0 hasil), gunakan mode OR (Lebih Longgar/Fuzzy)
    if (results.length === 0 && filteredKeywords.length > 0) {
      results = await prisma.products.findMany({
        where: buildSearchFilter('OR'),
        include: { layout: true },
        orderBy: { stockQuantity: 'desc' },
        take: 20
      });
    }

    // 6. RESPONSE
    res.json({
      success: true,
      results,
      metadata: {
        detectedKeywords: filteredKeywords,
        detectedQty: targetQty,
        originalQuery: query,
        searchMode: results.length > 0 ? (results.length <= (await prisma.products.count({ where: buildSearchFilter('AND') })) ? "exact" : "fuzzy") : "none"
      }
    });

  } catch (error: any) {
    console.error("Search Pintar Error:", error.message);
    res.status(500).json({ success: false, error: "Gagal memproses pencarian pintar" });
  }
};