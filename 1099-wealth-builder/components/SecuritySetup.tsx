
import React, { useState } from 'react';
import { X, Smartphone, ShieldCheck, Copy, Check } from 'lucide-react';

interface SecuritySetupProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const SecuritySetup: React.FC<SecuritySetupProps> = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState(1);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText('JBSWY3DPEHPK3PXP');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-6 animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors">
          <X className="w-5 h-5 text-gray-400" />
        </button>

        <div className="text-center mb-8">
          <div className="bg-indigo-600 w-16 h-16 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-100">
            <Smartphone className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-black text-gray-900">Secure Your Wealth</h3>
          <p className="text-xs text-gray-500 mt-1 font-medium italic">Protect your financial data with 2FA</p>
        </div>

        {step === 1 ? (
          <div className="space-y-6 animate-in slide-in-from-bottom duration-300">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0">1</div>
                <p className="text-xs text-gray-600 font-medium">Download Google Authenticator or Authy on your phone.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0">2</div>
                <p className="text-xs text-gray-600 font-medium">Scan this code or copy the secret key below.</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl flex flex-col items-center">
              <div className="bg-white p-2 rounded-xl mb-4 shadow-sm">
                <div className="w-32 h-32 bg-[url('https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=1099Copilot:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=1099Copilot')] bg-cover"></div>
              </div>
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-100 w-full">
                <code className="text-[10px] font-mono font-bold text-gray-500 flex-1">JBSWY3DPEHPK3PXP</code>
                <button onClick={handleCopy} className="text-indigo-600 hover:text-indigo-800 transition-colors">
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"
            >
              I've Scanned It
            </button>
          </div>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-bottom duration-300">
            <p className="text-xs text-center text-gray-500 font-medium">Enter the 6-digit code from your app to verify the setup.</p>
            <div className="flex justify-between gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <input
                  key={i}
                  type="text"
                  maxLength={1}
                  className="w-10 h-12 bg-gray-50 border border-gray-100 rounded-xl text-center text-xl font-black text-indigo-600 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="•"
                />
              ))}
            </div>
            <button
              onClick={onComplete}
              className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              Verify & Enable <ShieldCheck className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
