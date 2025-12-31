
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { History } from './components/History';
import { Settings } from './components/Settings';
import { Vaults } from './components/Vaults';
import { Onboarding } from './components/Onboarding';
import { TrustCenter } from './components/TrustCenter';
import { ManualEntryModal } from './components/ManualEntryModal';
import { ConfirmMoveView } from './components/ConfirmMoveView';
import { Research } from './components/Research';
import { Auth } from './components/Auth';
import { Page, UserSettings, IncomeEvent, RecommendedMove } from './types';
import { MessageSquare, ArrowRight, Sparkles } from 'lucide-react';
import { formatCurrency } from './utils';

const STORAGE_KEY = '1099_wealth_builder_settings';
const AUTH_KEY = '1099_auth_session';

const INITIAL_SETTINGS: UserSettings = {
  tax_rate_percentage: 0.30,
  retirement_rate_percentage: 0.10,
  two_factor_enabled: false,
  bank_connected: false
};

const INITIAL_EVENTS: IncomeEvent[] = [
  {
    id: 'ev-1',
    amount: 4200,
    original_description: 'Invoice Payment: Client X',
    detected_at: new Date(Date.now() - 86400000).toISOString(),
    status: 'pending_action'
  },
  {
    id: 'ev-2',
    amount: 1500,
    original_description: 'Consulting: Project Blue',
    detected_at: new Date(Date.now() - 172800000).toISOString(),
    status: 'reconciled'
  },
  {
    id: 'ev-3',
    amount: 320,
    original_description: 'Workshop Refund',
    detected_at: new Date(Date.now() - 345600000).toISOString(),
    status: 'ignored'
  }
];

const calculateMoves = (event: IncomeEvent, settings: UserSettings): RecommendedMove[] => {
  if (event.status === 'ignored') return [];
  return [
    {
      id: `m-tax-${event.id}`,
      income_event_id: event.id,
      bucket_name: 'Tax',
      amount_to_move: event.amount * settings.tax_rate_percentage,
      is_completed: event.status === 'reconciled'
    },
    {
      id: `m-ret-${event.id}`,
      income_event_id: event.id,
      bucket_name: 'Retirement',
      amount_to_move: event.amount * settings.retirement_rate_percentage,
      is_completed: event.status === 'reconciled'
    }
  ];
};

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page | 'trust_center' | 'confirm_move'>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem(AUTH_KEY) === 'true');
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [incomeEvents, setIncomeEvents] = useState<IncomeEvent[]>(INITIAL_EVENTS);
  const [bankBalance, setBankBalance] = useState<number>(10000);
  const [isManualModalOpen, setManualModalOpen] = useState(false);
  const [showNudge, setShowNudge] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    localStorage.setItem(AUTH_KEY, isAuthenticated.toString());
  }, [settings, isAuthenticated]);

  const recommendedMoves = useMemo(() => 
    incomeEvents.flatMap(event => calculateMoves(event, settings)),
    [incomeEvents, settings]
  );

  const vaultTotals = useMemo(() => {
    const tax = recommendedMoves
      .filter(m => m.bucket_name === 'Tax' && m.is_completed)
      .reduce((s, m) => s + m.amount_to_move, 0);
    const retirement = recommendedMoves
      .filter(m => m.bucket_name === 'Retirement' && m.is_completed)
      .reduce((s, m) => s + m.amount_to_move, 0);
    return { tax, retirement };
  }, [recommendedMoves]);

  // Phase 2 Simulation: "The Watcher"
  const handleSyncBank = useCallback(() => {
    setIsSyncing(true);
    setTimeout(() => {
      const newAmount = 1200 + Math.random() * 3000;
      const newEvent: IncomeEvent = {
        id: `plaid-${Date.now()}`,
        amount: Math.round(newAmount),
        original_description: 'Plaid: Incoming Transfer',
        detected_at: new Date().toISOString(),
        status: 'pending_action'
      };
      setIncomeEvents(prev => [newEvent, ...prev]);
      setBankBalance(prev => prev + newAmount);
      setIsSyncing(false);
      setShowNudge(true);
    }, 2000);
  }, []);

  const handleReconcile = useCallback((eventId: string) => {
    setIncomeEvents(prev => prev.map(e => 
      e.id === eventId ? { ...e, status: 'reconciled' } : e
    ));

    if (window.confetti) {
      window.confetti({
        particleCount: 200,
        spread: 160,
        origin: { y: 0.6 },
        colors: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#ffffff']
      });
    }
  }, []);

  const handleIgnore = useCallback((eventId: string) => {
    setIncomeEvents(prev => prev.map(e => 
      e.id === eventId ? { ...e, status: 'ignored' } : e
    ));
  }, []);

  const handleAddManualIncome = (data: { amount: number; description: string; date: string }) => {
    const newEvent: IncomeEvent = {
      id: `manual-${Date.now()}`,
      amount: data.amount,
      original_description: data.description,
      detected_at: data.date,
      status: 'pending_action'
    };
    setIncomeEvents(prev => [newEvent, ...prev]);
    setBankBalance(prev => prev + data.amount);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const handleNudgeClick = () => {
    const pending = incomeEvents.find(e => e.status === 'pending_action');
    if (pending) {
      setSelectedEventId(pending.id);
      setActivePage('confirm_move');
    }
    setShowNudge(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setSettings(prev => ({ ...prev, bank_connected: false }));
    localStorage.clear();
    window.location.reload();
  };

  const pendingCount = incomeEvents.filter(e => e.status === 'pending_action').length;

  if (!isAuthenticated) {
    return <Auth onLogin={() => setIsAuthenticated(true)} />;
  }

  if (!settings.bank_connected) {
    return <Onboarding onConnect={() => handleUpdateSettings({ bank_connected: true })} />;
  }

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <Dashboard 
            settings={settings}
            incomeEvents={incomeEvents}
            recommendedMoves={recommendedMoves}
            onReconcile={handleReconcile}
            onIgnore={handleIgnore}
            onOpenManual={() => setManualModalOpen(true)}
            onSyncBank={handleSyncBank}
            bankBalance={bankBalance}
            isSyncing={isSyncing}
          />
        );
      case 'vaults':
        return (
          <Vaults 
            taxSaved={vaultTotals.tax} 
            retirementSaved={vaultTotals.retirement} 
            moves={recommendedMoves} 
            incomeEvents={incomeEvents}
          />
        );
      case 'research':
        return <Research />;
      case 'history':
        return <History incomeEvents={incomeEvents} />;
      case 'settings':
        return (
          <Settings 
            settings={settings} 
            updateSettings={handleUpdateSettings} 
            onOpenTrust={() => setActivePage('trust_center')}
            onSimulateNudge={() => setShowNudge(true)}
            onLogout={handleLogout}
          />
        );
      case 'trust_center':
        return <TrustCenter onBack={() => setActivePage('settings')} />;
      case 'confirm_move':
        const event = incomeEvents.find(e => e.id === selectedEventId);
        const moves = recommendedMoves.filter(m => m.income_event_id === selectedEventId);
        if (!event) return null;
        return (
          <ConfirmMoveView 
            event={event} 
            moves={moves} 
            onConfirm={handleReconcile} 
            onBack={() => setActivePage('dashboard')} 
          />
        );
      default:
        return null;
    }
  };

  const activeNudge = incomeEvents.find(e => e.status === 'pending_action');
  const taxMove = activeNudge ? activeNudge.amount * settings.tax_rate_percentage : 0;

  return (
    <>
      {showNudge && activeNudge && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 w-[calc(100%-40px)] max-w-sm z-[200] animate-in slide-in-from-top duration-700">
          <button 
            onClick={handleNudgeClick}
            className="w-full bg-white/95 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.2)] border border-gray-100 flex items-start gap-4 text-left hover:bg-white transition-all active:scale-95 group"
          >
            <div className="bg-green-500 p-3 rounded-2xl shadow-lg shadow-green-100 group-hover:rotate-12 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <p className="text-[10px] font-black text-green-600 uppercase tracking-[0.2em]">High Five! Nudge</p>
                <span className="text-[10px] text-gray-300 font-bold">Just Now</span>
              </div>
              <p className="text-sm font-black text-gray-900 leading-tight">You just got paid {formatCurrency(activeNudge.amount)}.</p>
              <p className="text-[11px] text-gray-500 font-bold mt-1">
                <span className="text-red-600">Action Required:</span> Please move {formatCurrency(taxMove)} to your Tax Savings now to stay safe.
              </p>
              <p className="text-[9px] text-indigo-500 font-black uppercase tracking-widest mt-2 flex items-center gap-1">
                Click here to confirm <ArrowRight className="w-2 h-2" />
              </p>
            </div>
          </button>
        </div>
      )}

      <Layout 
        activePage={activePage === 'trust_center' || activePage === 'confirm_move' ? 'settings' : activePage as Page} 
        setActivePage={(p) => setActivePage(p)}
        pendingCount={pendingCount}
      >
        {renderContent()}
      </Layout>
      <ManualEntryModal 
        isOpen={isManualModalOpen} 
        onClose={() => setManualModalOpen(false)}
        onSubmit={handleAddManualIncome}
      />
    </>
  );
};

export default App;
