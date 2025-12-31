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
  const [minimumBuffer, setMinimumBuffer] = useState(1000);
  const [notificationPref, setNotificationPref] = useState<'sms' | 'email' | 'both'>('email');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
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
          setProfile(profile);
          setTaxRate(profile.tax_rate_percentage * 100);
          setRetirementRate(profile.retirement_rate_percentage * 100);
          setMinimumBuffer(profile.minimum_buffer || 1000);
          setNotificationPref(profile.notification_preference || 'email');
          setPhoneNumber(profile.phone_number || "");
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
        minimum_buffer: minimumBuffer,
        notification_preference: notificationPref,
        phone_number: phoneNumber,
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
                <span>30%</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Minimum Bank Buffer
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-gray-400 text-xs">$</span>
                  <input
                    type="number"
                    value={minimumBuffer}
                    onChange={(e) => setMinimumBuffer(Number(e.target.value))}
                    className="w-20 bg-gray-50 border-none text-right text-sm font-black text-indigo-600 focus:ring-0 p-0"
                  />
                </div>
              </div>
              <p className="text-[9px] text-gray-300 font-bold -mt-2 mb-3">
                We'll always keep this much "Safe" regardless of taxes.
              </p>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white border-2 border-gray-50 p-6 rounded-[2.5rem] shadow-sm">
          <h2 className="text-lg font-black flex items-center gap-2 mb-4 text-gray-900">
            <Bell className="w-5 h-5 text-indigo-600" />
            Notifications
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black mb-2 text-gray-400 uppercase tracking-widest">Phone Number (for SMS Nudges)</label>
              <input 
                type="tel" 
                className="input" 
                placeholder="+11234567890" 
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>

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
        </div>

        {/* Security */}
        <div className="bg-white border-2 border-gray-50 p-6 rounded-[2.5rem] shadow-sm">
          <h2 className="text-lg font-black flex items-center gap-2 mb-4 text-gray-900">
            <Shield className="w-5 h-5 text-indigo-600" />
            Security
          </h2>
          
          <button 
            onClick={async () => {
              const newState = !profile?.two_factor_enabled;
              const { error } = await supabase
                .from('profiles')
                .update({ two_factor_enabled: newState })
                .eq('id', user.id);
              if (!error) {
                setProfile({ ...profile, two_factor_enabled: newState });
                alert(newState ? "2FA Enabled! (Demo Mode)" : "2FA Disabled");
              }
            }}
            className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl transition-colors ${profile?.two_factor_enabled ? 'bg-emerald-100' : 'bg-gray-100 group-hover:bg-indigo-100'}`}>
                <Lock className={`w-4 h-4 ${profile?.two_factor_enabled ? 'text-emerald-600' : 'text-gray-400 group-hover:text-indigo-600'}`} />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-800">Two-Factor Authentication</p>
                <p className="text-xs text-gray-400 font-medium">
                  {profile?.two_factor_enabled ? 'Currently Enabled' : 'Add an extra layer of security'}
                </p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${profile?.two_factor_enabled ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
              {profile?.two_factor_enabled ? 'ON' : 'OFF'}
            </div>
          </button>
        </div>

        {/* Growth */}
        <div className="bg-indigo-600 p-6 rounded-[2.5rem] shadow-xl shadow-indigo-100 text-white overflow-hidden relative">
          <Sparkles className="absolute top-[-10px] right-[-10px] w-24 h-24 opacity-10" />
          <h2 className="text-lg font-black flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5" />
            Spread the Wealth
          </h2>
          <p className="text-indigo-100 text-xs font-medium mb-6">
            Invite a friend to SpendSafe and help them avoid tax season panic.
          </p>
          <button 
            onClick={() => {
              navigator.clipboard.writeText(`Hey! Check out SpendSafe - it's the financial copilot I use for my freelance income: ${window.location.origin}`);
              alert("Referral link copied to clipboard! 🚀");
            }}
            className="w-full bg-white text-indigo-600 font-black py-4 rounded-[1.5rem] flex items-center justify-center gap-2 hover:bg-indigo-50 transition-all active:scale-95"
          >
            Copy Referral Link
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
