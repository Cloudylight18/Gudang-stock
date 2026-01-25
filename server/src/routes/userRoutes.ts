import express from "express";
import { login, register, updateProfile, upload } from "../controllers/authController";

const router = express.Router();

/**
 * AUTH ROUTES
 * Digunakan untuk akses masuk dan pendaftaran akun
 */

// Endpoint: POST /users/login
router.post("/login", login);

// Endpoint: POST /users/register
router.post("/register", register);


/**
 * USER PROFILE ROUTES
 * Digunakan untuk update data profil (Nama & Foto)
 */

/**
 * Endpoint: PATCH /users/:userId
 * upload.single("image") -> Middleware Multer untuk menangani file fisik 
 * yang dikirim dari frontend dengan nama field "image"
 */
router.patch("/:userId", upload.single("image"), updateProfile);

export default router;