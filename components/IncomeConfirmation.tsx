"use client";

import React from 'react';
import { Check, X, HelpCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface IncomeConfirmationProps {
  transaction: {
    id: string;
    amount: number;
    description: string;
    date: string;
  };
  onConfirm: (id: string) => void;
  onReject: (id: string) => void;
}

export function IncomeConfirmation({ transaction, onConfirm, onReject }: IncomeConfirmationProps) {
  return (
    <div className="bg-white border-2 border-blue-100 p-5 rounded-[2rem] shadow-sm animate-in">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
          <HelpCircle className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <h4 className="font-black text-gray-900 mb-1">Is this client income?</h4>
          <p className="text-xs text-gray-400 font-medium">We detected a potential payment</p>
        </div>
      </div>

      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 mb-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-black text-xl text-gray-900">{formatCurrency(transaction.amount)}</p>
            <p className="text-sm text-gray-500 font-medium">{transaction.description}</p>
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            {new Date(transaction.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onReject(transaction.id)}
          className="py-3 bg-gray-100 text-gray-500 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-red-50 hover:text-red-500 transition-all active:scale-95"
        >
          <X className="w-4 h-4" />
          Not Income
        </button>
        <button
          onClick={() => onConfirm(transaction.id)}
          className="py-3 bg-indigo-600 text-white font-black rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100"
        >
          <Check className="w-4 h-4" />
          Yes, Track It
        </button>
      </div>
    </div>
  );
}

