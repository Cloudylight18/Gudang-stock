import express, { Application, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import fs from "fs";

/* --- IMPORT ROUTERS --- */
import dashboardRoutes from "./routes/dashboardRoutes";
import productRoutes from "./routes/productRoutes";
import expenseRoutes from "./routes/expenseRoutes";
import layoutRoutes from "./routes/layoutRoutes"; 
import visionRoutes from "./routes/visionRouter"; 
import userRoutes from "./routes/userRoutes"; 

/* --- CONFIGURATIONS --- */
dotenv.config();
const app: Application = express();
const port = Number(process.env.PORT) || 3001;

// --- INISIALISASI FOLDER STORAGE (DIPERBAIKI) ---
const uploadDir = path.join(process.cwd(), "uploads"); 
const assetsDir = path.join(process.cwd(), "assets"); 

// Sub-folder spesifik
const pencarianDir = path.join(uploadDir, "pencarian");
const profilDir = path.join(uploadDir, "profiles");

// Fungsi helper untuk buat folder secara rekursif
const createFolder = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Eksekusi pembuatan folder
createFolder(uploadDir);
createFolder(assetsDir);
createFolder(pencarianDir); // Folder untuk Pencarian AI
createFolder(profilDir);   // Folder untuk Profil User

/* --- MIDDLEWARE STACK --- */
app.use(express.json({ limit: "50mb" })); 
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(morgan("dev")); 

app.use(helmet({
  crossOriginResourcePolicy: false, 
}));

// --- CORS CONFIGURATION ---
const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("🚫 Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  credentials: true
}));

/* --- STATIC FILES HANDLING (DIPERBAIKI) --- */
// Menangani akses file fisik agar bisa dipanggil oleh frontend
// Contoh akses: http://localhost:3001/uploads/pencarian/nama-file.png
app.use("/uploads", express.static(uploadDir)); 
app.use("/assets", express.static(assetsDir));

/* --- ROUTES DEFINITION --- */
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    status: "Online",
    message: "🚀 Stock Vision API is running perfectly...",
    timestamp: new Date().toISOString()
  });
});

app.use("/users", userRoutes); 
app.use("/dashboard", dashboardRoutes);
app.use("/products", productRoutes);
app.use("/expenses", expenseRoutes);
app.use("/layouts", layoutRoutes); 
app.use("/vision", visionRoutes); 

/* --- GLOBAL ERROR HANDLING --- */
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(`[ERROR] ${new Date().toISOString()}: ${err.message}`);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
});

/* --- SERVER STARTUP --- */
app.listen(port, "0.0.0.0", () => {
  const cyan = "\x1b[36m";
  const green = "\x1b[32m";
  const yellow = "\x1b[33m";
  const magenta = "\x1b[35m";
  const blue = "\x1b[34m";
  const reset = "\x1b[0m";
  const bold = "\x1b[1m";

  console.clear();
  console.log(`${cyan}${bold}===========================================================${reset}`);
  console.log(`${magenta}${bold}      📦 STOCK VISION AI SERVER IS NOW LIVE${reset}`);
  console.log(`${cyan}${bold}===========================================================${reset}`);
  console.log(`${green}  ✅ Status        :${reset} Running Successfully`);
  console.log(`${green}  🔗 Base URL      :${reset} ${bold}${blue}http://localhost:${port}${reset}`);
  console.log(`${green}  📷 AI Folder     :${reset} ${yellow}uploads/pencarian/${reset}`);
  console.log(`${green}  👤 Profile Folder:${reset} ${yellow}uploads/profil/${reset}`);
  console.log(`${cyan}${bold}===========================================================${reset}`);
});