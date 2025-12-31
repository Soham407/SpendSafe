"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Check, Loader2, ArrowRight, ShieldAlert, CheckCircle2 } from "lucide-react";
import { createBrowserClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { AppShell } from "@/components/AppShell";
import { SafeToSpend } from "@/components/SafeToSpend";
import { PanicButton } from "@/components/PanicButton";
import { IncomeCard } from "@/components/IncomeCard";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { PlaidLink } from "@/components/PlaidLink";
import { IncomeConfirmation } from "@/components/IncomeConfirmation";
import { AiCopilot } from "@/components/AiCopilot";
import { VoiceCopilot } from "@/components/VoiceCopilot";
import { ShameReport } from "@/components/ShameReport";
import { Feedback } from "@/components/Feedback";
import { calculateSafetyMoves } from "@/lib/calculations";
import { formatCurrency } from "@/lib/utils";
import { Mic } from "lucide-react";

export default function Dashboard() {
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [incomeEvents, setIncomeEvents] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [bankBalance, setBankBalance] = useState<number>(0);
  const [pendingConfirmations, setPendingConfirmations] = useState<any[]>([]);
  const [showPlaidLink, setShowPlaidLink] = useState(false);
  const [showMathDetail, setShowMathDetail] = useState(false);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMove, setActiveMove] = useState<any>(null);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isShameReportOpen, setIsShameReportOpen] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const router = useRouter();

  const fetchData = useCallback(async (userId: string) => {
    // Fetch profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    setProfile(profileData);

    // Fetch income events and moves
    const { data: events } = await supabase
      .from('income_events')
      .select(`
        *,
        recommended_moves (*)
      `)
      .eq('user_id', userId)
      .order('detected_at', { ascending: false });
    
    // Separate pending confirmations from confirmed events
    const pending = events?.filter((e: any) => e.status === 'pending_confirmation') || [];
    const confirmed = events?.filter((e: any) => e.status !== 'pending_confirmation') || [];
    
    setPendingConfirmations(pending);
    setIncomeEvents(confirmed);

    // Fetch summary (Panic Button)
    const res = await fetch(`/api/summary?user_id=${userId}`);
    const summaryData = await res.json();
    setSummary(summaryData);

    // Fetch real bank balance
    try {
      const balanceRes = await fetch(`/api/plaid/balance?user_id=${userId}`);
      const balanceData = await balanceRes.json();
      if (balanceData.total_balance !== undefined) {
        setBankBalance(balanceData.total_balance);
      }
    } catch (err) {
      console.error('Failed to fetch balance:', err);
    }

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

  const handleManualEntry = async () => {
    if (!amount) return;
    setLoading(true);

    const res = await fetch('/api/income', {
      method: 'POST',
      body: JSON.stringify({
        user_id: user.id,
        amount: parseFloat(amount),
        description: source,
        tax_rate: profile?.tax_rate_percentage * 100 || 30,
        retirement_rate: profile?.retirement_rate_percentage * 100 || 10,
      }),
    });

    if (res.ok) {
      setAmount("");
      setSource("");
      await fetchData(user.id);
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#4f46e5', '#10b981', '#f59e0b', '#ffffff']
      });
    }
    setLoading(false);
  };

  const onConfirmMove = async (moveId: string) => {
    const res = await fetch(`/api/moves/${moveId}`, {
      method: 'PUT',
      body: JSON.stringify({ completion_method: 'confirmed' }),
    });

    if (res.ok) {
      setIsModalOpen(false);
      await fetchData(user.id);
      confetti({
        particleCount: 200,
        spread: 160,
        origin: { y: 0.6 },
        colors: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#ffffff']
      });
      // Show feedback modal after success
      setTimeout(() => setShowFeedbackModal(true), 1500);
    }
  };

  const openConfirmation = (move: any) => {
    setActiveMove(move);
    setIsModalOpen(true);
  };

  const handleIncomeConfirm = async (incomeEventId: string) => {
    const res = await fetch('/api/income/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        income_event_id: incomeEventId,
        user_id: user.id,
        confirmed: true,
      }),
    });

    if (res.ok) {
      await fetchData(user.id);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#6366f1', '#f59e0b']
      });
    }
  };

  const handleIncomeReject = async (incomeEventId: string) => {
    await fetch('/api/income/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        income_event_id: incomeEventId,
        user_id: user.id,
        confirmed: false,
      }),
    });
    await fetchData(user.id);
  };

  const handlePlaidSuccess = async () => {
    setShowPlaidLink(false);
    await fetchData(user.id);
  };

  // Calculate Hero Metrics
  const pendingTax = incomeEvents.reduce((acc: number, event: any) => {
    return acc + (event.recommended_moves?.filter((m: any) => m.bucket_name === 'Tax' && !m.completed_at)
      .reduce((sum: number, m: any) => sum + Number(m.amount_to_move), 0) || 0);
  }, 0);

  const pendingRetirement = incomeEvents.reduce((acc: number, event: any) => {
    return acc + (event.recommended_moves?.filter((m: any) => m.bucket_name === 'Retirement' && !m.completed_at)
      .reduce((sum: number, m: any) => sum + Number(m.amount_to_move), 0) || 0);
  }, 0);

  const safeToSpend = bankBalance - pendingTax - pendingRetirement - (profile?.minimum_buffer || 1000);
  const pendingCount = incomeEvents.filter((e: any) => e.status === 'pending_action').length;

  useEffect(() => {
    if (pendingTax > 2000) {
      const timer = setTimeout(() => setIsShameReportOpen(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [pendingTax]);

  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <AppShell pendingCount={pendingCount}>
      <div className="space-y-6 animate-in pb-12">
        <div className="relative">
          <SafeToSpend 
            amount={safeToSpend}
            bankBalance={bankBalance}
            totalLiabilities={pendingTax + pendingRetirement}
            minimumBuffer={profile?.minimum_buffer || 1000}
            showMathDetail={showMathDetail}
            onToggleMath={() => setShowMathDetail(!showMathDetail)}
          />
          <button 
            onClick={() => setIsVoiceOpen(true)}
            className="absolute top-6 right-6 bg-white/10 p-3 rounded-2xl hover:bg-white/20 transition-all active:scale-90 text-white"
          >
            <Mic className="w-5 h-5" />
          </button>
        </div>

        {/* AI Copilot Insights */}
        <AiCopilot 
          safeToSpend={safeToSpend} 
          taxLiabilities={pendingTax} 
          savingsTotal={bankBalance - safeToSpend} 
        />

        {/* Panic Button Section */}
        {summary && (
          <PanicButton 
            totalIncome={summary.total_income}
            shouldHaveSaved={summary.total_tax_should_save}
            actuallySaved={summary.total_tax_actually_saved}
            onViewBreakdown={() => router.push('/history')}
          />
        )}

        {/* Manual Entry Form */}
        <section className="bg-white border-2 border-gray-50 p-6 rounded-[2.5rem] shadow-sm">
          <h2 className="text-lg mb-4 flex items-center gap-2 font-black text-gray-900">
            <Plus className="w-5 h-5 text-indigo-600" />
            Track New Income
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black mb-2 text-gray-400 uppercase tracking-widest">Amount ($)</label>
              <input 
                type="number" 
                className="input input-lg" 
                placeholder="0.00" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black mb-2 text-gray-400 uppercase tracking-widest">Source</label>
              <input 
                type="text" 
                className="input" 
                placeholder="e.g. Client Payment, Consulting" 
                value={source}
                onChange={(e) => setSource(e.target.value)}
              />
            </div>

            {amount && (
              <div className="p-5 bg-indigo-50 rounded-2xl space-y-3 border border-indigo-100 animate-in">
                {(() => {
                  const moves = calculateSafetyMoves(
                    parseFloat(amount), 
                    profile?.tax_rate_percentage * 100 || 30, 
                    profile?.retirement_rate_percentage * 100 || 10
                  );
                  return (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 font-medium">Tax Vault:</span>
                        <span className="font-black text-red-600">{formatCurrency(moves.tax)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 font-medium">Retirement:</span>
                        <span className="font-black text-indigo-600">{formatCurrency(moves.retirement)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-black border-t border-indigo-200 pt-3 mt-3">
                         <span className="text-gray-900">Safe to Spend:</span>
                         <span className="text-emerald-600">{formatCurrency(moves.safe)}</span>
                      </div>
                    </>
                  );
                })()}
                <button 
                  onClick={handleManualEntry}
                  disabled={loading}
                  className="w-full mt-2 py-4 bg-indigo-600 text-white font-black rounded-[1.5rem] flex items-center justify-center gap-2 hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
                >
                  <Check className="w-5 h-5" />
                  Track Income
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Plaid Connection Section */}
        {!showPlaidLink && (
          <button
            onClick={() => setShowPlaidLink(true)}
            className="w-full py-5 bg-white border-2 border-dashed border-indigo-100 rounded-[2rem] text-indigo-400 font-black uppercase text-xs tracking-widest hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all flex items-center justify-center gap-3"
          >
            🔗 Connect Bank for Auto-Detection
          </button>
        )}

        {showPlaidLink && user && (
          <div className="my-2">
            <PlaidLink userId={user.id} onSuccess={handlePlaidSuccess} />
          </div>
        )}

        {/* Pending Income Confirmations */}
        {pendingConfirmations.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="font-black text-gray-800 text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                Confirm Income
              </h3>
              <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-3 py-1 rounded-full">
                {pendingConfirmations.length} Pending
              </span>
            </div>
            {pendingConfirmations.map((event: any) => (
              <IncomeConfirmation
                key={event.id}
                transaction={{
                  id: event.id,
                  amount: event.amount,
                  description: event.description,
                  date: event.detected_at,
                }}
                onConfirm={handleIncomeConfirm}
                onReject={handleIncomeReject}
              />
            ))}
          </section>
        )}

        {/* Pending Actions / Recent History */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-black text-gray-800 text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
              Recent Activity
            </h3>
            <button 
              onClick={() => router.push('/history')}
              className="text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {incomeEvents.slice(0, 5).map((event: any) => {
              const taxMove = event.recommended_moves?.find((m: any) => m.bucket_name === 'Tax');
              const retMove = event.recommended_moves?.find((m: any) => m.bucket_name === 'Retirement');
              
              return (
                <IncomeCard
                  key={event.id}
                  id={event.id}
                  amount={event.amount}
                  source={event.description || 'Income'}
                  date={new Date(event.detected_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  taxAmount={taxMove?.amount_to_move || 0}
                  retirementAmount={retMove?.amount_to_move || 0}
                  status={event.status}
                  onConfirm={() => openConfirmation(taxMove)}
                  onIgnore={() => console.log('ignore')}
                />
              );
            })}
            {incomeEvents.length === 0 && (
              <div className="bg-gray-50 border-2 border-dashed border-gray-200 p-12 rounded-[2.5rem] text-center">
                <div className="bg-white w-16 h-16 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <CheckCircle2 className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-400 font-medium">No income tracked yet.</p>
                <p className="text-gray-300 text-sm mt-1">Add your first payment above!</p>
              </div>
            )}
          </div>
        </section>

        {/* Gamification Badges */}
        <div className="flex gap-2 overflow-x-auto pb-4 mt-4">
          <div className="badge badge-green flex-shrink-0 border border-green-200">💪 Tax Ninja</div>
          <div className="badge badge-amber flex-shrink-0 border border-amber-200">🏆 Golden Saver</div>
          <div className="badge badge-indigo flex-shrink-0 border border-indigo-200">🎉 Consistent</div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {activeMove && (
        <ConfirmationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={() => onConfirmMove(activeMove.id)}
          title="Confirm Tax Move"
          message="Did you transfer the tax savings to your dedicated account?"
          amount={activeMove.amount_to_move}
          bucket={activeMove.bucket_name}
        />
      )}

      {/* Copilot & Shame Features */}
      <VoiceCopilot 
        isOpen={isVoiceOpen} 
        onClose={() => setIsVoiceOpen(false)} 
        context={{ safeToSpend, taxLiabilities: pendingTax, totalSavings: bankBalance - safeToSpend }}
      />

      <ShameReport 
        amount={pendingTax} 
        isOpen={isShameReportOpen} 
        onClose={() => setIsShameReportOpen(false)} 
      />

      <Feedback 
        isOpen={showFeedbackModal} 
        onClose={() => setShowFeedbackModal(false)} 
      />
    </AppShell>
  );
}
