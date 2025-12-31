'use client';

import React from 'react';
import { Shield, CheckCircle2, AlertTriangle, FileText, Download } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface AuditReadinessProps {
  totalIncome: number;
  totalTaxSaved: number;
  documentedTransactions: number;
  totalTransactions: number;
  onExport?: () => void;
}

export const AuditReadiness: React.FC<AuditReadinessProps> = ({
  totalIncome,
  totalTaxSaved,
  documentedTransactions,
  totalTransactions,
  onExport
}) => {
  // Calculate readiness score (0-100)
  const savingsScore = totalIncome > 0 ? Math.min((totalTaxSaved / (totalIncome * 0.30)) * 100, 100) : 100;
  const documentationScore = totalTransactions > 0 ? (documentedTransactions / totalTransactions) * 100 : 100;
  const overallScore = Math.round((savingsScore + documentationScore) / 2);
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Audit Ready';
    if (score >= 50) return 'Needs Attention';
    return 'At Risk';
  };

  return (
    <div className="bg-white border-2 border-gray-50 p-6 rounded-[2.5rem] shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-2xl shadow-lg shadow-emerald-100">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-black text-gray-900">Audit Readiness</h3>
            <p className="text-xs text-gray-400 font-medium">Are you IRS-ready?</p>
          </div>
        </div>
        <div className={`px-4 py-2 rounded-2xl border-2 ${getScoreColor(overallScore)}`}>
          <span className="font-black">{overallScore}%</span>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="space-y-4 mb-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-gray-500 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Tax Savings Progress
            </span>
            <span className="text-xs font-black text-gray-700">{savingsScore.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div 
              className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(savingsScore, 100)}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-gray-500 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-indigo-500" />
              Documentation Status
            </span>
            <span className="text-xs font-black text-gray-700">{documentationScore.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div 
              className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(documentationScore, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Status Message */}
      <div className={`p-4 rounded-2xl border-2 mb-4 ${getScoreColor(overallScore)}`}>
        <div className="flex items-center gap-2 mb-1">
          {overallScore >= 80 ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertTriangle className="w-4 h-4" />
          )}
          <span className="font-black text-sm">{getScoreLabel(overallScore)}</span>
        </div>
        <p className="text-xs font-medium opacity-80">
          {overallScore >= 80 
            ? "You're well-prepared for tax season. Keep it up!"
            : overallScore >= 50
            ? "Some transactions need confirmation. Review your pending moves."
            : "Significant tax gap detected. Take action soon to avoid surprises."}
        </p>
      </div>

      {/* Year Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 p-4 rounded-2xl">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">YTD Income</p>
          <p className="text-lg font-black text-gray-900">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-2xl">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Tax Set Aside</p>
          <p className="text-lg font-black text-emerald-600">{formatCurrency(totalTaxSaved)}</p>
        </div>
      </div>

      {/* Export Button */}
      {onExport && (
        <button
          onClick={onExport}
          className="w-full py-3 bg-gray-900 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-800 active:scale-95 transition-all"
        >
          <Download className="w-4 h-4" />
          Export Tax Summary
        </button>
      )}
    </div>
  );
};
