import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Groq from "groq-sdk";
import multer from "multer";
import path from "path";
import fs from "fs";

const prisma = new PrismaClient();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "dummy_key" });
const JWT_SECRET = process.env.JWT_SECRET || "rahasia_default_123";

// --- KONFIGURASI MULTER (PENYIMPANAN LOKAL) ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/profiles";
    // Buat folder jika belum ada
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Nama file unik: profile-123456789.jpg
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "profile-" + uniqueSuffix + path.extname(file.originalname));
  },
});

export const upload = multer({ storage: storage });

// --- FUNGSI LOGIN ---
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, password } = req.body;

    const user = await prisma.users.findUnique({ where: { userId } });
    if (!user) {
      res.status(401).json({ message: "Username tidak terdaftar" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: "Password salah!" });
      return;
    }

    let aiGreeting = `Halo ${user.name}, selamat datang kembali di sistem Stock Vision.`;
    
    try {
      if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.startsWith("gsk_")) {
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: `Sapa ${user.name} sebagai admin gudang dalam 1 kalimat sangat pendek dan keren.` }],
            model: "llama-3.1-8b-instant", 
          },
          { timeout: 3000 }
        );
        aiGreeting = chatCompletion.choices[0]?.message?.content || aiGreeting;
      }
    } catch (aiError) {
      console.error("AI Error:", aiError);
    }

    const token = jwt.sign({ userId: user.userId }, JWT_SECRET, { expiresIn: "24h" });

    res.status(200).json({
      success: true,
      token,
      user: { 
        userId: user.userId, 
        name: user.name, 
        // @ts-ignore
        image: user.image 
      },
      aiGreeting
    });
  } catch (error) {
    console.error("Login Server Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// --- FUNGSI REGISTER ---
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.users.create({
      data: { userId, name, email, password: hashedPassword }
    });

    res.status(201).json({ 
      success: true, 
      message: "User berhasil didaftarkan", 
      userId: newUser.userId 
    });
  } catch (error) {
    res.status(400).json({ message: "Gagal register. Username mungkin sudah digunakan." });
  }
};

// --- FUNGSI UPDATE PROFILE (DENGAN FILE LOKAL) ---
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { name } = req.body;
    
    let imagePath: string | undefined;

    // Jika ada file yang diupload, buat URL-nya
    if (req.file) {
      // URL contoh: http://localhost:5001/uploads/profiles/profile-123.jpg
      imagePath = `${req.protocol}://${req.get("host")}/uploads/profiles/${req.file.filename}`;
    }

    const updatedUser = await prisma.users.update({
      where: { userId },
      data: { 
        ...(name && { name }),
        ...(imagePath && { image: imagePath }) 
      }
    });

    res.status(200).json({
      success: true,
      message: "Profil diperbarui",
      user: {
        userId: updatedUser.userId,
        name: updatedUser.name,
        // @ts-ignore
        image: updatedUser.image
      }
    });
  } catch (error: any) {
    console.error("Update Error:", error);
    res.status(500).json({ success: false, message: "Gagal memperbarui database" });
  }
};