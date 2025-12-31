"use client";

import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp, Calendar } from "lucide-react";
import type { IncomeEvent } from "@/lib/types";

interface TrendChartProps {
  incomeEvents: IncomeEvent[];
  title?: string;
  showLegend?: boolean;
}

interface ChartDataPoint {
  month: string;
  income: number;
  taxSaved: number;
  retirementSaved: number;
  taxTarget: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-xl border border-gray-100">
        <p className="font-black text-gray-900 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-500">{entry.name}:</span>
            <span className="font-bold" style={{ color: entry.color }}>
              ${entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const TrendChart: React.FC<TrendChartProps> = ({
  incomeEvents,
  title = "Income & Savings Trends",
  showLegend = true,
}) => {
  const chartData = useMemo(() => {
    // Group by month
    const monthlyData: Record<string, ChartDataPoint> = {};

    incomeEvents.forEach((event) => {
      const date = new Date(event.detected_at);
      const monthKey = date.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          income: 0,
          taxSaved: 0,
          retirementSaved: 0,
          taxTarget: 0,
        };
      }

      monthlyData[monthKey].income += Number(event.amount);

      event.recommended_moves?.forEach((move) => {
        if (move.bucket_name === "Tax") {
          monthlyData[monthKey].taxTarget += Number(move.amount_to_move);
          if (move.completed_at) {
            monthlyData[monthKey].taxSaved += Number(move.amount_to_move);
          }
        }
        if (move.bucket_name === "Retirement" && move.completed_at) {
          monthlyData[monthKey].retirementSaved += Number(move.amount_to_move);
        }
      });
    });

    // Sort by date and take last 6 months
    const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateA.getTime() - dateB.getTime();
    });

    return sortedMonths.slice(-6).map((key) => monthlyData[key]);
  }, [incomeEvents]);

  if (chartData.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-100 p-8 rounded-[2.5rem] text-center">
        <div className="bg-white w-16 h-16 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Calendar className="w-8 h-8 text-gray-300" />
        </div>
        <p className="text-gray-400 font-medium">
          Not enough data for trends yet
        </p>
        <p className="text-gray-300 text-sm mt-1">
          Track more income to see your progress!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-gray-50 p-6 rounded-[2.5rem] shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-2xl shadow-lg shadow-indigo-100">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-black text-gray-900">{title}</h3>
          <p className="text-xs text-gray-400 font-medium">
            Last 6 months overview
          </p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="taxGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient
                id="retirementGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && (
              <Legend
                wrapperStyle={{ paddingTop: "20px" }}
                formatter={(value) => (
                  <span className="text-xs font-bold text-gray-500">
                    {value}
                  </span>
                )}
              />
            )}
            <Area
              type="monotone"
              dataKey="income"
              name="Income"
              stroke="#6366f1"
              strokeWidth={3}
              fill="url(#incomeGradient)"
              dot={{ fill: "#6366f1", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="taxSaved"
              name="Tax Saved"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#taxGradient)"
              dot={{ fill: "#10b981", strokeWidth: 2, r: 3 }}
            />
            <Area
              type="monotone"
              dataKey="retirementSaved"
              name="Retirement"
              stroke="#f59e0b"
              strokeWidth={2}
              fill="url(#retirementGradient)"
              dot={{ fill: "#f59e0b", strokeWidth: 2, r: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-gray-100">
        <div className="text-center">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
            Avg Monthly
          </p>
          <p className="text-lg font-black text-indigo-600">
            $
            {Math.round(
              chartData.reduce((a, b) => a + b.income, 0) / chartData.length
            ).toLocaleString()}
          </p>
        </div>
        <div className="text-center">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
            Tax Saved
          </p>
          <p className="text-lg font-black text-emerald-600">
            ${chartData.reduce((a, b) => a + b.taxSaved, 0).toLocaleString()}
          </p>
        </div>
        <div className="text-center">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
            Retirement
          </p>
          <p className="text-lg font-black text-amber-600">
            $
            {chartData
              .reduce((a, b) => a + b.retirementSaved, 0)
              .toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};
