"use client";

import { useGetDashboardMetricsQuery } from "@/state/api";
import { TrendingUp } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

// Definisikan ulang di sini jika impor dari api.ts bermasalah sementara
interface ExpenseByCategory {
  expenseByCategorySummaryId: string;
  category: string;
  amount: string;
  date: string;
}

interface ExpenseCategoryData {
  name: string;
  value: number;
}

type ExpenseSums = {
  [category: string]: number;
};

const colors = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

const CardExpenseSummary = () => {
  const { data: dashboardMetrics, isLoading } = useGetDashboardMetricsQuery();

  // Casting data ke interface lokal agar tidak error
  const expenseByCategorySummary = (dashboardMetrics?.expenseByCategorySummary as ExpenseByCategory[]) || [];
  
  const expenseSums = expenseByCategorySummary.reduce(
    (acc: ExpenseSums, item: ExpenseByCategory) => {
      const category = item.category; 
      const amount = parseInt(item.amount, 10);
      if (!acc[category]) acc[category] = 0;
      acc[category] += amount;
      return acc;
    },
    {}
  );

  const expenseCategories: ExpenseCategoryData[] = Object.entries(expenseSums).map(
    ([name, value]) => ({
      name,
      value: value as number,
    })
  );

  const totalExpenses = expenseCategories.reduce(
    (acc: number, category: ExpenseCategoryData) => acc + category.value,
    0
  );

  return (
    <div className="row-span-3 bg-white shadow-md rounded-2xl flex flex-col justify-between overflow-hidden text-gray-800">
      {isLoading ? (
        <div className="flex items-center justify-center h-full p-10">
          <p className="text-sm animate-pulse text-indigo-500">Sinkronisasi data pengeluaran...</p>
        </div>
      ) : (
        <>
          <div>
            <h2 className="text-lg font-semibold mb-2 px-7 pt-5">
              Ringkasan Pengeluaran
            </h2>
            <hr />
          </div>

          <div className="xl:flex justify-between pr-7 items-center">
            <div className="relative basis-3/5">
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie
                    data={expenseCategories}
                    innerRadius={50}
                    outerRadius={65}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                  >
                    {expenseCategories.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={colors[index % colors.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <p className="text-[10px] text-gray-400 font-bold uppercase">Total</p>
                <span className="font-bold text-sm">
                  Rp{Math.round(totalExpenses / 1000).toLocaleString("id-ID")}rb
                </span>
              </div>
            </div>

            <ul className="flex flex-col justify-center py-5 gap-2 basis-2/5">
              {expenseCategories.map((entry, index) => (
                <li key={index} className="flex items-center text-[11px]">
                  <span
                    className="mr-2 w-2 h-2 rounded-full"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  ></span>
                  <span className="truncate">{entry.name}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-between items-center px-8">
            <span className="text-[10px] text-gray-500 italic">Update Terakhir: Hari ini</span>
            <div className="flex items-center text-green-600 text-xs font-bold">
              <TrendingUp size={14} className="mr-1"/>
              <span>Stabil</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CardExpenseSummary;