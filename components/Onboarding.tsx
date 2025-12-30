'use client';

import React, { useState } from 'react';
import { ShieldCheck, Calculator, TrendingUp, ArrowRight, Building2, ChevronRight, Landmark, Loader2, X } from 'lucide-react';

interface OnboardingProps {
  onConnect: () => void;
  onPlaidConnect?: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onConnect, onPlaidConnect }) => {
  const [step, setStep] = useState(0);
  const [showPlaid, setShowPlaid] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const steps = [
    {
      icon: <Calculator className="w-12 h-12 text-indigo-600" />,
      title: "Taxes aren't a surprise anymore.",
      description: "Freelancers lose thousands in penalties. We calculate your 1099 liabilities in real-time as you get paid.",
      color: "bg-indigo-50"
    },
    {
      icon: <TrendingUp className="w-12 h-12 text-emerald-600" />,
      title: "The 'Safe to Spend' Number.",
      description: "Stop guessing. We subtract your future taxes from your current balance so you know exactly what's yours to keep.",
      color: "bg-emerald-50"
    },
    {
      icon: <ShieldCheck className="w-12 h-12 text-blue-600" />,
      title: "Enterprise-Grade Security.",
      description: "Read-only access via Plaid. We can't move your money. Your bank credentials never touch our servers.",
      color: "bg-blue-50"
    }
  ];

  const current = steps[step];

  const handleBankSelect = (bank: string) => {
    setIsConnecting(true);
    // If onPlaidConnect is provided, call it (for real Plaid integration)
    if (onPlaidConnect) {
      onPlaidConnect();
    } else {
      // Demo mode: simulate connection
      setTimeout(() => {
        onConnect();
      }, 2000);
    }
  };

  if (showPlaid) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col p-6 animate-in">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
              <Landmark className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-400">Plaid Link</span>
          </div>
          <button onClick={() => setShowPlaid(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-8 flex-1">
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-gray-900">Select your bank</h2>
            <p className="text-sm text-gray-400 font-medium italic">Search for your financial institution</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {['Chase', 'Wells Fargo', 'Bank of America', 'Capital One', 'Mercury', 'Found'].map((bank) => (
              <button
                key={bank}
                onClick={() => handleBankSelect(bank)}
                disabled={isConnecting}
                className="w-full p-6 bg-white border border-gray-100 rounded-3xl flex items-center justify-between hover:border-indigo-600 transition-all group shadow-sm disabled:opacity-50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center font-black text-indigo-200 uppercase text-xs">
                    {bank[0]}
                  </div>
                  <span className="font-black text-gray-800">{bank}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-600" />
              </button>
            ))}
          </div>
        </div>

        {isConnecting && (
          <div className="fixed inset-0 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center z-50 p-12 text-center">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-6" />
            <h3 className="text-xl font-black text-gray-900">Connecting securely...</h3>
            <p className="text-gray-400 text-sm font-medium mt-2">Linking SpendSafe to your business account.</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-8 bg-white text-center animate-in">
      <div className="w-full flex justify-end">
        <button onClick={() => setShowPlaid(true)} className="text-xs font-black text-gray-300 uppercase tracking-widest hover:text-indigo-600 transition-colors">Skip</button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center space-y-8 w-full max-w-sm">
        <div className={`${current.color} w-24 h-24 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-gray-100 transition-all duration-500`}>
          {current.icon}
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-tight transition-all">
            {current.title}
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed font-medium">
            {current.description}
          </p>
        </div>

        <div className="flex gap-2">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-indigo-600' : 'w-2 bg-gray-200'}`} />
          ))}
        </div>
      </div>

      <div className="w-full max-w-sm space-y-4">
        {step < steps.length - 1 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            className="w-full bg-gray-900 text-white font-black py-5 rounded-[1.5rem] shadow-xl hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            Next <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={() => setShowPlaid(true)}
            className="w-full bg-indigo-600 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            Securely Link with Plaid <ArrowRight className="w-5 h-5" />
          </button>
        )}
        
        <p className="text-[10px] text-gray-300 font-bold uppercase tracking-[0.2em]">
          Trusted by 5,000+ Freelancers
        </p>
      </div>
    </div>
  );
};
