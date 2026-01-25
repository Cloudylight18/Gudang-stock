import { Router } from "express";
import { 
  getLayouts, 
  createLayout, 
  deleteLayout 
} from "../controllers/layoutController";

const router = Router();

/**
 * Endpoint: /layouts
 */

// Mendapatkan semua denah rak
router.get("/", getLayouts);

// Membuat rak baru (Admin)
router.post("/", createLayout);

// Menghapus rak (Hanya jika rak kosong)
router.delete("/:id", deleteLayout);

export default router;