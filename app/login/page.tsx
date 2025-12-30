'use client';

import React, { useState } from 'react';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { DollarSign, Mail, ArrowRight, Loader2, ShieldCheck, Sparkles, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [useMagicLink, setUseMagicLink] = useState(true);
  const [sent, setSent] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const router = useRouter();

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      router.push('/');
    }
    setLoading(false);
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
            Spend<span className="text-indigo-400">Safe.</span>
          </h1>
          <p className="text-indigo-200/60 text-sm font-medium px-4">
            The Financial Copilot for the <br/> Modern Freelancer.
          </p>
        </div>

        {sent ? (
          <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] space-y-4 animate-in">
            <div className="bg-indigo-500 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-black text-xl">Check your inbox!</h3>
            <p className="text-xs text-indigo-200 font-medium">We sent a magic link to {email}</p>
          </div>
        ) : (
          <form onSubmit={useMagicLink ? handleMagicLink : handlePasswordLogin} className="space-y-4">
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

            {!useMagicLink && (
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  required
                  className="w-full bg-white/5 border border-white/10 py-5 pl-6 pr-14 rounded-[1.5rem] outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium text-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            )}

            {error && (
              <p className="text-red-400 text-sm font-medium bg-red-500/10 p-3 rounded-xl">{error}</p>
            )}

            <button
              disabled={loading || !email}
              className="w-full bg-white text-indigo-950 font-black py-5 rounded-[1.5rem] shadow-xl hover:bg-indigo-50 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>{useMagicLink ? 'Get Magic Link' : 'Sign In'} <ArrowRight className="w-5 h-5" /></>
              )}
            </button>

            <button
              type="button"
              onClick={() => setUseMagicLink(!useMagicLink)}
              className="text-xs font-black text-indigo-300 uppercase tracking-widest hover:text-white transition-colors"
            >
              {useMagicLink ? 'Use Password Instead' : 'Use Magic Link Instead'}
            </button>
          </form>
        )}

        <div className="flex flex-col gap-4 pt-4">
          <div className="flex items-center gap-2 justify-center text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">
            <ShieldCheck className="w-3 h-3" /> {useMagicLink ? 'No Password Required' : 'Secure Login'}
          </div>
          <p className="text-[10px] text-white/30 font-medium px-8 italic">
            "We do the math; You move the cash." — Read-only access to help you save for taxes & retirement.
          </p>
          <Link href="/signup" className="text-xs font-black text-indigo-400 hover:text-white transition-colors">
            Don't have an account? Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
