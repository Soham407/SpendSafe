
import React from 'react';
import { ShieldCheck, Eye, Lock, FileText, ChevronLeft, Globe, UserCheck } from 'lucide-react';

interface TrustCenterProps {
  onBack: () => void;
}

export const TrustCenter: React.FC<TrustCenterProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-white animate-in slide-in-from-right duration-300">
      <div className="sticky top-0 bg-white/80 backdrop-blur-md px-6 py-5 border-b border-gray-50 flex items-center gap-4 z-10">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-lg font-black text-gray-900 tracking-tight">Privacy & Trust Center</h2>
      </div>

      <div className="p-6 space-y-8">
        <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
          <h3 className="text-2xl font-black mb-2">Enterprise-Grade by Design</h3>
          <p className="text-indigo-100 text-xs font-medium leading-relaxed italic">
            "We do the math; You move the cash." - Our core philosophy means your money never leaves your control.
          </p>
          <ShieldCheck className="absolute -bottom-4 -right-4 w-24 h-24 text-white/10" />
        </div>

        <section className="space-y-4">
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">The Rules of Trust</h4>
          
          <div className="space-y-3">
            <div className="bg-gray-50 p-6 rounded-[2rem] space-y-3 border border-gray-50">
              <div className="bg-white w-10 h-10 rounded-xl flex items-center justify-center shadow-sm">
                <Globe className="w-5 h-5 text-indigo-600" />
              </div>
              <h5 className="font-bold text-gray-900 text-sm">We Do Not Sell Your Data</h5>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                Explicit Policy: Your transaction data is used exclusively to calculate estimates. We have zero interest in selling your privacy.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-[2rem] space-y-3 border border-gray-50">
              <div className="bg-white w-10 h-10 rounded-xl flex items-center justify-center shadow-sm">
                <Eye className="w-5 h-5 text-emerald-600" />
              </div>
              <h5 className="font-bold text-gray-900 text-sm">Read-Only Connection</h5>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                Our Plaid integration is strictly "Read-Only". 1099 Wealth Builder has physically NO ability to withdraw or move funds.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-[2rem] space-y-3 border border-gray-50">
              <div className="bg-white w-10 h-10 rounded-xl flex items-center justify-center shadow-sm">
                <Lock className="w-5 h-5 text-purple-600" />
              </div>
              <h5 className="font-bold text-gray-900 text-sm">Least Privilege Principle</h5>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                Plaid tokens are stored in a secure encrypted vault. Your bank credentials never even touch our servers.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-indigo-50/50 p-6 rounded-[2.5rem] border border-indigo-100 text-center">
          <UserCheck className="w-10 h-10 text-indigo-600 mx-auto mb-4" />
          <h4 className="font-black text-indigo-900 text-sm mb-2 uppercase tracking-tighter">Human First App</h4>
          <p className="text-xs text-indigo-600/80 font-medium">
            Building for freelancers who crave clarity but fear automation. We keep the math transparent and the control in your hands.
          </p>
        </section>

        <div className="text-center pt-4 pb-12">
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Version 1.0.0 (The Bootstrapper Edition)</p>
        </div>
      </div>
    </div>
  );
};
