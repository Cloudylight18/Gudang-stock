"use client";

import { useGetDashboardMetricsQuery } from "@/state/api";
import { Package } from "lucide-react"; // Ganti ke Package untuk kesan gudang
import React from "react";

const CardPopularProducts = () => {
  const { data: dashboardMetrics, isLoading } = useGetDashboardMetricsQuery();

  return (
    <div className="row-span-3 xl:row-span-6 bg-white shadow-md rounded-2xl pb-16">
      {isLoading ? (
        <div className="m-5 text-gray-500">Memuat data stok kain...</div>
      ) : (
        <>
          <h3 className="text-lg font-semibold px-7 pt-5 pb-2">
            Produk Stok Terbanyak
          </h3>
          <hr />
          <div className="overflow-auto h-full">
            {dashboardMetrics?.popularProducts.map((product) => (
              <div
                key={product.productId}
                className="flex items-center justify-between gap-3 px-5 py-7 border-b hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Package className="text-blue-600 w-5 h-5" />
                  </div>

                  <div className="flex flex-col">
                    <span className="font-bold text-gray-700">
                      {product.name}
                    </span>
                    <div className="flex text-xs text-gray-500 gap-2 mt-1">
                      <span className="bg-gray-100 px-2 py-0.5 rounded">
                        {product.jenisKain}
                      </span>
                      <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-medium">
                        {product.warna}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-xs flex items-center">
                  <span className="font-bold text-sm text-gray-800">
                    {product.Quantity}{" "}
                    <span className="text-gray-400 font-normal ml-1">Roll</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CardPopularProducts;
