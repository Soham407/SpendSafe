"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PiggyBank, TrendingUp, Loader2, CheckCircle2, ArrowRight, Landmark, Shield, AlertCircle, ExternalLink } from "lucide-react";
import { createBrowserClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { formatCurrency } from "@/lib/utils";
import confetti from "canvas-confetti";

export default function VaultsPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [taxSaved, setTaxSaved] = useState(0);
  const [retirementSaved, setRetirementSaved] = useState(0);
  const [taxTarget, setTaxTarget] = useState(0);
  const [retirementTarget, setRetirementTarget] = useState(0);
  const [bankBalance, setBankBalance] = useState(0);
  const [pendingMoves, setPendingMoves] = useState<any[]>([]);
  const [confirmingMoveId, setConfirmingMoveId] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const router = useRouter();

  const fetchData = useCallback(async (userId: string) => {
    // 1. Fetch bank balance
    try {
      const balanceRes = await fetch(`/api/plaid/balance?user_id=${userId}`);
      const balanceData = await balanceRes.json();
      if (balanceData.total_balance !== undefined) {
        setBankBalance(balanceData.total_balance);
      }
    } catch (err) {
      console.error('Failed to fetch balance:', err);
    }

    // 2. Fetch income events and moves
    const { data: events } = await supabase
      .from('income_events')
      .select(`
        *,
        recommended_moves (*)
      `)
      .eq('user_id', userId);

    let taxCompleted = 0;
    let retirementCompleted = 0;
    let taxTotal = 0;
    let retirementTotal = 0;
    const pending: any[] = [];

    events?.forEach((event: any) => {
      event.recommended_moves?.forEach((move: any) => {
        if (move.bucket_name === 'Tax') {
          taxTotal += Number(move.amount_to_move);
          if (move.completed_at) {
            taxCompleted += Number(move.amount_to_move);
          } else {
            pending.push({ ...move, source: event.description, date: event.detected_at });
          }
        }
        if (move.bucket_name === 'Retirement') {
          retirementTotal += Number(move.amount_to_move);
          if (move.completed_at) {
            retirementCompleted += Number(move.amount_to_move);
          } else {
            pending.push({ ...move, source: event.description, date: event.detected_at });
          }
        }
      });
    });

    setTaxSaved(taxCompleted);
    setRetirementSaved(retirementCompleted);
    setTaxTarget(taxTotal);
    setRetirementTarget(retirementTotal);
    setPendingMoves(pending.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setUser(session.user);
        fetchData(session.user.id);
      }
    };
    checkUser();
  }, [supabase, router, fetchData]);

  const handleMoveIt = async (moveId: string) => {
    setConfirmingMoveId(moveId);
    try {
      const res = await fetch(`/api/moves/${moveId}`, {
        method: 'PUT',
        body: JSON.stringify({ completion_method: 'manual_transfer', confirmed: true }),
      });

      if (res.ok) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });
        await fetchData(user.id);
      }
    } catch (err) {
      console.error('Error confirming move:', err);
    } finally {
      setConfirmingMoveId(null);
    }
  };

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
  const totalLiabilities = (taxTarget - taxSaved) + (retirementTarget - retirementSaved);
  const safeToSpend = bankBalance - totalLiabilities;

  return (
    <AppShell>
      <div className="space-y-6 animate-in pb-12">
        {/* Header */}
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-gray-900">Your Vaults</h1>
            <p className="text-sm text-gray-400 font-medium">Safe to Spend: <span className="text-emerald-600 font-bold">{formatCurrency(safeToSpend)}</span></p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bank Balance</p>
            <p className="text-lg font-black text-gray-900">{formatCurrency(bankBalance)}</p>
          </div>
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
          </div>
        </div>

        {/* Pending Actions */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-black text-gray-800 text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              Pending Movements
            </h3>
            {pendingMoves.length > 0 && (
              <span className="text-[10px] font-black text-amber-600 bg-amber-100 px-2 py-1 rounded-md">
                {pendingMoves.length} Actions
              </span>
            )}
          </div>

          <div className="space-y-3">
            {pendingMoves.map((move) => (
              <div key={move.id} className="bg-white border-2 border-gray-50 p-4 rounded-3xl flex items-center justify-between group hover:border-indigo-100 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${move.bucket_name === 'Tax' ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'}`}>
                    {move.bucket_name === 'Tax' ? <Shield className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{move.bucket_name} Move</p>
                    <p className="font-black text-gray-900">{formatCurrency(move.amount_to_move)}</p>
                    <p className="text-[11px] text-gray-400 font-medium">From {move.source}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleMoveIt(move.id)}
                  disabled={confirmingMoveId === move.id}
                  className="bg-gray-900 text-white px-4 py-3 rounded-2xl text-xs font-black flex items-center gap-2 hover:bg-indigo-600 active:scale-95 transition-all disabled:opacity-50"
                >
                  {confirmingMoveId === move.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>Move it <ArrowRight className="w-3.5 h-3.5" /></>
                  )}
                </button>
              </div>
            ))}

            {pendingMoves.length === 0 && (
              <div className="bg-emerald-50 border-2 border-dashed border-emerald-100 p-8 rounded-3xl text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-emerald-700 font-bold text-sm">All caught up!</p>
                <p className="text-emerald-600/60 text-xs font-medium">Your vaults are fully funded based on your income.</p>
              </div>
            )}
          </div>
        </section>

        {/* Why Vaults Matter */}
        <div className="bg-gray-50 border-2 border-gray-100 p-6 rounded-[2.5rem]">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
            The Automator
          </h3>
          <p className="text-sm text-gray-600 font-medium leading-relaxed">
            Every time client income lands, we calculate exactly what's yours to keep and what belongs to your future self. 
            Confirming a move marks it as "safe-locked" in your vaults.
          </p>
          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
            <span className="text-[10px] text-gray-400 font-black uppercase">Stripe Treasury integration</span>
            <span className="text-[10px] font-bold text-indigo-400">Coming Soon</span>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
