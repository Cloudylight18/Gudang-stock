"use client";

import { useGetDashboardMetricsQuery } from "@/state/api";
import { TrendingUp } from "lucide-react";
import React, { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CardSalesSummary = () => {
  const { data, isLoading, isError } = useGetDashboardMetricsQuery();
  const salesData = data?.salesSummary || [];

  const [timeframe, setTimeframe] = useState("weekly");

  // Logika Perhitungan
  const totalValueSum =
    salesData.reduce((acc, curr) => acc + curr.totalValue, 0) || 0;

  const averageChangePercentage =
    salesData.reduce((acc, curr, _, array) => {
      return acc + (curr.changePercentage || 0) / (array.length || 1);
    }, 0) || 0;

  const highestValueData = salesData.reduce((acc, curr) => {
    return acc.totalValue > curr.totalValue ? acc : curr;
  }, salesData[0] || {});

  const highestValueDate = highestValueData.date
    ? new Date(highestValueData.date).toLocaleDateString("id-ID", {
        month: "numeric",
        day: "numeric",
        year: "2-digit",
      })
    : "N/A";

  if (isError) {
    return (
      <div className="m-5 text-red-500">Gagal mengambil data penjualan.</div>
    );
  }

  return (
    <div className="row-span-3 xl:row-span-6 bg-white shadow-md rounded-2xl flex flex-col justify-between">
      {isLoading ? (
        <div className="m-5 animate-pulse text-gray-500">Memuat data...</div>
      ) : (
        <>
          {/* HEADER */}
          <div>
            <h2 className="text-lg font-semibold mb-2 px-7 pt-5 text-gray-800">
              Ringkasan Penjualan
            </h2>
            <hr />
          </div>

          {/* BODY */}
          <div>
            <div className="flex justify-between items-center mb-6 px-7 mt-5">
              <div className="text-lg font-medium">
                <p className="text-xs text-gray-400">Total Nilai</p>
                <span className="text-2xl font-extrabold text-gray-800">
                  Rp
                  {(totalValueSum / 1000000).toLocaleString("id-ID", {
                    maximumFractionDigits: 2,
                  })}
                  jt
                </span>
                <span className="text-green-500 text-sm ml-2 font-bold">
                  <TrendingUp className="inline w-4 h-4 mr-1" />
                  {averageChangePercentage.toFixed(2)}%
                </span>
              </div>
              <select
                className="shadow-sm border border-gray-300 bg-white p-2 rounded-md text-sm outline-none"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
              >
                <option value="daily">Harian</option>
                <option value="weekly">Mingguan</option>
                <option value="monthly">Bulanan</option>
              </select>
            </div>

            {/* CHART */}
            <div className="px-7">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={salesData}
                  margin={{ top: 0, right: 0, left: -25, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getDate()}/${date.getMonth() + 1}`;
                    }}
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tickFormatter={(value) =>
                      `Rp${(value / 1000000).toFixed(0)}j`
                    }
                    tick={{ fontSize: 12, dx: -1 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(value: number) => [
                      `Rp ${value.toLocaleString("id-ID")}`,
                      "Penjualan",
                    ]}
                    labelFormatter={(label) => {
                      const date = new Date(label);
                      return date.toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      });
                    }}
                  />
                  <Bar
                    dataKey="totalValue"
                    fill="#3182ce"
                    barSize={10}
                    radius={[10, 10, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* FOOTER */}
          <div>
            <hr />
            <div className="flex justify-between items-center mt-6 text-sm px-7 mb-4 text-gray-500">
              <p>{salesData.length || 0} hari tercatat</p>
              <p className="text-sm">
                Penjualan Tertinggi:{" "}
                <span className="font-bold text-gray-800">
                  {highestValueDate}
                </span>
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CardSalesSummary;
