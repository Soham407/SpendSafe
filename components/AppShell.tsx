'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Clock, Settings, Bell, DollarSign, PiggyBank } from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
  pendingCount?: number;
}

export const AppShell: React.FC<AppShellProps> = ({ children, pendingCount = 0 }) => {
  const pathname = usePathname();
  
  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/vaults', icon: PiggyBank, label: 'Vaults' },
    { href: '/history', icon: Clock, label: 'History' },
    { href: '/settings', icon: Settings, label: 'Setup' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 md:bg-indigo-950 md:py-8 transition-all duration-700">
      <div className="min-h-screen md:min-h-0 md:max-w-md mx-auto bg-white shadow-2xl relative flex flex-col md:rounded-[3.5rem] md:overflow-hidden md:h-[844px] border-8 border-transparent md:border-black ring-4 ring-indigo-900/10">
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-50 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-2xl shadow-xl shadow-indigo-100 rotate-3">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-black text-xl tracking-tight text-gray-900">SpendSafe</h1>
          </div>
          <button className="relative p-2.5 text-gray-500 hover:text-indigo-600 transition-all bg-gray-50 rounded-2xl hover:bg-indigo-50 active:scale-90">
            <Bell className="w-5 h-5" />
            {pendingCount > 0 && (
              <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
            )}
          </button>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 px-6 pt-6 pb-32 overflow-y-auto custom-scrollbar bg-white">
          {children}
        </main>

        {/* Bottom Nav */}
        <nav className="absolute bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-xl border-t border-gray-50 px-6 py-5 flex items-center justify-between pb-8 md:pb-5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link 
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1.5 transition-all ${isActive ? 'text-indigo-600 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Icon className="w-6 h-6 stroke-[2.5px]" />
                <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
