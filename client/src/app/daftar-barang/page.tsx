"use client";

import { useGetProductsQuery } from "@/state/api";
import Header from "@/app/(components)/Header";
import { Search, Box, Ruler, MapPin, Loader2 } from "lucide-react";
import { useState } from "react";

const DaftarBarang = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const {
    data: products,
    isLoading,
    isError,
  } = useGetProductsQuery(searchTerm);

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-2" />
        <p className="text-gray-500 italic">Memuat katalog kain...</p>
      </div>
    );

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-20 m-6 bg-red-50 rounded-3xl border border-red-100">
        <div className="bg-red-100 p-4 rounded-full mb-4">
          <Search className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-red-800 mb-2">Koneksi Gagal</h2>
        <p className="text-red-600 text-center max-w-md">
          Aplikasi tidak dapat terhubung ke server. Silakan periksa apakah:
        </p>
        <ul className="text-sm text-red-500 mt-4 list-disc text-left space-y-1">
          <li>Server Backend (Express) sudah dijalankan.</li>
          <li>
            File <code className="bg-red-200 px-1 rounded">.env</code> memiliki
            URL yang benar.
          </li>
          <li>Koneksi internet atau database Anda aktif.</li>
        </ul>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto pb-10 w-full px-6">
      {/* SEARCH BAR SECTION */}
      <div className="mb-8 mt-4">
        <div className="flex items-center border-2 border-gray-200 rounded-2xl bg-white px-4 py-3 w-full max-w-md shadow-sm focus-within:border-indigo-500 focus-within:shadow-md transition-all">
          <Search className="w-5 h-5 text-gray-400 mr-3" />
          <input
            className="w-full outline-none bg-transparent text-gray-700 font-medium"
            placeholder="Cari nama, jenis kain, atau warna..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Header name="Katalog Visual Kain" />

      {/* GRID LAYOUT */}
      {products?.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl mt-8">
          <Box className="mx-auto w-16 h-16 text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg font-medium">
            Kain tidak ditemukan
          </p>
          <p className="text-gray-400 text-sm">
            Coba kata kunci lain atau periksa stok.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-8">
          {products?.map((product) => (
            <div
              key={product.productId}
              className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
            >
              {/* IMAGE SECTION */}
              <div className="relative h-56 w-full bg-gray-100 overflow-hidden">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://placehold.co/400x400?text=Gambar+Kain";
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-300 bg-gray-50">
                    <Box size={40} className="mb-2" />
                    <span className="text-[10px] uppercase font-bold tracking-widest">
                      No Preview
                    </span>
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md px-3 py-1 rounded-xl text-[10px] font-black text-indigo-700 shadow-sm uppercase">
                  {product.jenisKain}
                </div>
              </div>

              {/* INFO SECTION */}
              <div className="p-6 flex-grow">
                <div className="mb-4">
                  <h3 className="text-lg font-extrabold text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-sm font-medium text-indigo-400 mt-1">
                    {product.warna}
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-50">
                  <div className="flex items-center text-xs font-semibold text-gray-500 gap-3">
                    <div className="p-1.5 bg-indigo-50 rounded-lg">
                      <Ruler size={14} className="text-indigo-600" />
                    </div>
                    <span>
                      Lebar:{" "}
                      <b className="text-gray-800">{product.width || 0} cm</b>
                    </span>
                  </div>
                  <div className="flex items-center text-xs font-semibold text-gray-500 gap-3">
                    <div className="p-1.5 bg-green-50 rounded-lg">
                      <MapPin size={14} className="text-green-600" />
                    </div>
                    <span>
                      Lokasi:{" "}
                      <b className="text-gray-800">
                        {product.location || "N/A"}
                      </b>
                    </span>
                  </div>
                </div>
              </div>

              {/* STOCK FOOTER */}
              <div className="px-6 py-4 bg-gray-50 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-tighter font-bold text-gray-400">
                    Status Stok
                  </span>
                  <span className="text-xs font-bold text-gray-700">
                    Gudang Utama
                  </span>
                </div>
                <div
                  className={`px-4 py-1.5 rounded-xl text-sm font-black shadow-sm ${
                    product.Quantity < 10
                      ? "bg-red-100 text-red-600"
                      : "bg-indigo-600 text-white"
                  }`}
                >
                  {product.Quantity} Roll
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DaftarBarang;
