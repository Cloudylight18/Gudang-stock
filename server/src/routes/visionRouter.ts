import { Router } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { searchByImage } from "../controllers/pencarianGambarController";
import { searchPintar } from "../controllers/pencarianPintarController";

const router = Router();

// --- 1. KONFIGURASI MULTER (PENYIMPANAN PERMANEN DI UPLOADS/PENCARIAN) ---
// Mengarahkan ke server/uploads/pencarian
const uploadDir = path.join(process.cwd(), "uploads", "pencarian");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); 
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, "_");
    // Prefix v-search memudahkan identifikasi file pencarian
    cb(null, `v-search-${Date.now()}-${safeName}`);
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Hanya file gambar yang diizinkan!") as any);
    }
  }
});

// --- 2. DEFINISI ROUTE ---

router.post("/search-image", upload.single("image"), searchByImage);
router.post("/search-text", searchPintar);

export default router;