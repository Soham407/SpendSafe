"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Check, X, ArrowRight, Loader2, PartyPopper } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/auth-helpers-nextjs";
import { formatCurrency } from "@/lib/utils";
import confetti from "canvas-confetti";

export default function ConfirmTransaction() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [event, setEvent] = useState<any>(null);
  const [moves, setMoves] = useState<any[]>([]);
  const [done, setDone] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchEvent = useCallback(async () => {
    // Try by ID or Plaid ID
    const { data: incomeEvent, error } = await supabase
      .from('income_events')
      .select('*, recommended_moves(*)')
      .or(`id.eq.${id},plaid_transaction_id.eq.${id}`)
      .single();

    if (error || !incomeEvent) {
      console.error('Event not found', error);
      setLoading(false);
      return;
    }

    setEvent(incomeEvent);
    setMoves(incomeEvent.recommended_moves || []);
    setLoading(false);
  }, [id, supabase]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const handleConfirm = async () => {
    setConfirming(true);
    
    // Mark moves as completed
    const { error: moveError } = await supabase
      .from('recommended_moves')
      .update({ completed_at: new Date().toISOString(), completion_method: 'confirmed' })
      .eq('income_event_id', event.id);

    // Mark event as completed
    const { error: eventError } = await supabase
      .from('income_events')
      .update({ status: 'completed' })
      .eq('id', event.id);

    if (!moveError && !eventError) {
      setDone(true);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
      setTimeout(() => router.push('/'), 3000);
    }
    setConfirming(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 text-center">
        <div className="bg-red-50 p-4 rounded-full mb-4">
          <X className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-xl font-black text-gray-900">Transaction Not Found</h1>
        <p className="text-gray-500 mt-2">This link may have expired or is invalid.</p>
        <button onClick={() => router.push('/')} className="mt-6 text-indigo-600 font-bold hover:underline">Return to Dashboard</button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-emerald-50 text-center">
        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-emerald-100 animate-in">
          <div className="bg-emerald-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <PartyPopper className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-black text-gray-900">High Five! 💰</h1>
          <p className="text-gray-500 mt-2 mb-6">Your savings are confirmed and your "Safe to Spend" is updated.</p>
          <div className="text-xs font-black text-emerald-600 uppercase tracking-widest animate-pulse">Redirecting to Dashboard...</div>
        </div>
      </div>
    );
  }

  const taxMove = moves.find(m => m.bucket_name === 'Tax');
  const retMove = moves.find(m => m.bucket_name === 'Retirement');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 animate-in">
      <div className="bg-white border-2 border-gray-100 w-full max-w-md p-8 rounded-[3rem] shadow-xl text-center">
        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-indigo-600" />
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">Did you move it?</h1>
        <p className="text-gray-400 font-medium mb-8">
          {formatCurrency(event.amount)} from {event.description || 'Income'}
        </p>

        <div className="space-y-4 mb-8 text-left">
          {taxMove && (
            <div className="p-5 bg-red-50 rounded-2xl border border-red-100 flex justify-between items-center transition-all hover:scale-[1.02]">
              <div>
                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Tax Vault</p>
                <p className="font-black text-red-600">{formatCurrency(taxMove.amount_to_move)}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-red-300" />
            </div>
          )}
          {retMove && (
            <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100 flex justify-between items-center transition-all hover:scale-[1.02]">
              <div>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Retirement</p>
                <p className="font-black text-indigo-600">{formatCurrency(retMove.amount_to_move)}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-indigo-300" />
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <button 
              disabled={confirming}
              onClick={() => router.push('/')}
              className="py-4 bg-gray-50 text-gray-500 font-bold rounded-2xl hover:bg-gray-100 transition-all active:scale-95 disabled:opacity-50"
            >
              Later
            </button>
            <button 
              disabled={confirming}
              onClick={handleConfirm}
              className="py-4 bg-indigo-600 text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
            >
              {confirming ? <Loader2 className="w-5 h-5 animate-spin" /> : "Yes, I Did"}
            </button>
          </div>
          <button 
            disabled={confirming}
            onClick={async () => {
              // Mark as postponed instead of confirmed
              await supabase
                .from('recommended_moves')
                .update({ completion_method: 'postponed' })
                .eq('income_event_id', event.id);
              router.push('/settings'); // Suggest adjusting rates
            }}
            className="w-full py-3 text-amber-600 font-bold text-sm hover:bg-amber-50 rounded-xl transition-all"
          >
            I Can't Right Now → Adjust My Rates
          </button>
        </div>
        
        <p className="mt-6 text-[10px] text-gray-300 font-bold uppercase tracking-widest">
          Safe to Spend updates instantly
        </p>
      </div>
    </div>
  );
}

