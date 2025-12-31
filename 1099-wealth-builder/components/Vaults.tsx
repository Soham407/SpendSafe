
import React, { useState } from 'react';
import { PiggyBank, Landmark, ShieldCheck, ArrowUpRight, ChevronLeft, ArrowDownRight, Clock, Target, TrendingUp, Sparkles } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils';
import { RecommendedMove, IncomeEvent } from '../types';

interface VaultsProps {
  taxSaved: number;
  retirementSaved: number;
  moves: RecommendedMove[];
  incomeEvents: IncomeEvent[];
}

export const Vaults: React.FC<VaultsProps> = ({ taxSaved, retirementSaved, moves, incomeEvents }) => {
  const [viewingLedger, setViewingLedger] = useState<'Tax' | 'Retirement' | null>(null);
  const [retirementGoal, setRetirementGoal] = useState(10000);
  
  const progress = Math.min((retirementSaved / retirementGoal) * 100, 100);

  // Phase 4: Financial Projection
  const monthlyAvg = retirementSaved / 3; // Mock 3 months of data
  const yearlyProjection = monthlyAvg * 12;

  const ledgerMoves = moves
    .filter(m => m.bucket_name === viewingLedger && m.is_completed)
    .map(move => {
      const event = incomeEvents.find(e => e.id === move.income_event_id);
      return { ...move, description: event?.original_description, date: event?.detected_at };
    })
    .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());

  if (viewingLedger) {
    return (
      <div className="space-y-6 animate-in slide-in-from-right duration-300 pb-20">
        <div className="flex items-center gap-4">
          <button onClick={() => setViewingLedger(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-xl font-black text-gray-800 tracking-tight">{viewingLedger} Ledger</h2>
        </div>

        <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-100">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Total Verified</p>
          <p className="text-4xl font-black">{formatCurrency(viewingLedger === 'Tax' ? taxSaved : retirementSaved)}</p>
        </div>

        <div className="space-y-3">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">History of Moves</h3>
          {ledgerMoves.length > 0 ? (
            ledgerMoves.map(move => (
              <div key={move.id} className="bg-white border border-gray-50 p-5 rounded-[2rem] flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-50 p-3 rounded-2xl">
                    <ArrowDownRight className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900 truncate max-w-[140px]">{move.description}</p>
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">
                      {formatDate(move.date || '')}
                    </p>
                  </div>
                </div>
                <p className="font-black text-emerald-600">+{formatCurrency(move.amount_to_move)}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100">
              <Clock className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-xs font-bold text-gray-400">No verified moves yet.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <div className="flex items-center gap-2 mb-2">
        <PiggyBank className="w-5 h-5 text-indigo-600" />
        <h2 className="text-xl font-black text-gray-800 tracking-tight">Virtual Vaults</h2>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Tax Vault */}
        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-red-50 p-4 rounded-[1.5rem]">
              <Landmark className="w-6 h-6 text-red-500" />
            </div>
            <span className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 px-4 py-1.5 rounded-full border border-gray-100 tracking-widest">
              IRS Reserve
            </span>
          </div>
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Current Protection</h3>
          <p className="text-4xl font-black text-gray-900 group-hover:text-red-500 transition-colors">{formatCurrency(taxSaved)}</p>
          <div className="flex items-center gap-2 mt-4 text-[10px] font-bold text-gray-400">
            <ShieldCheck className="w-3 h-3 text-green-500" /> 
            <span>Matches Bank Transfers</span>
          </div>
          <button 
            onClick={() => setViewingLedger('Tax')}
            className="mt-8 w-full py-4 bg-gray-50 border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 hover:bg-gray-900 hover:text-white transition-all flex items-center justify-center gap-2"
          >
            Audit Ledger <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        {/* Retirement Vault with Goal Progress */}
        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-indigo-50 p-4 rounded-[1.5rem]">
              <PiggyBank className="w-6 h-6 text-indigo-600" />
            </div>
            <button 
              onClick={() => setRetirementGoal(prev => prev + 5000)}
              className="bg-gray-50 text-[9px] font-black uppercase text-gray-400 px-4 py-1.5 rounded-full border border-gray-100 tracking-widest hover:bg-indigo-600 hover:text-white transition-all"
            >
              Set Goal
            </button>
          </div>
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Compound Growth</h3>
          <p className="text-4xl font-black text-gray-900 group-hover:text-indigo-600 transition-colors">{formatCurrency(retirementSaved)}</p>
          
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-gray-400">
              <span className="flex items-center gap-1"><Target className="w-3 h-3" /> {formatCurrency(retirementGoal)} Milestone</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-600 rounded-full transition-all duration-1000" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <button 
            onClick={() => setViewingLedger('Retirement')}
            className="mt-8 w-full py-4 bg-gray-50 border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 hover:bg-gray-900 hover:text-white transition-all flex items-center justify-center gap-2"
          >
            Compound Ledger <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Projection Card - Phase 4 */}
      <div className="bg-emerald-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
        <div className="relative z-10 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60">Yearly Savings Run Rate</h4>
            <TrendingUp className="w-4 h-4 opacity-60" />
          </div>
          <p className="text-3xl font-black">{formatCurrency(yearlyProjection)}</p>
          <div className="flex items-center gap-2 text-[10px] font-bold opacity-80">
            <Sparkles className="w-3 h-3" />
            <span>Projected wealth by Dec 2025</span>
          </div>
        </div>
        <div className="absolute -bottom-10 -right-10 opacity-10">
          <TrendingUp size={200} />
        </div>
      </div>
    </div>
  );
};
