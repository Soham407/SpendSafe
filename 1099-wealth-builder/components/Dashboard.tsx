
import React, { useState, useEffect } from 'react';
// Added Star to the imports from lucide-react
import { TrendingUp, ShieldAlert, CheckCircle2, ArrowRight, Ban, AlertCircle, Mic, Landmark, ChevronDown, ChevronUp, RefreshCw, Share2, Star } from 'lucide-react';
import { IncomeEvent, UserSettings, RecommendedMove } from '../types';
import { formatCurrency, formatDate } from '../utils';
import { AiCopilot } from './AiCopilot';
import { VoiceCopilot } from './VoiceCopilot';
import { ShameReport } from './ShameReport';
import { Feedback } from './Feedback';

interface DashboardProps {
  settings: UserSettings;
  incomeEvents: IncomeEvent[];
  recommendedMoves: RecommendedMove[];
  onReconcile: (eventId: string) => void;
  onIgnore: (eventId: string) => void;
  onOpenManual: () => void;
  onSyncBank: () => void;
  bankBalance: number;
  isSyncing: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  settings, 
  incomeEvents, 
  recommendedMoves, 
  onReconcile,
  onIgnore,
  onOpenManual,
  onSyncBank,
  bankBalance,
  isSyncing
}) => {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isShameReportOpen, setIsShameReportOpen] = useState(false);
  const [showMathDetail, setShowMathDetail] = useState(false);
  const [showReferral, setShowReferral] = useState(false);
  
  const pendingEvents = incomeEvents.filter(e => e.status === 'pending_action');
  
  const totalLiabilities = recommendedMoves
    .filter(m => !m.is_completed)
    .reduce((sum, m) => sum + m.amount_to_move, 0);

  const safeToSpend = bankBalance - totalLiabilities;
  const savingsTotal = recommendedMoves
    .filter(m => m.is_completed)
    .reduce((sum, m) => sum + m.amount_to_move, 0);

  useEffect(() => {
    if (totalLiabilities > 5000) {
      const timer = setTimeout(() => setIsShameReportOpen(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [totalLiabilities]);

  const handleConfirm = (id: string) => {
    onReconcile(id);
    setTimeout(() => setShowFeedbackModal(true), 1000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Header with Sync Action */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Live Status</h3>
        <button 
          onClick={onSyncBank}
          disabled={isSyncing}
          className="flex items-center gap-2 text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Watching Plaid...' : 'Sync Bank'}
        </button>
      </div>

      {/* Shame Report Banner */}
      {totalLiabilities > 2000 && (
        <button 
          onClick={() => setIsShameReportOpen(true)}
          className="w-full bg-red-100 border-2 border-red-200 p-4 rounded-[1.5rem] flex items-center justify-between animate-pulse text-left"
        >
          <div className="flex items-center gap-3">
            <div className="bg-red-500 p-2 rounded-xl shadow-lg shadow-red-100">
              <AlertCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black text-red-900 uppercase tracking-tighter">Liability Alert</p>
              <p className="text-[11px] text-red-700 font-bold">Unconfirmed tax moves detected.</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-red-400" />
        </button>
      )}

      {/* Hero Metric - Section 3D Implementation */}
      <div className={`bg-gradient-to-br transition-all duration-1000 ${safeToSpend > 0 ? 'from-indigo-600 to-indigo-900 shadow-indigo-100' : 'from-red-600 to-red-800 shadow-red-100'} rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden group`}>
        <div className="relative z-10 space-y-4">
          <div className="flex justify-between items-start">
            <p className="text-white/60 text-xs font-black mb-1 uppercase tracking-widest">Safe to Spend</p>
            <button 
              onClick={() => setIsVoiceOpen(true)}
              className="bg-white/10 p-3 rounded-2xl hover:bg-white/20 transition-all group-active:scale-90"
            >
              <Mic className="w-5 h-5 text-white" />
            </button>
          </div>
          <h2 className="text-6xl font-black tracking-tighter transition-all group-hover:scale-[1.02] duration-500">{formatCurrency(safeToSpend)}</h2>
          
          <button 
            onClick={() => setShowMathDetail(!showMathDetail)}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] opacity-60 hover:opacity-100 transition-opacity"
          >
            See The Math {showMathDetail ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {showMathDetail && (
            <div className="space-y-2 pt-2 animate-in slide-in-from-top-2 duration-300">
              <div className="flex justify-between items-center text-sm font-medium opacity-80">
                <span>Total Bank Balance</span>
                <span className="font-mono">{formatCurrency(bankBalance)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-medium text-red-300">
                <span>Less Unpaid Tax Liabilities</span>
                <span className="font-mono">-{formatCurrency(totalLiabilities)}</span>
              </div>
              <div className="h-px bg-white/10 my-2"></div>
              <div className="flex justify-between items-center text-base font-black">
                <span>True "Safe to Spend"</span>
                <span className="font-mono text-emerald-300">{formatCurrency(safeToSpend)}</span>
              </div>
            </div>
          )}
        </div>
        <div className="absolute top-[-50px] right-[-50px] opacity-[0.03]">
          <Landmark size={240} />
        </div>
      </div>

      <AiCopilot 
        safeToSpend={safeToSpend} 
        taxLiabilities={totalLiabilities} 
        savingsTotal={savingsTotal} 
      />

      {pendingEvents.length > 0 ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-black text-gray-800 text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
              Action Required
            </h3>
            <span className="bg-gray-100 text-gray-500 text-[10px] font-black px-3 py-1 rounded-full border border-gray-200">
              {pendingEvents.length} Pending
            </span>
          </div>
          <div className="space-y-4">
            {pendingEvents.map(event => {
              const moves = recommendedMoves.filter(m => m.income_event_id === event.id);
              return (
                <div key={event.id} className="bg-white border-2 border-gray-50 p-6 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all group">
                  <div className="flex justify-between items-start mb-5">
                    <div>
                      <h4 className="font-black text-gray-900 group-hover:text-indigo-600 transition-colors text-base">{event.original_description}</h4>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">{formatDate(event.detected_at)}</p>
                    </div>
                    <span className="bg-emerald-600 text-white px-3 py-1.5 rounded-2xl text-[11px] font-black shadow-lg shadow-emerald-100">
                      +{formatCurrency(event.amount)}
                    </span>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    {moves.map(move => (
                      <div key={move.id} className="flex justify-between items-center bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">To {move.bucket_name} Vault</span>
                        <span className="font-mono font-black text-red-600 text-sm">{formatCurrency(move.amount_to_move)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleConfirm(event.id)}
                      className="flex-1 bg-gray-900 text-white font-black py-4 rounded-[1.5rem] flex items-center justify-center gap-2 hover:bg-black active:scale-95 transition-all shadow-xl shadow-gray-100"
                    >
                      Log Transfers <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onIgnore(event.id)}
                      className="p-5 bg-gray-50 text-gray-300 rounded-[1.5rem] hover:bg-red-50 hover:text-red-400 transition-all border border-gray-100"
                    >
                      <Ban className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        <div className="bg-emerald-50 border-2 border-emerald-100 p-12 rounded-[3rem] text-center shadow-inner">
          <div className="bg-white w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-200/50">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h3 className="font-black text-emerald-900 text-2xl tracking-tight">Pure Zen.</h3>
          <p className="text-emerald-600 text-xs mt-2 font-black uppercase tracking-[0.2em]">All funds are accounted for.</p>
        </div>
      )}

      {/* Growth Card - Phase 4 */}
      <div className="bg-indigo-950 rounded-[2.5rem] p-8 text-white space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Phase 4: Growth</h4>
          <Star className="w-4 h-4 text-indigo-400" />
        </div>
        <p className="text-lg font-black leading-tight">Help 5 friends stay tax-safe and get 3 months of Pro.</p>
        <button 
          onClick={() => setShowReferral(true)}
          className="w-full py-4 bg-white text-indigo-950 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-50 transition-all"
        >
          <Share2 className="w-4 h-4" /> Copy Referral Link
        </button>
      </div>

      {showReferral && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom duration-300 z-[100]">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">Link Copied! Onboard your friends.</span>
        </div>
      )}

      <VoiceCopilot 
        isOpen={isVoiceOpen} 
        onClose={() => setIsVoiceOpen(false)} 
        context={{ safeToSpend, taxLiabilities: totalLiabilities, totalSavings: savingsTotal }}
      />

      <ShameReport 
        amount={totalLiabilities} 
        isOpen={isShameReportOpen} 
        onClose={() => setIsShameReportOpen(false)} 
      />

      <Feedback 
        isOpen={showFeedbackModal} 
        onClose={() => setShowFeedbackModal(false)} 
      />
    </div>
  );
};
