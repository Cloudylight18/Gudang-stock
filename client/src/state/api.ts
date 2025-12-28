import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/* --- DEFINISI INTERFACE --- */

export interface Product {
  productId: string;
  name: string;
  stockQuantity: number;
  Quantity: number; // Satuan Roll
  jenisKain: string;
  warna: string;
  // TAMBAHKAN PROPERTI DI BAWAH INI:
  image?: string | null; // Gunakan '?' karena opsional
  width?: number; // Lebar kain
  location?: string | null; // Lokasi rak
  Desain?: string; // Tambahkan juga jika ada
}

export interface SalesSummary {
  salesSummaryId: string;
  totalValue: number;
  changePercentage?: number;
  date: string;
}

export interface PurchaseSummary {
  purchaseSummaryId: string;
  totalPurchased: number;
  changePercentage?: number;
  date: string;
}

export interface ExpenseSummary {
  expenseSummaryId: string;
  totalExpenses: number;
  date: string;
}

export interface ExpenseByCategorySummary {
  expenseByCategorySummaryId: string;
  category: string;
  amount: string; // Prisma Decimal biasanya dikirim sebagai string
  date: string;
}

export interface DashboardMetrics {
  popularProducts: Product[];
  salesSummary: SalesSummary[];
  purchaseSummary: PurchaseSummary[];
  expenseSummary: ExpenseSummary[];
  expenseByCategorySummary: ExpenseByCategorySummary[];
  totalInformasi: {
    totalKain: number;
    totalStokRoll: { _sum: { Quantity: number } };
    totalJenisKain: number;
  };
  stockByDesain?: { desain: string; count: number }[]; // Menghilangkan 'any'
}

/* --- KONFIGURASI API --- */
export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001",
  }),
  reducerPath: "api",
  tagTypes: ["DashboardMetrics", "Products"], // Label untuk sistem caching
  endpoints: (build) => ({
    getDashboardMetrics: build.query<DashboardMetrics, void>({
      query: () => "/dashboard",
      providesTags: ["DashboardMetrics"],
    }),

    getProducts: build.query<Product[], string | void>({
      query: (search) => ({
        url: "/products",
        params: search ? { search } : {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ productId }) => ({ type: "Products" as const, id: productId })),
              { type: "Products", id: "LIST" },
            ]
          : [{ type: "Products", id: "LIST" }],
    }),

    createProduct: build.mutation<Product, Partial<Product>>({
      query: (newProduct) => ({
        url: "/products",
        method: "POST",
        body: newProduct,
      }),
      // Invalidate Tags memastikan UI mendapatkan data terbaru setelah input barang baru
      invalidatesTags: ["Products", "DashboardMetrics"],
    }),
  }),
});

export const {
  useGetDashboardMetricsQuery,
  useGetProductsQuery,
  useCreateProductMutation,
} = api;