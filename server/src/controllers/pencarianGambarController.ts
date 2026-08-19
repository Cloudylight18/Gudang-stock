import { Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import { supabase } from "../lib/supabase";
import fs from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import sharp from "sharp";

const prisma = new PrismaClient();

export const searchByImage = async (req: Request, res: Response): Promise<void> => {
  let compressedPath = "";
  const file = req.file;
  const bucketName = "gudang stock kain";

  try {
    const { message } = req.body;

    // --- 1. PROSES GAMBAR UNTUK RIWAYAT (SUPABASE) ---
    let supabasePublicUrl: string | null = null;
    if (file) {
      compressedPath = path.join(path.dirname(file.path), `proc_${Date.now()}.webp`);
      await sharp(file.path).resize(800).webp({ quality: 70 }).toFile(compressedPath);
      
      const fileBuffer = await fs.readFile(compressedPath);
      const fileName = `visual-search/${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
      
      const { data: uploadData } = await supabase.storage
        .from(bucketName)
        .upload(fileName, fileBuffer, { contentType: 'image/webp' });

      if (uploadData) {
        supabasePublicUrl = supabase.storage.from(bucketName).getPublicUrl(fileName).data.publicUrl;
      }
    }

    // --- 2. EKSTRAKSI KATA KUNCI DISIPLIN ---
    // Membersihkan kata umum agar AI fokus pada subjek (warna, motif, jenis bahan)
    const stopWords = ["cari", "yang", "ada", "di", "dan", "dengan", "mirip", "tolong", "cek", "kain", "bahan", "warna", "motif"];
    
    // Ambil kata kunci unik, minimal 3 karakter
    const keywords: string[] = message
      ? message.toLowerCase()
          .replace(/[^\w\s]/gi, '') // Hapus simbol/tanda baca
          .split(/\s+/)
          .filter((word: string) => !stopWords.includes(word) && word.length >= 3)
      : [];

    // --- 3. QUERY DATABASE DENGAN LOGIKA "AND" (STRICT) ---
    // Hasil hanya akan muncul jika SEMUA kata kunci ditemukan dalam kolom produk
    const strictConditions: Prisma.ProductsWhereInput[] = keywords.map((kw: string) => ({
      OR: [
        { name: { contains: kw, mode: 'insensitive' } },
        { description: { contains: kw, mode: 'insensitive' } },
        { color: { contains: kw, mode: 'insensitive' } },
        { design: { contains: kw, mode: 'insensitive' } },
        { category: { contains: kw, mode: 'insensitive' } }
      ]
    }));

    const rawResults = await prisma.products.findMany({
      // Menggunakan AND memastikan hasil pencarian mengerucut/sempit (Akurasi Tinggi)
      where: strictConditions.length > 0 ? { AND: strictConditions } : {}, 
      include: { layout: true },
      take: 20 
    });

    // --- 4. SCORING UNTUK VALIDASI AKHIR ---
    const rankedResults = rawResults.map(product => {
      let score = 0;
      const pName = product.name.toLowerCase();
      const pDesc = (product.description || "").toLowerCase();
      const pColor = (product.color || "").toLowerCase();
      const pDesign = (product.design || "").toLowerCase();

      keywords.forEach((kw: string) => {
        // Bonus skor jika kata kunci ditemukan di lokasi strategis
        if (pName.includes(kw)) score += 40;
        if (pColor.includes(kw)) score += 30;
        if (pDesign.includes(kw)) score += 20;
        if (pDesc.includes(kw)) score += 10;
        
        // Exact match bonus (jika kata kunci sama persis dengan kolom warna/motif)
        if (pColor === kw || pDesign === kw) score += 50;
      });

      return { ...product, searchScore: score };
    })
    .sort((a, b) => b.searchScore - a.searchScore);

    // --- 5. RESPONSE ---
    res.json({
      success: true,
      keywordsUsed: keywords,
      results: rankedResults,
      historyImageUrl: supabasePublicUrl
    });

  } catch (error: any) {
    console.error("❌ Search Error:", error.message);
    res.status(500).json({ success: false, error: "Pencarian gagal diproses." });
  } finally {
    // Hapus file sampah di server
    if (compressedPath && existsSync(compressedPath)) {
      try { await fs.unlink(compressedPath); } catch (e) {}
    }
  }
};