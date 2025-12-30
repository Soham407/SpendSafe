'use client';

import React from 'react';
import { AlertTriangle, ArrowRight, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface PanicButtonProps {
  totalIncome: number;
  shouldHaveSaved: number;
  actuallySaved: number;
  onViewBreakdown?: () => void;
}

export const PanicButton: React.FC<PanicButtonProps> = ({ 
  totalIncome, 
  shouldHaveSaved, 
  actuallySaved,
  onViewBreakdown
}) => {
  const taxGap = shouldHaveSaved - actuallySaved;
  const percentComplete = shouldHaveSaved > 0 ? (actuallySaved / shouldHaveSaved) * 100 : 100;
  const isAtRisk = taxGap > 500;

  if (!isAtRisk) {
    return (
      <div className="bg-emerald-50 border-2 border-emerald-100 p-6 rounded-[2.5rem] text-center">
        <div className="flex items-center justify-center gap-2 text-emerald-600 font-black text-sm mb-2">
          ✓ Tax Savings On Track
        </div>
        <p className="text-emerald-700 text-xs font-medium">
          You've saved {formatCurrency(actuallySaved)} of {formatCurrency(shouldHaveSaved)} recommended.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-red-500 to-orange-500 p-6 rounded-[2.5rem] text-white shadow-xl shadow-red-100 relative overflow-hidden">
      <div className="absolute top-[-20px] right-[-20px] opacity-10">
        <TrendingDown size={120} />
      </div>
      
      <div className="relative z-10 space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-3 rounded-2xl">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Tax Panic Alert</p>
            <h3 className="text-2xl font-black tracking-tight">{formatCurrency(taxGap)} Behind</h3>
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span className="text-white/70">Should have saved</span>
            <span className="font-mono font-bold">{formatCurrency(shouldHaveSaved)}</span>
          </div>
          <div className="flex justify-between text-sm font-medium">
            <span className="text-white/70">Actually saved</span>
            <span className="font-mono font-bold">{formatCurrency(actuallySaved)}</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2 mt-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(percentComplete, 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-white/50 font-bold text-center pt-1">
            {percentComplete.toFixed(0)}% of target reached
          </p>
        </div>

        {onViewBreakdown && (
          <button 
            onClick={onViewBreakdown}
            className="w-full bg-white text-red-600 font-black py-4 rounded-[1.5rem] flex items-center justify-center gap-2 hover:bg-white/90 active:scale-95 transition-all"
          >
            View Full Breakdown <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
