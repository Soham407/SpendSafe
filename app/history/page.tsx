"use client";

import React, { useState, useEffect } from "react";
import { FileText, DollarSign, TrendingUp, Calendar, Loader2, CheckCircle2, Clock, PiggyBank } from "lucide-react";
import { createBrowserClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { formatCurrency } from "@/lib/utils";

export default function HistoryPage() {
  const [incomeEvents, setIncomeEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from('income_events')
        .select(`
          *,
          recommended_moves (*)
        `)
        .eq('user_id', session.user.id)
        .order('detected_at', { ascending: false });

      setIncomeEvents(data || []);
      setLoading(false);
    };
    fetchData();
  }, [supabase, router]);

  const totals = incomeEvents.reduce((acc, event) => {
    acc.totalIncome += Number(event.amount);
    event.recommended_moves?.forEach((move: any) => {
      if (move.bucket_name === 'Tax') acc.totalTax += Number(move.amount_to_move);
      if (move.bucket_name === 'Retirement') acc.totalRetirement += Number(move.amount_to_move);
    });
    return acc;
  }, { totalIncome: 0, totalTax: 0, totalRetirement: 0 });

  // Weekly Snapshot Logic (last 7 days)
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);
  
  const weeklySnapshot = incomeEvents.filter(e => new Date(e.detected_at) > lastWeek);
  const pendingActionTotal = weeklySnapshot
    .filter(e => e.status === 'pending_action')
    .reduce((acc: number, e: any) => acc + Number(e.amount), 0);

  if (loading) {
    return (
      <AppShell>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6 animate-in pb-12">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-gray-900">Income History</h1>
          <p className="text-sm text-gray-400 font-medium">All your tracked income in one place</p>
        </div>

        {/* Weekly Snapshot */}
        <div className="bg-gradient-to-br from-indigo-50 to-white border-2 border-indigo-100 p-6 rounded-[2.5rem] relative overflow-hidden">
          <div className="absolute top-4 right-4 opacity-10">
            <Calendar className="w-20 h-20 text-indigo-600" />
          </div>
          <h2 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4">
            📊 This Week's Snapshot
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm">
              <span className="text-gray-500 font-medium text-sm">• {weeklySnapshot.length} payments tracked</span>
              <span className="font-black text-indigo-600">
                {formatCurrency(weeklySnapshot.reduce((acc: number, e: any) => acc + Number(e.amount), 0))}
              </span>
            </div>
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm">
              <span className="text-gray-500 font-medium text-sm">• Still pending action</span>
              <span className="font-black text-amber-600">{formatCurrency(pendingActionTotal)}</span>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border-2 border-gray-50 p-4 rounded-[1.5rem] text-center shadow-sm">
            <div className="bg-indigo-100 w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2">
              <DollarSign className="w-5 h-5 text-indigo-600" />
            </div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">All-Time</p>
            <p className="text-lg font-black text-gray-900">{formatCurrency(totals.totalIncome)}</p>
          </div>
          <div className="bg-white border-2 border-gray-50 p-4 rounded-[1.5rem] text-center shadow-sm">
            <div className="bg-red-100 w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Tax Goal</p>
            <p className="text-lg font-black text-red-600">{formatCurrency(totals.totalTax)}</p>
          </div>
          <div className="bg-white border-2 border-gray-50 p-4 rounded-[1.5rem] text-center shadow-sm">
            <div className="bg-emerald-100 w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2">
              <PiggyBank className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Retirement</p>
            <p className="text-lg font-black text-emerald-600">{formatCurrency(totals.totalRetirement)}</p>
          </div>
        </div>

        {/* History List */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">
            Transaction Timeline
          </h3>
          {incomeEvents.map((item, index) => {
            const taxMove = item.recommended_moves?.find((m: any) => m.bucket_name === 'Tax');
            const retMove = item.recommended_moves?.find((m: any) => m.bucket_name === 'Retirement');
            const isPending = item.status === 'pending_action';

            return (
              <div
                key={item.id}
                className={`bg-white border-2 p-5 rounded-[2rem] flex items-center justify-between transition-all ${
                  isPending ? 'border-amber-200 shadow-amber-50' : 'border-gray-50 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    isPending ? 'bg-amber-100' : 'bg-emerald-100'
                  }`}>
                    {isPending ? (
                      <Clock className="w-5 h-5 text-amber-600" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-black text-gray-900">{formatCurrency(item.amount)}</p>
                    <p className="text-xs text-gray-400 font-medium">{item.description || 'Income'}</p>
                    <p className="text-[10px] text-gray-300 font-bold">
                      {new Date(item.detected_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-xs font-bold text-red-500">Tax: {formatCurrency(taxMove?.amount_to_move || 0)}</p>
                  <p className="text-xs font-bold text-indigo-500">Ret: {formatCurrency(retMove?.amount_to_move || 0)}</p>
                  {item.status === 'completed' && (
                    <span className="inline-block bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg">
                      ✓ Done
                    </span>
                  )}
                  {isPending && (
                    <span className="inline-block bg-amber-100 text-amber-700 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg">
                      Pending
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          {incomeEvents.length === 0 && (
            <div className="bg-gray-50 border-2 border-dashed border-gray-200 p-12 rounded-[2.5rem] text-center">
              <div className="bg-white w-16 h-16 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Clock className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-400 font-medium">No history found.</p>
              <p className="text-gray-300 text-sm mt-1">Track your first income to see it here!</p>
            </div>
          )}
        </div>

        {/* Export Button */}
        <button 
          onClick={() => {
            alert("CSV Export feature coming soon!");
          }}
          className="w-full py-4 bg-white border-2 border-gray-100 text-gray-500 font-bold rounded-[1.5rem] flex items-center justify-center gap-2 hover:border-indigo-200 hover:text-indigo-600 transition-all"
        >
          <FileText className="w-4 h-4" />
          Export to CSV
        </button>
      </div>
    </AppShell>
  );
}
