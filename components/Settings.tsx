
import React, { useState } from 'react';
import { UserSettings } from '../types';
import { ShieldCheck, LogOut, Smartphone, Calculator, Building2, ChevronRight, Lock, BellRing, MessageSquare, Mail, Play, Save, Check } from 'lucide-react';
import { SecuritySetup } from './SecuritySetup';

interface SettingsProps {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  onOpenTrust: () => void;
  onSimulateNudge: () => void;
  onLogout: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ settings, updateSettings, onOpenTrust, onSimulateNudge, onLogout }) => {
  const [is2FAShowing, setIs2FAShowing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notifChannel, setNotifChannel] = useState<'whatsapp' | 'email'>('whatsapp');

  const handleToggle2FA = () => {
    if (!settings.two_factor_enabled) {
      setIs2FAShowing(true);
    } else {
      updateSettings({ two_factor_enabled: false });
    }
  };

  const handle2FAComplete = () => {
    updateSettings({ two_factor_enabled: true });
    setIs2FAShowing(false);
  };

  const wrapUpdate = (update: Partial<UserSettings>) => {
    setIsSaving(true);
    updateSettings(update);
    setTimeout(() => setIsSaving(false), 800);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300 pb-20">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-indigo-600" />
          <h2 className="text-xl font-black text-gray-800 tracking-tight">Your Setup</h2>
        </div>
        <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest transition-opacity duration-500 ${isSaving ? 'text-indigo-600 opacity-100' : 'text-gray-300 opacity-0'}`}>
          <Save className="w-3 h-3" /> Auto-saved
        </div>
      </div>

      <section className="bg-white border border-gray-50 rounded-[2.5rem] p-6 shadow-sm space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
          <Building2 className="w-3 h-3" /> Connection Status
        </h3>
        <div className="flex items-center justify-between p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm text-indigo-900">Chase Business</p>
              <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest flex items-center gap-1">
                <Check className="w-2.5 h-2.5" /> Plaid Active
              </p>
            </div>
          </div>
          <button className="text-[10px] font-black text-indigo-600 bg-white px-4 py-2 rounded-xl border border-indigo-200 uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">
            Update
          </button>
        </div>
      </section>

      <section className="bg-white border border-gray-50 rounded-[2.5rem] p-6 shadow-sm space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
          <BellRing className="w-3 h-3" /> Nudge Preferences
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => setNotifChannel('whatsapp')}
            className={`flex flex-col items-center gap-2 p-4 rounded-3xl border transition-all ${notifChannel === 'whatsapp' ? 'bg-green-50 border-green-200 ring-2 ring-green-100' : 'bg-gray-50 border-gray-100 opacity-50'}`}
          >
            <MessageSquare className={`w-5 h-5 ${notifChannel === 'whatsapp' ? 'text-green-600' : 'text-gray-400'}`} />
            <span className="text-[10px] font-black uppercase tracking-widest">WhatsApp</span>
          </button>
          <button 
            onClick={() => setNotifChannel('email')}
            className={`flex flex-col items-center gap-2 p-4 rounded-3xl border transition-all ${notifChannel === 'email' ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-100' : 'bg-gray-50 border-gray-100 opacity-50'}`}
          >
            <Mail className={`w-5 h-5 ${notifChannel === 'email' ? 'text-blue-600' : 'text-gray-400'}`} />
            <span className="text-[10px] font-black uppercase tracking-widest">Email</span>
          </button>
        </div>

        <button 
          onClick={onSimulateNudge}
          className="w-full py-3 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all"
        >
          <Play className="w-3 h-3" /> Send Test Nudge
        </button>
      </section>

      <section className="bg-white border border-gray-50 rounded-[2.5rem] p-6 shadow-sm space-y-6">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
          <Calculator className="w-3 h-3" /> Allocation Engine
        </h3>
        
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Tax Reserve</label>
              <span className="text-indigo-600 font-black bg-indigo-50 px-3 py-1 rounded-full">{(settings.tax_rate_percentage * 100).toFixed(0)}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="50" 
              step="1"
              value={settings.tax_rate_percentage * 100}
              onChange={(e) => wrapUpdate({ tax_rate_percentage: parseInt(e.target.value) / 100 })}
              className="w-full h-3 bg-gray-100 rounded-full appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Retirement</label>
              <span className="text-indigo-600 font-black bg-indigo-50 px-3 py-1 rounded-full">{(settings.retirement_rate_percentage * 100).toFixed(0)}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="30" 
              step="1"
              value={settings.retirement_rate_percentage * 100}
              onChange={(e) => wrapUpdate({ retirement_rate_percentage: parseInt(e.target.value) / 100 })}
              className="w-full h-3 bg-gray-100 rounded-full appearance-none cursor-pointer accent-indigo-600"
            />
          </div>
        </div>
      </section>

      <section className="bg-white border border-gray-50 rounded-[2.5rem] p-6 shadow-sm space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
          <Lock className="w-3 h-3" /> Security
        </h3>
        
        <div className="flex items-center justify-between group cursor-pointer" onClick={handleToggle2FA}>
          <div>
            <p className="font-bold text-sm text-gray-900 group-hover:text-indigo-600 transition-colors">Two-Factor Auth</p>
            <p className="text-[10px] text-gray-400 font-medium italic">Requirement from Masterplan Section 6</p>
          </div>
          <div 
            className={`w-14 h-7 rounded-full transition-all flex items-center px-1.5 ${settings.two_factor_enabled ? 'bg-indigo-600 justify-end' : 'bg-gray-100 justify-start'}`}
          >
            <div className="w-4 h-4 bg-white rounded-full shadow-lg"></div>
          </div>
        </div>

        <div className="h-px bg-gray-50"></div>

        <button 
          onClick={onOpenTrust}
          className="w-full flex items-center justify-between group"
        >
          <div className="text-left">
            <p className="font-bold text-sm text-gray-900 group-hover:text-indigo-600 transition-colors">Privacy & Trust Center</p>
            <p className="text-[10px] text-gray-400 font-medium">Enterprise-Grade Design Principles</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-600 transition-all group-hover:translate-x-1" />
        </button>
      </section>

      <div className="space-y-4 pt-4">
        <button 
          onClick={onLogout}
          className="w-full py-5 border border-red-100 rounded-[2rem] text-red-500 font-black bg-white hover:bg-red-50 transition-all flex items-center justify-center gap-3 uppercase text-xs tracking-[0.2em]"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>

        <div className="text-center px-6">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest opacity-30">
            v1.0 Bootstrapper Edition
          </p>
        </div>
      </div>

      <SecuritySetup 
        isOpen={is2FAShowing} 
        onClose={() => setIs2FAShowing(false)} 
        onComplete={handle2FAComplete}
      />
    </div>
  );
};
