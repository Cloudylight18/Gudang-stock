import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// --- 1. DEFINISI INTERFACE ---

export interface Layout {
  layoutId: string;
  type: string;
  baris: string;
  kolom: string;
  totalKain?: number;
  totalMeter?: number;
  totalYard?: number;
}

export interface Product {
  productId: string;
  name: string;
  stockQuantity: number;
  unit: string;
  location: string;
  color?: string;
  design?: string;
  category: string;
  width?: string;
  quality?: string;
  kombinasi?: string;
  imageUrl?: string;
  createdAt: string;
  layout?: Layout;
  coordinateX?: number;
  coordinateY?: number;
  stockMeter?: number;
  stockYard?: number;
  // --- TAMBAHAN UNTUK SINRONISASI AI ---
  description?: string;   // Deskripsi hasil generate Gemini
  imageVector?: string;   // Koordinat matematika dari Xenova
}

export interface SmartSearchResult {
  productId: string;
  name: string;
  stock: number;
  unit: string;
  color: string;
  imageUrl: string;
  quality: string;
  locationName: string;
  description?: string; // Deskripsi AI juga muncul di hasil cari
  mapPosition: {
    x: number | null;
    y: number | null;
  };
  score?: number; // Skor kemiripan visual
  isStockEnough: boolean;
}

export interface StockLog {
  id: string;
  productId: string;
  jumlah: number;
  tanggal: string;
  type: "IN" | "OUT";
  label: string;
  product: {
    name: string;
    unit: string;
  };
}

export interface ShippingPayload {
  items: { sku: string; yard: number }[];
  destination: string;
}

export interface StockUpdatePayload {
  productId: string;
  amountOut: number;
  destination: string;
}

export interface DashboardMetrics {
  popularProducts: Product[];
  salesSummary: any[];
  purchaseSummary: any[];
  expenseSummary: any[];
  expenseByCategorySummary: any[];
}

export interface User { userId: string; name: string; email: string; }

// --- 2. API DEFINITION ---

export const api = createApi({
  baseQuery: fetchBaseQuery({ 
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  }),
  reducerPath: "api",
  tagTypes: ["DashboardMetrics", "Products", "Users", "Expenses", "StockLogs", "Layouts", "AISearch"],
  endpoints: (build) => ({
    
    getDashboardMetrics: build.query<DashboardMetrics, void>({
      query: () => "/dashboard",
      providesTags: ["DashboardMetrics"],
    }),

    getLayouts: build.query<Layout[], void>({
      query: () => "/layouts",
      providesTags: ["Layouts"],
    }),

    getLayoutDetail: build.query<Layout, string>({
      query: (id) => `/layouts/${id}`,
      providesTags: (result, error, id) => [{ type: "Layouts", id }],
    }),

    createLayout: build.mutation<Layout, Partial<Layout>>({
      query: (newLayout) => ({
        url: "/layouts",
        method: "POST",
        body: newLayout,
      }),
      invalidatesTags: ["Layouts", "DashboardMetrics"],
    }),

    deleteLayout: build.mutation<{ success: boolean; id: string }, string>({
      query: (id) => ({
        url: `/layouts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Layouts", "DashboardMetrics"],
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

    // --- ENDPOINT BARU: PENCARIAN AI (IMAGE/VOICE) ---
    searchSmartAI: build.mutation<SmartSearchResult[], FormData>({
      query: (formData) => ({
        url: "/products/search-ai",
        method: "POST",
        body: formData, // Mengirim Gambar atau Audio
      }),
      invalidatesTags: ["AISearch"],
    }),

    getProductByBarcode: build.query<Product, string>({
      query: (barcode) => `/products/scan/${barcode}`,
      providesTags: (result, error, barcode) => [{ type: "Products", id: barcode }],
    }),

    createProduct: build.mutation<Product, FormData>({
      query: (newProductData) => ({
        url: "/products",
        method: "POST",
        body: newProductData,
      }),
      invalidatesTags: ["Products", "DashboardMetrics", "StockLogs", "Layouts"],
    }),

    updateProduct: build.mutation<Product, { productId: string; formData: FormData }>({
      query: ({ productId, formData }) => ({
        url: `/products/${productId}`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: "Products", id: productId },
        { type: "Products", id: "LIST" },
        "DashboardMetrics",
        "Layouts",
        "StockLogs"
      ],
    }),

    deleteProduct: build.mutation<{ success: boolean; productId: string }, string>({
      query: (productId) => ({
        url: `/products/${productId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Products", "DashboardMetrics", "StockLogs", "Layouts"],
    }),

    getStockLogs: build.query<StockLog[], void>({
      query: () => "/products/stock-logs",
      providesTags: ["StockLogs"],
    }),

    createShipping: build.mutation<any, ShippingPayload>({
      query: (shippingData) => ({
        url: "/products/shipping",
        method: "POST",
        body: shippingData,
      }),
      invalidatesTags: ["Products", "StockLogs", "DashboardMetrics", "Layouts"],
    }),

    updateProductStock: build.mutation<Product, StockUpdatePayload>({
      query: ({ productId, amountOut, destination }) => ({
        url: `/products/${productId}/stock`,
        method: "PATCH",
        body: { amountOut, destination },
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: "Products", id: productId },
        { type: "Products", id: "LIST" },
        "DashboardMetrics",
        "Layouts",
        "StockLogs",
      ],
    }),

    getExpensesByCategory: build.query<any[], void>({
      query: () => "/expenses",
      providesTags: ["Expenses"],
    }),
  }),
});

export const {
  useGetDashboardMetricsQuery,
  useGetProductsQuery,
  useSearchSmartAIMutation, // Export hook baru untuk AI
  useGetProductByBarcodeQuery,
  useLazyGetProductByBarcodeQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetLayoutsQuery,
  useGetLayoutDetailQuery,
  useCreateLayoutMutation,
  useDeleteLayoutMutation,
  useGetStockLogsQuery,
  useCreateShippingMutation,
  useUpdateProductStockMutation,
  useGetExpensesByCategoryQuery,
} = api;