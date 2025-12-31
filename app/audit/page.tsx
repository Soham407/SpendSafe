"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  ArrowLeft,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  FileText,
  Download,
  Loader2,
} from "lucide-react";
import { createBrowserClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { TrendChart } from "@/components/TrendChart";
import { formatCurrency } from "@/lib/utils";
import Papa from "papaparse";

export default function AuditPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [incomeEvents, setIncomeEvents] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const router = useRouter();

  const fetchData = useCallback(
    async (userId: string, year: number) => {
      setLoading(true);

      // Fetch summary
      const res = await fetch(`/api/summary?user_id=${userId}&year=${year}`);
      const summaryData = await res.json();
      setSummary(summaryData);

      // Fetch income events for the year
      const startOfYear = `${year}-01-01`;
      const endOfYear = `${year}-12-31`;
      const { data: events } = await supabase
        .from("income_events")
        .select("*, recommended_moves(*)")
        .eq("user_id", userId)
        .gte("detected_at", startOfYear)
        .lte("detected_at", endOfYear)
        .order("detected_at", { ascending: false });

      setIncomeEvents(events || []);
      setLoading(false);
    },
    [supabase]
  );

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setUser(session.user);
        fetchData(session.user.id, selectedYear);
      }
    };
    checkUser();
  }, [supabase, router, fetchData, selectedYear]);

  const handleExport = () => {
    const csvData = incomeEvents.map((event) => {
      const tax =
        event.recommended_moves?.find((m: any) => m.bucket_name === "Tax")
          ?.amount_to_move || 0;
      const retirement =
        event.recommended_moves?.find(
          (m: any) => m.bucket_name === "Retirement"
        )?.amount_to_move || 0;
      return {
        Date: new Date(event.detected_at).toLocaleDateString(),
        Source: event.description || "Income",
        Amount: event.amount,
        "Tax Savings": tax,
        "Retirement Savings": retirement,
        Status: event.status,
      };
    });
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `spendsafe_audit_${selectedYear}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && !summary) {
    return (
      <AppShell>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </AppShell>
    );
  }

  const taxGap =
    (summary?.total_tax_should_save || 0) -
    (summary?.total_tax_actually_saved || 0);
  const healthScore =
    summary?.total_tax_should_save > 0
      ? Math.round(
          (summary.total_tax_actually_saved / summary.total_tax_should_save) *
            100
        )
      : 100;

  return (
    <AppShell>
      <div className="space-y-6 animate-in pb-12">
        {/* Header */}
        <div className="flex items-center justify-between px-1">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent font-black text-sm outline-none cursor-pointer"
            >
              {[2024, 2025].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-black text-gray-900">Audit Readiness</h1>
          <p className="text-sm text-gray-400 font-medium">
            Verify your tax safety for the {selectedYear} fiscal year.
          </p>
        </div>

        {/* Health Score Hero */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-950 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
          <ShieldCheck className="absolute top-[-20px] right-[-20px] w-48 h-48 opacity-10" />
          <div className="relative z-10 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">
                  Safety Score
                </p>
                <h2 className="text-6xl font-black mt-2">{healthScore}%</h2>
              </div>
              <div
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  healthScore === 100
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-amber-500/20 text-amber-400"
                }`}
              >
                {healthScore === 100 ? "Fully Shielded" : "Action Required"}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                <p className="text-[9px] font-black uppercase tracking-widest text-indigo-300">
                  Total Income
                </p>
                <p className="text-xl font-bold">
                  {formatCurrency(summary?.total_income || 0)}
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                <p className="text-[9px] font-black uppercase tracking-widest text-indigo-300">
                  Tax Gap
                </p>
                <p className="text-xl font-bold text-red-300">
                  {formatCurrency(taxGap)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Warning if Gap Exists */}
        {taxGap > 0 && (
          <div className="bg-amber-50 border-2 border-amber-100 p-6 rounded-[2.5rem] flex gap-4">
            <div className="bg-amber-100 p-3 rounded-2xl h-fit">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="space-y-1">
              <h3 className="font-black text-amber-900 text-sm">
                Action Needed: ${taxGap.toLocaleString()} Short
              </h3>
              <p className="text-xs text-amber-700 leading-relaxed">
                You currently have a tax savings gap. We recommend moving this
                amount to your tax vault to be fully prepared for the next
                quarterly deadline.
              </p>
            </div>
          </div>
        )}

        {/* Trend Chart */}
        <TrendChart
          incomeEvents={incomeEvents}
          title="Income vs. Savings Trend"
          showLegend={true}
        />

        {/* Detailed Breakdown Table */}
        <div className="bg-white border-2 border-gray-50 p-6 rounded-[2.5rem] shadow-sm">
          <h3 className="font-black text-gray-900 mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Tax Move Accuracy
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between text-xs font-black text-gray-400 uppercase tracking-widest px-2">
              <span>Metric</span>
              <span>Amount</span>
            </div>
            <div className="space-y-2">
              {[
                {
                  label: "Recommended Savings",
                  value: summary?.total_tax_should_save,
                  color: "text-gray-900",
                },
                {
                  label: "Actually Confirmed",
                  value: summary?.total_tax_actually_saved,
                  color: "text-emerald-600",
                },
                {
                  label: "Current Shortfall",
                  value: taxGap,
                  color: "text-red-600",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-indigo-100 transition-all"
                >
                  <span className="text-sm font-bold text-gray-600">
                    {item.label}
                  </span>
                  <span className={`text-sm font-black ${item.color}`}>
                    {formatCurrency(item.value || 0)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Export for Accountant */}
        <div className="bg-white border-2 border-indigo-100 p-8 rounded-[2.5rem] text-center space-y-4 border-dashed">
          <div className="bg-indigo-50 w-16 h-16 rounded-[1.5rem] flex items-center justify-center mx-auto mb-2 text-indigo-600">
            <Download className="w-8 h-8" />
          </div>
          <h3 className="font-black text-black">CPA Export Pack</h3>
          <p className="text-xs text-gray-500 leading-relaxed px-4">
            Download a detailed CSV of all income events and tax movements to
            send directly to your accountant.
          </p>
          <button
            onClick={handleExport}
            className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-100"
          >
            Download CSV Report
          </button>
        </div>
      </div>
    </AppShell>
  );
}
