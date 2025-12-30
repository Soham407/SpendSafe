
import React from 'react';
import { ChevronLeft, CheckCircle2, Landmark, PiggyBank, ArrowRight, ShieldCheck } from 'lucide-react';
import { IncomeEvent, RecommendedMove } from '../types';
import { formatCurrency, formatDate } from '@/lib/utils';

interface ConfirmMoveViewProps {
  event: IncomeEvent;
  moves: RecommendedMove[];
  onConfirm: (id: string) => void;
  onBack: () => void;
}

export const ConfirmMoveView: React.FC<ConfirmMoveViewProps> = ({ event, moves, onConfirm, onBack }) => {
  const totalToMove = moves.reduce((sum, m) => sum + m.amount_to_move, 0);

  return (
    <div className="min-h-screen bg-white animate-in fade-in duration-500">
      <div className="px-6 py-5 flex items-center gap-4 border-b border-gray-50">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-lg font-black text-gray-900 tracking-tight">Review Move</h2>
      </div>

      <div className="p-6 space-y-8">
        <div className="text-center space-y-2">
          <div className="bg-emerald-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <p className="text-sm font-black text-emerald-600 uppercase tracking-widest">High Five! You got paid</p>
          <h3 className="text-4xl font-black text-gray-900">{formatCurrency(event.amount)}</h3>
          <p className="text-xs text-gray-400 font-medium">{event.original_description} • {formatDate(event.detected_at)}</p>
        </div>

        <div className="space-y-4">
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Required Moves</h4>
          <div className="space-y-3">
            {moves.map((move, i) => (
              <div key={move.id} className="bg-gray-50 p-5 rounded-[2rem] border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${move.bucket_name === 'Tax' ? 'bg-red-100' : 'bg-indigo-100'}`}>
                    {move.bucket_name === 'Tax' ? <Landmark className="w-5 h-5 text-red-600" /> : <PiggyBank className="w-5 h-5 text-indigo-600" />}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{move.bucket_name} Vault</p>
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">Savings Goal</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-gray-900">{formatCurrency(move.amount_to_move)}</p>
                  <p className="text-[10px] text-red-500 font-bold uppercase">To Move</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-indigo-50 p-6 rounded-[2.5rem] border border-indigo-100 space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm font-bold text-indigo-900">Total to move now</p>
            <p className="text-xl font-black text-indigo-600">{formatCurrency(totalToMove)}</p>
          </div>
          <button 
            onClick={() => {
              onConfirm(event.id);
              onBack();
            }}
            className="w-full bg-indigo-600 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            Confirm & Log Transfer <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 text-gray-300">
          <ShieldCheck className="w-4 h-4" />
          <p className="text-[10px] font-bold uppercase tracking-widest">Read-Only Confirmation</p>
        </div>
      </div>
    </div>
  );
};
