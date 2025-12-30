"use client";

import React from 'react';
import { Check, X, HelpCircle } from 'lucide-react';

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
    <div className="card border-l-4 border-l-blue-400 animate-in">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
          <HelpCircle className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-sm mb-1">Is this client income?</h4>
          <p className="text-xs text-muted">We detected a potential payment</p>
        </div>
      </div>

      <div className="p-3 bg-muted/5 rounded-lg border border-border mb-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="font-bold text-lg">${transaction.amount.toLocaleString()}</p>
            <p className="text-sm text-muted">{transaction.description}</p>
          </div>
          <p className="text-xs text-muted">{new Date(transaction.date).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onReject(transaction.id)}
          className="btn btn-outline text-sm py-2"
        >
          <X className="w-4 h-4" />
          Not Income
        </button>
        <button
          onClick={() => onConfirm(transaction.id)}
          className="btn btn-primary text-sm py-2"
        >
          <Check className="w-4 h-4" />
          Yes, Track It
        </button>
      </div>
    </div>
  );
}
