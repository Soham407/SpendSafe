'use client';

import React from 'react';
import { ShieldAlert, CheckCircle2, ArrowRight, Ban } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface IncomeCardProps {
  id: string;
  amount: number;
  source: string;
  date: string;
  taxAmount: number;
  retirementAmount: number;
  status: string;
  onConfirm: () => void;
  onIgnore: () => void;
}

export const IncomeCard: React.FC<IncomeCardProps> = ({ 
  id,
  amount, 
  source, 
  date, 
  taxAmount, 
  retirementAmount,
  status,
  onConfirm,
  onIgnore
}) => {
  const isPending = status === 'pending_action';
  
  return (
    <div className="bg-white border-2 border-gray-50 p-6 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all group">
      <div className="flex justify-between items-start mb-5">
        <div>
          <h4 className="font-black text-gray-900 group-hover:text-indigo-600 transition-colors text-base">{source}</h4>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">{date}</p>
        </div>
        <span className="bg-emerald-600 text-white px-3 py-1.5 rounded-2xl text-[11px] font-black shadow-lg shadow-emerald-100">
          +{formatCurrency(amount)}
        </span>
      </div>
      
      <div className="space-y-3 mb-6">
        <div className="flex justify-between items-center bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">To Tax Vault</span>
          <span className="font-mono font-black text-red-600 text-sm">{formatCurrency(taxAmount)}</span>
        </div>
        <div className="flex justify-between items-center bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">To Retirement Vault</span>
          <span className="font-mono font-black text-indigo-600 text-sm">{formatCurrency(retirementAmount)}</span>
        </div>
      </div>

      {isPending && (
        <div className="flex gap-3">
          <button 
            onClick={onConfirm}
            className="flex-1 bg-gray-900 text-white font-black py-4 rounded-[1.5rem] flex items-center justify-center gap-2 hover:bg-black active:scale-95 transition-all shadow-xl shadow-gray-100"
          >
            Log Transfers <CheckCircle2 className="w-4 h-4" />
          </button>
          <button 
            onClick={onIgnore}
            className="p-5 bg-gray-50 text-gray-300 rounded-[1.5rem] hover:bg-red-50 hover:text-red-400 transition-all border border-gray-100"
            title="Ignore Transaction"
          >
            <Ban className="w-5 h-5" />
          </button>
        </div>
      )}
      
      {status === 'completed' && (
        <div className="flex items-center justify-center gap-2 py-3 text-emerald-600 font-black text-sm">
          <CheckCircle2 className="w-4 h-4" /> Transfers Logged
        </div>
      )}
    </div>
  );
};
