'use client';

import React from 'react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  amount?: number;
  bucket?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message,
  amount,
  bucket
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl animate-in z-10">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-gray-300 hover:text-gray-600 transition-colors rounded-xl hover:bg-gray-50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-6">
          <div className="bg-indigo-100 w-16 h-16 rounded-[1.5rem] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-indigo-600" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black text-gray-900">{title}</h3>
            <p className="text-gray-500 text-sm font-medium">{message}</p>
          </div>

          {amount !== undefined && (
            <div className="bg-gray-50 p-4 rounded-2xl">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                {bucket || 'Amount'}
              </p>
              <p className="text-2xl font-black text-gray-900">{formatCurrency(amount)}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-4 px-6 bg-gray-100 text-gray-600 font-bold rounded-[1.5rem] hover:bg-gray-200 transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-4 px-6 bg-indigo-600 text-white font-bold rounded-[1.5rem] hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
