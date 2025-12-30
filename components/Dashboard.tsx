
import React, { useState, useEffect } from 'react';
import { TrendingUp, ShieldAlert, CheckCircle2, ArrowRight, Star, Ban, AlertCircle, Mic, Landmark, ChevronDown, ChevronUp } from 'lucide-react';
import { IncomeEvent, UserSettings, RecommendedMove } from '../types';
import { formatCurrency, formatDate } from '@/lib/utils';
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
  bankBalance: number;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  settings, 
  incomeEvents, 
  recommendedMoves, 
  onReconcile,
  onIgnore,
  onOpenManual,
  bankBalance 
}) => {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isShameReportOpen, setIsShameReportOpen] = useState(false);
  const [showMathDetail, setShowMathDetail] = useState(false);
  
  const pendingEvents = incomeEvents.filter(e => e.status === 'pending_action');
  
  const totalLiabilities = recommendedMoves
    .filter(m => !m.is_completed)
    .reduce((sum, m) => sum + m.amount_to_move, 0);

  const safeToSpend = bankBalance - totalLiabilities;
  const savingsTotal = recommendedMoves
    .filter(m => m.is_completed)
    .reduce((sum, m) => sum + m.amount_to_move, 0);

  useEffect(() => {
    // Show Shame Report if liabilities are critical (Section 9)
    if (totalLiabilities > 2000) {
      const timer = setTimeout(() => setIsShameReportOpen(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConfirm = (id: string) => {
    onReconcile(id);
    // Logic for Phase 4: Ask "Was this easy?"
    setTimeout(() => setShowFeedbackModal(true), 1500);
  };

  const showShameBanner = totalLiabilities > 2000;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Shame Report Banner */}
      {showShameBanner && (
        <button 
          onClick={() => setIsShameReportOpen(true)}
          className="w-full bg-red-100 border-2 border-red-200 p-4 rounded-[1.5rem] flex items-center justify-between animate-pulse text-left"
        >
          <div className="flex items-center gap-3">
            <div className="bg-red-500 p-2 rounded-xl shadow-lg shadow-red-100">
              <AlertCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black text-red-900 uppercase tracking-tighter">High Risk Warning</p>
              <p className="text-[11px] text-red-700 font-bold">Lazy reconciler detected. Tap for Report.</p>
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
              <p className="text-[9px] font-black uppercase tracking-widest text-center opacity-40 pt-1 italic">
                (This is the addictive number)
              </p>
            </div>
          )}
          
          <div className="h-12 w-full mt-4 opacity-30">
            <svg viewBox="0 0 200 40" className="w-full h-full">
              <path 
                d="M0,40 Q25,35 50,38 T100,20 T150,15 T200,5" 
                fill="none" 
                stroke="white" 
                strokeWidth="4" 
                strokeLinecap="round" 
              />
            </svg>
          </div>
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
                      title="Ignore Transaction"
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

      <button 
        onClick={onOpenManual}
        className="w-full py-6 bg-white border-2 border-dashed border-indigo-100 rounded-[2.5rem] text-indigo-300 font-black uppercase text-xs tracking-[0.3em] hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all flex items-center justify-center gap-3"
      >
        Add Manual Income <ArrowRight className="w-4 h-4" />
      </button>

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
