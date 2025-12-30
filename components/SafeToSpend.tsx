'use client';

import React from 'react';
import { Landmark, ChevronDown, ChevronUp, Mic } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface SafeToSpendProps {
  amount: number;
  bankBalance: number;
  totalLiabilities: number;
  showMathDetail: boolean;
  onToggleMath: () => void;
  onOpenVoice?: () => void;
}

export const SafeToSpend: React.FC<SafeToSpendProps> = ({ 
  amount, 
  bankBalance, 
  totalLiabilities,
  showMathDetail,
  onToggleMath,
  onOpenVoice
}) => {
  const isPositive = amount > 0;
  
  return (
    <div className={`bg-gradient-to-br transition-all duration-1000 ${isPositive ? 'from-indigo-600 to-indigo-900 shadow-indigo-100' : 'from-red-600 to-red-800 shadow-red-100'} rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden group`}>
      <div className="relative z-10 space-y-4">
        <div className="flex justify-between items-start">
          <p className="text-white/60 text-xs font-black mb-1 uppercase tracking-widest">Safe to Spend</p>
          {onOpenVoice && (
            <button 
              onClick={onOpenVoice}
              className="bg-white/10 p-3 rounded-2xl hover:bg-white/20 transition-all active:scale-90"
            >
              <Mic className="w-5 h-5 text-white" />
            </button>
          )}
        </div>
        <h2 className="text-6xl font-black tracking-tighter transition-all group-hover:scale-[1.02] duration-500">
          {formatCurrency(amount)}
        </h2>
        
        <button 
          onClick={onToggleMath}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] opacity-60 hover:opacity-100 transition-opacity"
        >
          See The Math {showMathDetail ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {showMathDetail && (
          <div className="space-y-2 pt-2 animate-in">
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
              <span className="font-mono text-emerald-300">{formatCurrency(amount)}</span>
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
  );
};
