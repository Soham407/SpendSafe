
import React, { useState } from 'react';
import { DollarSign, Mail, ArrowRight, Loader2, ShieldCheck, Sparkles } from 'lucide-react';

interface AuthProps {
  onLogin: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleMagicLink = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate Supabase Magic Link delay
    setTimeout(() => {
      setLoading(false);
      setSent(true);
      setTimeout(onLogin, 1500);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-indigo-950 flex flex-col items-center justify-center p-8 text-center text-white relative overflow-hidden">
      {/* Background Decals */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-indigo-600 rounded-full blur-[100px] opacity-20"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-indigo-400 rounded-full blur-[100px] opacity-20"></div>

      <div className="w-full max-w-sm space-y-12 relative z-10">
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-[2rem] w-16 h-16 flex items-center justify-center mx-auto shadow-2xl shadow-indigo-500/20 rotate-12">
            <DollarSign className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-black tracking-tight leading-none">
            1099 Wealth <br/> <span className="text-indigo-400">Builder.</span>
          </h1>
          <p className="text-indigo-200/60 text-sm font-medium px-4">
            The Financial Copilot for the <br/> Modern Freelancer.
          </p>
        </div>

        {sent ? (
          <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] space-y-4 animate-in zoom-in duration-300">
            <div className="bg-indigo-500 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-black text-xl">Check your inbox!</h3>
            <p className="text-xs text-indigo-200 font-medium">We sent a magic link to {email}</p>
          </div>
        ) : (
          <form onSubmit={handleMagicLink} className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400 group-focus-within:text-white transition-colors" />
              <input
                type="email"
                placeholder="Enter your email"
                required
                className="w-full bg-white/5 border border-white/10 py-5 pl-14 pr-6 rounded-[1.5rem] outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button
              disabled={loading || !email}
              className="w-full bg-white text-indigo-950 font-black py-5 rounded-[1.5rem] shadow-xl hover:bg-indigo-50 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>Get Magic Link <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>
        )}

        <div className="flex flex-col gap-4 pt-8">
          <div className="flex items-center gap-2 justify-center text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">
            <ShieldCheck className="w-3 h-3" /> No Password Required
          </div>
          <p className="text-[10px] text-white/30 font-medium px-8 italic">
            "We do the math; You move the cash." — Read-only access to help you save for taxes & retirement.
          </p>
        </div>
      </div>
    </div>
  );
};
