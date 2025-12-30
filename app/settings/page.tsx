"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Save, Loader2, Bell, Percent, Shield, LogOut, ChevronRight, Sparkles, Lock } from "lucide-react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { TrustCenter } from "@/components/TrustCenter";

export default function SettingsPage() {
  const [taxRate, setTaxRate] = useState(30);
  const [retirementRate, setRetirementRate] = useState(10);
  const [notificationPref, setNotificationPref] = useState<'sms' | 'email' | 'both'>('email');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showTrustCenter, setShowTrustCenter] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          setTaxRate(profile.tax_rate_percentage * 100);
          setRetirementRate(profile.retirement_rate_percentage * 100);
          setNotificationPref(profile.notification_preference || 'email');
        }
      }
    };
    fetchProfile();
  }, [supabase]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    setSaved(false);
    
    const { error } = await supabase
      .from('profiles')
      .update({
        tax_rate_percentage: taxRate / 100,
        retirement_rate_percentage: retirementRate / 100,
        notification_preference: notificationPref,
      })
      .eq('id', user.id);

    setLoading(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <AppShell>
      <div className="space-y-6 animate-in pb-12">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-gray-900">Settings</h1>
          <p className="text-sm text-gray-400 font-medium">Customize your SpendSafe experience</p>
        </div>

        {/* Tax & Retirement Rates */}
        <div className="bg-white border-2 border-gray-50 p-6 rounded-[2.5rem] shadow-sm">
          <h2 className="text-lg font-black flex items-center gap-2 mb-4 text-gray-900">
            <Percent className="w-5 h-5 text-indigo-600" />
            Savings Rates
          </h2>
          <p className="text-xs text-gray-400 font-medium mb-6">
            Adjust based on your CPA's guidance. Default is 30% for taxes and 10% for retirement.
          </p>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Tax Rate
                </label>
                <span className="bg-red-100 text-red-600 text-sm font-black px-3 py-1 rounded-xl">
                  {taxRate}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
              <div className="flex justify-between text-[10px] text-gray-300 font-bold mt-1">
                <span>10%</span>
                <span>50%</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Retirement Rate
                </label>
                <span className="bg-indigo-100 text-indigo-600 text-sm font-black px-3 py-1 rounded-xl">
                  {retirementRate}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={retirementRate}
                onChange={(e) => setRetirementRate(Number(e.target.value))}
                className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-gray-300 font-bold mt-1">
                <span>0%</span>
                <span>30%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white border-2 border-gray-50 p-6 rounded-[2.5rem] shadow-sm">
          <h2 className="text-lg font-black flex items-center gap-2 mb-4 text-gray-900">
            <Bell className="w-5 h-5 text-indigo-600" />
            Notifications
          </h2>

          <div className="space-y-3">
            {(['email', 'sms', 'both'] as const).map((pref) => (
              <label
                key={pref}
                className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  notificationPref === pref
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="notification"
                    value={pref}
                    checked={notificationPref === pref}
                    onChange={() => setNotificationPref(pref)}
                    className="accent-indigo-600 w-4 h-4"
                  />
                  <span className="font-bold text-gray-800 capitalize">
                    {pref === 'both' ? 'SMS & Email' : pref.toUpperCase()}
                  </span>
                </div>
                {notificationPref === pref && (
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="bg-white border-2 border-gray-50 p-6 rounded-[2.5rem] shadow-sm">
          <h2 className="text-lg font-black flex items-center gap-2 mb-4 text-gray-900">
            <Shield className="w-5 h-5 text-indigo-600" />
            Security
          </h2>
          
          <button className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all group">
            <div className="flex items-center gap-3">
              <div className="bg-gray-100 p-2 rounded-xl group-hover:bg-indigo-100 transition-colors">
                <Lock className="w-4 h-4 text-gray-400 group-hover:text-indigo-600" />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-800">Two-Factor Authentication</p>
                <p className="text-xs text-gray-400 font-medium">Add an extra layer of security</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-500" />
          </button>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={loading}
          className={`w-full py-5 font-black rounded-[1.5rem] flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${
            saved 
              ? 'bg-emerald-600 text-white shadow-emerald-100' 
              : 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700'
          }`}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : saved ? (
            <>✓ Saved!</>
          ) : (
            <><Save className="w-5 h-5" /> Save Changes</>
          )}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full py-4 bg-gray-100 text-gray-500 font-bold rounded-[1.5rem] flex items-center justify-center gap-2 hover:bg-red-50 hover:text-red-500 transition-all"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>

        <p className="text-[10px] text-gray-300 text-center font-medium italic pt-2">
          This is a planning tool, not tax advice. Consult a CPA for personalized guidance.
        </p>
        
        {/* Trust Center Trigger */}
        <button 
          onClick={() => setShowTrustCenter(true)}
          className="w-full text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-600 transition-colors pt-4"
        >
          View Trust Center & Privacy
        </button>
      </div>

      {showTrustCenter && (
        <div className="fixed inset-0 z-[100]">
          <TrustCenter onBack={() => setShowTrustCenter(false)} />
        </div>
      )}
    </AppShell>
  );
}
