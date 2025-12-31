
import React from 'react';
import { AlertCircle, ArrowRight, ShieldAlert, Ban } from 'lucide-react';
import { formatCurrency } from '../utils';

interface ShameReportProps {
  amount: number;
  isOpen: boolean;
  onClose: () => void;
}

export const ShameReport: React.FC<ShameReportProps> = ({ amount, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] bg-red-950/90 backdrop-blur-xl flex items-center justify-center p-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-[3rem] p-8 w-full max-w-sm text-center shadow-2xl relative overflow-hidden">
        {/* Background Decal */}
        <ShieldAlert className="absolute -top-10 -left-10 w-40 h-40 text-red-50/50" />
        
        <div className="relative z-10 space-y-6">
          <div className="bg-red-500 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl shadow-red-200 animate-bounce">
            <AlertCircle className="w-10 h-10 text-white" />
          </div>

          <div className="space-y-2">
            <h3 className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em]">Weekly Shame Report</h3>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">
              You are behind on your future.
            </h2>
            <p className="text-gray-500 text-sm font-medium pt-2">
              "You have <span className="text-red-600 font-black">{formatCurrency(amount)}</span> in un-moved tax money. Be careful."
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 space-y-1">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Risk Level</p>
            <p className="text-xl font-black text-red-600">CRITICAL</p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={onClose}
              className="w-full bg-red-600 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-red-100 hover:bg-red-700 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              Face the Reality <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="text-xs font-black text-gray-300 uppercase tracking-widest hover:text-gray-600 transition-colors flex items-center justify-center gap-2 mx-auto"
            >
              <Ban className="w-3 h-3" /> Dismiss for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
