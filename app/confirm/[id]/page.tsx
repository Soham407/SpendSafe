"use client";

import { Check, X, ArrowRight } from "lucide-react";
import { useParams } from "next/navigation";

export default function ConfirmTransaction() {
  const params = useParams();
  const id = params.id;

  // Mock transaction data
  const transaction = {
    amount: 4200,
    source: "Acme Corp",
    tax: 1260,
    retirement: 420,
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 animate-in">
      <div className="card w-full max-w-md text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">High Five! 💰</h1>
        <p className="text-muted mb-6">
          ${transaction.amount.toLocaleString()} from {transaction.source} just landed.
        </p>

        <div className="space-y-4 mb-8 text-left">
          <div className="p-4 bg-muted/5 rounded-lg border border-border flex justify-between items-center text-sm font-medium">
            <span>Move to Tax Savings</span>
            <span className="text-primary font-bold flex items-center gap-2">
              ${transaction.tax.toLocaleString()}
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
          <div className="p-4 bg-muted/5 rounded-lg border border-border flex justify-between items-center text-sm font-medium">
            <span>Move to Retirement</span>
            <span className="text-secondary font-bold flex items-center gap-2">
              ${transaction.retirement.toLocaleString()}
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button className="btn btn-outline flex items-center justify-center">
            Later
          </button>
          <button className="btn btn-primary flex items-center justify-center">
            Confirmed
          </button>
        </div>
        
        <p className="mt-6 text-xs text-muted">
          Your "Safe to Spend" will update instantly.
        </p>
      </div>
    </div>
  );
}
