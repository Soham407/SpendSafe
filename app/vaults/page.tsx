"use client";

import React, { useState, useEffect } from "react";
import { PiggyBank, TrendingUp, Loader2, CheckCircle2, ArrowRight, Landmark, Shield } from "lucide-react";
import { createBrowserClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { formatCurrency } from "@/lib/utils";

export default function VaultsPage() {
  const [loading, setLoading] = useState(true);
  const [taxSaved, setTaxSaved] = useState(0);
  const [retirementSaved, setRetirementSaved] = useState(0);
  const [taxTarget, setTaxTarget] = useState(0);
  const [retirementTarget, setRetirementTarget] = useState(0);

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

      const { data: events } = await supabase
        .from('income_events')
        .select(`
          *,
          recommended_moves (*)
        `)
        .eq('user_id', session.user.id);

      let taxCompleted = 0;
      let retirementCompleted = 0;
      let taxTotal = 0;
      let retirementTotal = 0;

      events?.forEach((event: any) => {
        event.recommended_moves?.forEach((move: any) => {
          if (move.bucket_name === 'Tax') {
            taxTotal += Number(move.amount_to_move);
            if (move.completed_at) taxCompleted += Number(move.amount_to_move);
          }
          if (move.bucket_name === 'Retirement') {
            retirementTotal += Number(move.amount_to_move);
            if (move.completed_at) retirementCompleted += Number(move.amount_to_move);
          }
        });
      });

      setTaxSaved(taxCompleted);
      setRetirementSaved(retirementCompleted);
      setTaxTarget(taxTotal);
      setRetirementTarget(retirementTotal);
      setLoading(false);
    };
    fetchData();
  }, [supabase, router]);

  if (loading) {
    return (
      <AppShell>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </AppShell>
    );
  }

  const taxPercent = taxTarget > 0 ? (taxSaved / taxTarget) * 100 : 0;
  const retirementPercent = retirementTarget > 0 ? (retirementSaved / retirementTarget) * 100 : 0;

  return (
    <AppShell>
      <div className="space-y-6 animate-in pb-12">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-gray-900">Your Vaults</h1>
          <p className="text-sm text-gray-400 font-medium">Track your savings progress</p>
        </div>

        {/* Tax Vault */}
        <div className="bg-gradient-to-br from-red-500 to-orange-500 p-6 rounded-[2.5rem] text-white shadow-xl shadow-red-100 relative overflow-hidden">
          <div className="absolute top-[-30px] right-[-30px] opacity-10">
            <Landmark size={160} />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-2xl">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Tax Vault</p>
                <h2 className="text-3xl font-black tracking-tight">{formatCurrency(taxSaved)}</h2>
              </div>
            </div>

            <div className="bg-white/10 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-white/70">Target</span>
                <span className="font-mono font-bold">{formatCurrency(taxTarget)}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div 
                  className="bg-white h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(taxPercent, 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-white/50 font-bold text-center pt-1">
                {taxPercent.toFixed(0)}% of goal reached
              </p>
            </div>

            {taxPercent >= 100 && (
              <div className="flex items-center justify-center gap-2 bg-white/20 py-3 rounded-2xl">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-black">Goal Achieved! 🎉</span>
              </div>
            )}
          </div>
        </div>

        {/* Retirement Vault */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-6 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
          <div className="absolute top-[-30px] right-[-30px] opacity-10">
            <PiggyBank size={160} />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-2xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Retirement Vault</p>
                <h2 className="text-3xl font-black tracking-tight">{formatCurrency(retirementSaved)}</h2>
              </div>
            </div>

            <div className="bg-white/10 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-white/70">Target</span>
                <span className="font-mono font-bold">{formatCurrency(retirementTarget)}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div 
                  className="bg-white h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(retirementPercent, 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-white/50 font-bold text-center pt-1">
                {retirementPercent.toFixed(0)}% of goal reached
              </p>
            </div>

            {retirementPercent >= 100 && (
              <div className="flex items-center justify-center gap-2 bg-white/20 py-3 rounded-2xl">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-black">Goal Achieved! 🎉</span>
              </div>
            )}
          </div>
        </div>

        {/* Why Vaults Matter */}
        <div className="bg-gray-50 border-2 border-gray-100 p-6 rounded-[2.5rem]">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
            Why Vaults Matter
          </h3>
          <p className="text-sm text-gray-600 font-medium leading-relaxed">
            As a 1099 freelancer, you're responsible for your own taxes. These vaults represent money 
            you should set aside from each payment to avoid surprises at tax time.
          </p>
          <p className="text-[10px] text-gray-400 mt-4 italic">
            Tip: Open a separate high-yield savings account for each vault.
          </p>
        </div>

        {/* Quick Actions */}
        <button 
          onClick={() => router.push('/')}
          className="w-full py-5 bg-gray-900 text-white font-black rounded-[1.5rem] flex items-center justify-center gap-2 hover:bg-black active:scale-95 transition-all shadow-xl shadow-gray-100"
        >
          Log New Transfers <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </AppShell>
  );
}
