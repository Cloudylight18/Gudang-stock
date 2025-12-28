import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

/* ROUTE IMPORTS */
import dashboardRoutes from "./routes/dashboardRoutes";
import productRoutes from "./routes/productRoutes";
import userRoutes from "./routes/userRoutes";
import expenseRoutes from "./routes/expenseRoutes";

/* CONFIGURATIONS */
dotenv.config();
const app = express();

/** * MIDDLEWARE
 * Urutan sangat penting: Helmet dan CORS harus di atas
 */
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("dev")); // Mengubah 'common' ke 'dev' agar log lebih berwarna di terminal
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Konfigurasi CORS yang lebih spesifik agar Frontend bisa akses tanpa hambatan
app.use(
  cors({
    origin: "*", // Dalam produksi, ganti dengan URL frontend Anda (misal: http://localhost:3000)
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
    credentials: true,
  })
);

/* ROUTES */
// Menambahkan prefix /api (Opsional, tapi praktik terbaik agar API tertata)
app.use("/dashboard", dashboardRoutes);
app.use("/products", productRoutes);
app.use("/users", userRoutes);
app.use("/expenses", expenseRoutes);

/* HEALTH CHECK (Untuk memastikan server jalan) */
app.get("/", (req, res) => {
  res.send("Gudang Stock API is running...");
});

/* ERROR HANDLING MIDDLEWARE */
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Internal Server Error:", err.stack);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan internal pada server." });
  }
);

const port = Number(process.env.PORT) || 3001;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port} and accessible on network`);
});
export default app;
