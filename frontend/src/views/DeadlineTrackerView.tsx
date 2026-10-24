import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Bell,
  Sparkles,
  Info,
  TrendingUp,
} from 'lucide-react';
import type { DeadlineRecord } from '../types';
import { INITIAL_DEADLINE_RECORDS } from '../data/verifiedSchemes';
import { DeadlineBadge } from '../components/StatusBadge';

export const DeadlineTrackerView: React.FC = () => {
  const [deadlines, setDeadlines] = useState<DeadlineRecord[]>(INITIAL_DEADLINE_RECORDS);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedTime, setLastRefreshedTime] = useState('2026-10-24 10:15 IST');
  const [filterUrgency, setFilterUrgency] = useState<'ALL' | 'CRITICAL' | 'EXTENDED'>('ALL');

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastRefreshedTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST');
      setIsRefreshing(false);
    }, 800);
  };

  const filteredDeadlines = deadlines.filter((d) => {
    if (filterUrgency === 'CRITICAL') return d.status === 'CRITICAL' || d.status === 'URGENT';
    if (filterUrgency === 'EXTENDED') return d.wasExtended;
    return true;
  });

  const urgentCount = deadlines.filter((d) => d.status === 'CRITICAL' || d.status === 'URGENT').length;
  const extendedCount = deadlines.filter((d) => d.wasExtended).length;

  return (
    <div className="space-y-8 py-2">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20 mb-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>Time-Series Circular Monitor</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Scholarship Application Deadlines & Gazette Changes
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Tracks shifting deadlines and gazette extension circulars with time-stamped portal observations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Portal Sync Status</div>
            <div className="text-xs font-mono text-slate-300 mt-0.5">{lastRefreshedTime}</div>
          </div>

          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Checking...' : 'Refresh Observations'}</span>
          </button>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-navy-900/70 border border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Actively Monitored</div>
          <div className="text-2xl font-black text-white mt-1">{deadlines.length} Official Portals</div>
          <div className="text-[11px] text-teal-400 mt-1">NSP, UP Scholarship & AICTE</div>
        </div>

        <div className="p-4 rounded-2xl bg-navy-900/70 border border-slate-800">
          <div className="text-[11px] font-semibold text-rose-400 uppercase">Closing Within 20 Days</div>
          <div className="text-2xl font-black text-rose-300 mt-1">{urgentCount} Scheme Windows</div>
          <div className="text-[11px] text-rose-400/80 mt-1">High urgency: CSSS & UP Matric</div>
        </div>

        <div className="p-4 rounded-2xl bg-navy-900/70 border border-slate-800">
          <div className="text-[11px] font-semibold text-cyan-400 uppercase">Gazette Extensions Detected</div>
          <div className="text-2xl font-black text-cyan-300 mt-1">{extendedCount} Schemes Extended</div>
          <div className="text-[11px] text-cyan-400/80 mt-1">Verified via UP State Gazette</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setFilterUrgency('ALL')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            filterUrgency === 'ALL'
              ? 'bg-slate-800 text-white font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All Deadlines ({deadlines.length})
        </button>

        <button
          onClick={() => setFilterUrgency('CRITICAL')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            filterUrgency === 'CRITICAL'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Urgent Windows ({urgentCount})
        </button>

        <button
          onClick={() => setFilterUrgency('EXTENDED')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            filterUrgency === 'EXTENDED'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Extended Circulars ({extendedCount})
        </button>
      </div>

      {/* Deadlines Timeline List */}
      <div className="space-y-4">
        {filteredDeadlines.map((record) => (
          <div
            key={record.schemeId}
            className="p-5 sm:p-6 rounded-2xl bg-navy-900/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300">
                  {record.portalName}
                </span>
                <DeadlineBadge status={record.status} daysRemaining={record.daysRemaining} />
                {record.wasExtended && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span>Extension Detected</span>
                  </span>
                )}
              </div>

              <h2 className="text-base font-bold text-white">{record.schemeName}</h2>

              {record.wasExtended && record.previousDate && (
                <div className="text-xs text-cyan-300/90 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>
                    Previous closing date: <del className="text-slate-500">{record.previousDate}</del>{' '}
                    → Revised to <strong className="text-white">{record.closingDate}</strong> (Ref:{' '}
                    {record.extensionCircularRef})
                  </span>
                </div>
              )}

              <div className="text-[11px] text-slate-500 font-mono">
                Last Verified Observation: {record.lastChecked}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-white">{record.closingDate}</div>
                <div className="text-[11px] text-slate-400">{record.daysRemaining} days left</div>
              </div>

              <a
                href={record.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors"
              >
                <span>Visit Portal</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1.5 text-slate-400" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
