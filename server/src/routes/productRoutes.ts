import { Router } from "express";
import { getProducts, createProduct, updateProduct, deleteProduct } from "../controllers/productController";

const router = Router();

router.get("/", getProducts);
router.post("/", createProduct);
router.patch("/:productId", updateProduct); // Menggunakan PATCH untuk edit sebagian data
router.delete("/:productId", deleteProduct);

export default router;