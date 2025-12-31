
import React, { useState } from 'react';
import { TrendingUp, Users, MessageSquare, Youtube, Facebook, Star, Flame, Target, ChevronRight, BarChart, Info, DollarSign, Zap, Layers, PieChart } from 'lucide-react';
import { formatCurrency } from '../utils';

export const Research: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'market' | 'strategy'>('market');

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-xl">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-black text-gray-800 tracking-tight">Market Intelligence</h2>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('market')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'market' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Data
          </button>
          <button 
            onClick={() => setActiveTab('strategy')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'strategy' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Strategy
          </button>
        </div>
      </div>

      {activeTab === 'market' ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Main Chart Card */}
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-6 shadow-sm overflow-hidden relative group">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Keyword Volume</h3>
                </div>
                <p className="font-bold text-gray-900 text-lg">Retirement savings plan</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-indigo-600">8.1K</p>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-lg">+179% Growth</p>
              </div>
            </div>

            {/* SVG Chart Visualization */}
            <div className="h-40 w-full mb-4 relative">
              <svg viewBox="0 0 400 120" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,100 C40,95 60,98 80,85 S140,90 160,70 S220,60 240,40 S320,50 360,20 L400,5"
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="4"
                  strokeLinecap="round"
                  className="drop-shadow-lg"
                />
                <path
                  d="M0,100 C40,95 60,98 80,85 S140,90 160,70 S220,60 240,40 S320,50 360,20 L400,5 V120 H0 Z"
                  fill="url(#chartGradient)"
                />
                {/* Data Points */}
                <circle cx="80" cy="85" r="4" fill="white" stroke="#4f46e5" strokeWidth="2" />
                <circle cx="240" cy="40" r="4" fill="white" stroke="#4f46e5" strokeWidth="2" />
                <circle cx="360" cy="20" r="4" fill="white" stroke="#4f46e5" strokeWidth="2" />
              </svg>
            </div>
            <div className="flex justify-between text-[9px] font-black text-gray-300 uppercase tracking-widest px-1">
              <span>2022</span>
              <span>2023</span>
              <span>2024</span>
              <span>2025</span>
            </div>
          </div>

          {/* Business Fit Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-[2rem] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Target className="w-16 h-16 text-emerald-600" />
              </div>
              <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Opportunity</p>
              <div className="flex items-end gap-1 mb-2">
                <span className="text-3xl font-black text-emerald-900 leading-none">9</span>
                <span className="text-[9px] font-bold text-emerald-600 mb-1">/10</span>
              </div>
              <p className="text-[10px] font-bold text-emerald-700">Exceptional</p>
            </div>
            <div className="bg-red-50 border border-red-100 p-5 rounded-[2rem] relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                <Flame className="w-16 h-16 text-red-600" />
              </div>
              <p className="text-[9px] font-black text-red-600 uppercase tracking-widest mb-1">Pain Level</p>
              <div className="flex items-end gap-1 mb-2">
                <span className="text-3xl font-black text-red-900 leading-none">9</span>
                <span className="text-[9px] font-bold text-red-600 mb-1">/10</span>
              </div>
              <p className="text-[10px] font-bold text-red-700">Severe</p>
            </div>
          </div>

          {/* Community Signals */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
              <Users className="w-3 h-3" /> Community Signals
            </h3>
            <div className="space-y-3">
              {[
                { icon: <MessageSquare className="w-4 h-4 text-orange-500" />, platform: 'Reddit', count: '2.5M+ members', score: '8/10', color: 'bg-orange-50' },
                { icon: <Facebook className="w-4 h-4 text-blue-600" />, platform: 'Facebook', count: '150K+ in groups', score: '7/10', color: 'bg-blue-50' },
                { icon: <Youtube className="w-4 h-4 text-red-600" />, platform: 'YouTube', count: '12 channels', score: '7/10', color: 'bg-red-50' }
              ].map((item, i) => (
                <div key={i} className="bg-white border border-gray-50 p-4 rounded-3xl flex items-center justify-between shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`${item.color} p-3 rounded-2xl`}>{item.icon}</div>
                    <div>
                      <p className="text-sm font-black text-gray-800">{item.platform}</p>
                      <p className="text-[10px] text-gray-400 font-bold">{item.count}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-black text-gray-900">{item.score}</span>
                    <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest">Relevance</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Market Narrative */}
          <section className="bg-indigo-950 rounded-[2.5rem] p-8 text-white space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-indigo-800 p-3 rounded-2xl">
                <Info className="w-6 h-6 text-indigo-300" />
              </div>
              <div>
                <h3 className="text-lg font-black leading-none mb-2">Why Now?</h3>
                <p className="text-xs font-medium text-indigo-200 leading-relaxed">
                  The gig economy is rapidly expanding, with freelancers projected to make up over half of the US workforce by 2027.
                </p>
              </div>
            </div>
            <div className="h-px bg-indigo-800/50"></div>
            <div className="flex items-start gap-4">
              <div className="bg-indigo-800 p-3 rounded-2xl">
                <Target className="w-6 h-6 text-indigo-300" />
              </div>
              <div>
                <h3 className="text-lg font-black leading-none mb-2">The Market Gap</h3>
                <p className="text-xs font-medium text-indigo-200 leading-relaxed">
                  Current solutions fail to integrate invoicing directly with savings and retirement planning, leaving a significant portion of the workforce underserved.
                </p>
              </div>
            </div>
          </section>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Offer Ladder */}
          <section className="bg-gray-900 rounded-[3rem] p-8 text-white space-y-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black">Offer Stack</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Value Ladder</p>
              </div>
              <Layers className="w-6 h-6 text-gray-500" />
            </div>

            <div className="space-y-4 relative">
              {/* Connecting Line */}
              <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-gray-700"></div>

              {[
                { step: 1, label: 'LEAD MAGNET', title: 'Freelancer Finance Guide', price: 'FREE', desc: 'Comprehensive eBook offering insights into financial management.', icon: <Star className="w-4 h-4" />, color: 'bg-indigo-500' },
                { step: 2, label: 'FRONTEND', title: 'Starter Subscription', price: '$15/mo', desc: 'Basic access to the platform for automated savings and tax management.', icon: <Zap className="w-4 h-4" />, color: 'bg-indigo-600' },
                { step: 3, label: 'CORE', title: 'Pro Subscription Plan', price: '$25/mo', desc: 'Advanced analytics, advisors, and tax-loss harvesting features.', icon: <DollarSign className="w-4 h-4" />, color: 'bg-indigo-700' }
              ].map((item, i) => (
                <div key={i} className="relative pl-12 bg-white/5 border border-white/10 p-5 rounded-[2rem] hover:bg-white/10 transition-colors group">
                  <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 ${item.color} rounded-full flex items-center justify-center border-4 border-gray-900 z-10 shadow-lg group-hover:scale-110 transition-transform`}>
                    {item.icon}
                  </div>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[9px] font-black text-indigo-300 uppercase tracking-widest">{item.label}</span>
                    <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] font-bold">{item.price}</span>
                  </div>
                  <h4 className="font-bold text-lg leading-tight mb-1">{item.title}</h4>
                  <p className="text-xs text-gray-400 leading-snug">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Framework Fits */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
              <PieChart className="w-3 h-3" /> Framework Fit
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Value Equation */}
              <div className="bg-white border border-gray-100 p-6 rounded-[2.5rem] shadow-sm flex flex-col items-center justify-center text-center">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Value Equation</p>
                <div className="w-20 h-20 rounded-full border-8 border-orange-500 flex items-center justify-center mb-2 shadow-lg shadow-orange-100">
                  <span className="text-3xl font-black text-gray-900">6</span>
                </div>
                <p className="text-xs font-bold text-orange-500 uppercase tracking-wider">Good</p>
                <button className="mt-4 text-[9px] font-black text-indigo-600 flex items-center gap-1 hover:gap-2 transition-all">
                  Analyze <ChevronRight className="w-2 h-2" />
                </button>
              </div>

              {/* Market Matrix */}
              <div className="bg-white border border-gray-100 p-6 rounded-[2.5rem] shadow-sm flex flex-col items-center">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Market Matrix</p>
                <div className="grid grid-cols-2 gap-1 w-full mb-2">
                  <div className="bg-gray-50 rounded-lg h-8 flex items-center justify-center"><span className="text-[6px] font-bold text-gray-400">NOVELTY</span></div>
                  <div className="bg-yellow-100 rounded-lg h-8 flex items-center justify-center border border-yellow-200"><span className="text-[6px] font-bold text-yellow-700">KING</span></div>
                  <div className="bg-gray-50 rounded-lg h-8 flex items-center justify-center"><span className="text-[6px] font-bold text-gray-400">LOW</span></div>
                  <div className="bg-gray-50 rounded-lg h-8 flex items-center justify-center"><span className="text-[6px] font-bold text-gray-400">PLAY</span></div>
                </div>
                <p className="text-xs font-bold text-gray-900 text-center leading-tight">Category King Potential</p>
                <button className="mt-4 text-[9px] font-black text-indigo-600 flex items-center gap-1 hover:gap-2 transition-all">
                  View Matrix <ChevronRight className="w-2 h-2" />
                </button>
              </div>
            </div>

            {/* A.C.P. Framework */}
            <div className="bg-white border border-gray-100 p-6 rounded-[2.5rem] shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">The A.C.P. Framework</p>
                <span className="text-xs font-black text-emerald-600">29/30</span>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Audience', score: '8/10', fill: 'w-[80%]' },
                  { label: 'Community', score: '9/10', fill: 'w-[90%]' },
                  { label: 'Product', score: '9/10', fill: 'w-[90%]' }
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-[10px] font-bold text-gray-700 mb-1">
                      <span>{item.label}</span>
                      <span>{item.score}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full bg-emerald-500 rounded-full ${item.fill}`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
