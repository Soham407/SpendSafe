
import React, { useState } from 'react';
import { Search, Filter, CheckCircle2, History as HistoryIcon, ShieldAlert, Ban, Clock, Download, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { IncomeEvent, Status } from '../types';
import { formatCurrency, formatDate } from '@/lib/utils';

interface HistoryProps {
  incomeEvents: IncomeEvent[];
}

export const History: React.FC<HistoryProps> = ({ incomeEvents }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<Status | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | '7d' | '30d' | '90d'>('all');
  const [isExporting, setIsExporting] = useState(false);
  const [showExportSuccess, setShowExportSuccess] = useState(false);
  
  const filteredEvents = incomeEvents.filter(e => {
    const matchesSearch = e.original_description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || e.status === filterStatus;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const eventDate = new Date(e.detected_at).getTime();
      const now = new Date().getTime();
      const diffDays = (now - eventDate) / (1000 * 3600 * 24);
      if (dateFilter === '7d') matchesDate = diffDays <= 7;
      else if (dateFilter === '30d') matchesDate = diffDays <= 30;
      else if (dateFilter === '90d') matchesDate = diffDays <= 90;
    }

    return matchesSearch && matchesStatus && matchesDate;
  }).sort((a, b) => new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime());

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setShowExportSuccess(true);
      setTimeout(() => setShowExportSuccess(false), 3000);
    }, 1500);
  };

  const getStatusIcon = (status: Status) => {
    switch (status) {
      case 'reconciled': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'pending_action': return <ShieldAlert className="w-5 h-5 text-red-500" />;
      case 'ignored': return <Ban className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'reconciled': return 'text-green-500 bg-green-50';
      case 'pending_action': return 'text-red-500 bg-red-50';
      case 'ignored': return 'text-gray-400 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HistoryIcon className="w-5 h-5 text-indigo-600" />
          <h2 className="text-xl font-black text-gray-800 tracking-tight">Wealth History</h2>
        </div>
        <button 
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-50"
        >
          {isExporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />} 
          {isExporting ? 'Generating...' : 'Export Pro'}
        </button>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search income sources..." 
            className="w-full pl-11 pr-4 py-4 bg-white border border-gray-100 rounded-[1.5rem] focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm text-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {(['all', 'pending_action', 'reconciled', 'ignored'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                  filterStatus === status 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' 
                    : 'bg-white text-gray-400 border-gray-100 hover:border-indigo-200'
                }`}
              >
                {status === 'all' ? 'All Status' : status.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {(['all', '7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateFilter(range)}
                className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                  dateFilter === range 
                    ? 'bg-indigo-900 text-white border-indigo-900 shadow-lg' 
                    : 'bg-white text-gray-400 border-gray-100 hover:border-indigo-200'
                }`}
              >
                <CalendarIcon className="w-3 h-3" />
                {range === 'all' ? 'Any Time' : `Last ${range.replace('d', '')} Days`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filteredEvents.length > 0 ? (
          filteredEvents.map(event => (
            <div key={event.id} className="bg-white border border-gray-50 p-5 rounded-[2rem] flex items-center justify-between shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${getStatusColor(event.status).split(' ')[1]}`}>
                  {getStatusIcon(event.status)}
                </div>
                <div className="max-w-[140px] md:max-w-none">
                  <h4 className="font-bold text-sm text-gray-900 truncate">{event.original_description}</h4>
                  <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1 uppercase tracking-tighter">
                    <Clock className="w-3 h-3" /> {formatDate(event.detected_at)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-sm text-indigo-600">+{formatCurrency(event.amount)}</p>
                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${getStatusColor(event.status).split(' ')[0]}`}>
                  {event.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-100">
            <Search className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-xs font-bold text-gray-400">No transactions match your filters.</p>
          </div>
        )}
      </div>

      {showExportSuccess && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-indigo-950 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom duration-300 z-[100]">
          <Download className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">ledger_export.csv ready</span>
        </div>
      )}
    </div>
  );
};
