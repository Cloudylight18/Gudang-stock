import { Router } from "express";
import multer from "multer";
import fs from "fs";
import path from "path"; // Tambahkan path untuk stabilitas folder
import { 
  getProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  updateProductStock,
  getStockLogs,
  getProductByBarcode,
  processShipping 
} from "../controllers/productController";

const router = Router();

// --- KONFIGURASI PATH ASSETS (SINKRON DENGAN INDEX.TS) ---
const assetsDir = path.join(process.cwd(), "assets");

// Pastikan folder assets tersedia secara fisik
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, assetsDir); // Simpan permanen ke folder assets
  },
  filename: (req, file, cb) => {
    // Sanitasi nama file agar tidak ada spasi yang merusak URL di Frontend
    const safeName = file.originalname.replace(/\s+/g, "_");
    cb(null, `prod-${Date.now()}-${safeName}`);
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Batas 5MB
});

// --- 1. ROUTE LIST & LOGS ---
router.get("/", getProducts);
router.get("/stock-logs", getStockLogs);

// --- 2. ROUTE PROSES MASSAL ---
router.post("/shipping", processShipping);

// --- 3. ROUTE SCAN BARCODE ---
router.get("/scan/:barcode", getProductByBarcode);

// --- 4. MANAJEMEN PRODUK (POST & PATCH DENGAN IMAGE) ---
/**
 * Menggunakan upload.single("image")
 * Field name di FormData frontend harus bernama "image"
 */
router.post("/", upload.single("image"), createProduct);
router.patch("/:productId", upload.single("image"), updateProduct);

// --- 5. OPERASIONAL STOK & DELETE ---
router.patch("/:productId/stock", updateProductStock); 
router.delete("/:productId", deleteProduct);

export default router;