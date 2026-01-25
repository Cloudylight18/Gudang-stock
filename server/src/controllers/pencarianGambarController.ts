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
  const originalPath = req.file?.path;
  const bucketName = "gudang stock kain";

  try {
    const { message } = req.body;
    const file = req.file;

    // 1. PROSES GAMBAR (Visual Reference)
    let supabasePublicUrl: string | null = null;
    if (file) {
      compressedPath = path.join(path.dirname(file.path), `proc_${Date.now()}.webp`);
      await sharp(file.path)
        .resize(800)
        .webp({ quality: 70 })
        .toFile(compressedPath);

      const fileBuffer = await fs.readFile(compressedPath);
      const fileName = `visual-search/${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
      
      const { data: uploadData } = await supabase.storage
        .from(bucketName)
        .upload(fileName, fileBuffer, { contentType: 'image/webp' });

      if (uploadData) {
        supabasePublicUrl = supabase.storage.from(bucketName).getPublicUrl(fileName).data.publicUrl;
      }
    }

    // 2. LOGIKA ANALISIS TEKS LANJUTAN
    // Pecah berdasarkan koma untuk frasa utuh
    const phrases: string[] = message 
      ? message.toLowerCase().split(',').map((p: string) => p.trim()).filter((p: string) => p.length > 0)
      : [];

    const stopWords = ["cari", "yang", "ada", "di", "dan", "dengan", "mirip"];
    const singleWords: string[] = message
      ? message.toLowerCase().split(/\s+/).filter((word: string) => !stopWords.includes(word) && word.length > 2)
      : [];

    const allKeywords = Array.from(new Set([...phrases, ...singleWords]));

    // 3. QUERY DATABASE
    const searchConditions = allKeywords.map((kw: string) => ({
      OR: [
        { name: { contains: kw, mode: 'insensitive' as Prisma.QueryMode } },
        { description: { contains: kw, mode: 'insensitive' as Prisma.QueryMode } },
        { color: { contains: kw, mode: 'insensitive' as Prisma.QueryMode } },
        { design: { contains: kw, mode: 'insensitive' as Prisma.QueryMode } },
        { kombinasi: { contains: kw, mode: 'insensitive' as Prisma.QueryMode } },
        // @ts-ignore
        { category: { contains: kw, mode: 'insensitive' as Prisma.QueryMode } }, 
      ]
    }));

    const rawResults = await prisma.products.findMany({
      where: searchConditions.length > 0 ? { OR: searchConditions } : {},
      include: { layout: true },
      take: 100 
    });

    // 4. LOGIKA SCORING (Akurasi Tinggi)
    const rankedResults = rawResults.map(product => {
      let score = 0;
      const productName = product.name.toLowerCase();
      const productDesc = (product.description || "").toLowerCase();
      const productDesign = (product.design || "").toLowerCase();
      // @ts-ignore
      const productCategory = product.category?.toLowerCase() || "";

      allKeywords.forEach((kw: string) => {
        if (productName.includes(kw)) score += 25;
        if (productCategory.includes(kw)) score += 20;
        if (productDesign.includes(kw)) score += 15;
        if (productDesc.includes(kw)) score += 10;

        // PERBAIKAN DI SINI: Menambahkan tipe : string pada phrase
        phrases.forEach((phrase: string) => {
            if (productName.includes(phrase)) score += 30; 
        });
      });

      if (product.stockQuantity > 0) score += 5;

      return { ...product, searchScore: score };
    })
    .filter(p => p.searchScore > 0) 
    .sort((a, b) => b.searchScore - a.searchScore);

    res.json({
      success: true,
      extractedKeywords: allKeywords,
      phrasesFound: phrases,
      results: rankedResults.slice(0, 20),
      historyImageUrl: supabasePublicUrl
    });

  } catch (error: any) {
    console.error("Search Error:", error.message);
    res.status(500).json({ success: false, error: "Gagal menjalankan pencarian akurat." });
  }
};