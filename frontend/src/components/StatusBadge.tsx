import React from 'react';
import { ShieldCheck, Database, FlaskConical, AlertCircle, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import type { VerificationStatus, DeadlineUrgency, EligibilityVerdict } from '../types';

interface StatusBadgeProps {
  status: VerificationStatus;
  size?: 'xs' | 'sm' | 'md';
}

export const ProvenanceBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const sizeClasses =
    size === 'xs'
      ? 'text-[10px] px-1.5 py-0.2 rounded font-medium'
      : size === 'sm'
      ? 'text-[11px] px-2 py-0.5 rounded-md font-medium'
      : 'text-xs px-2.5 py-1 rounded-md font-medium';

  switch (status) {
    case 'VERIFIED_OFFICIAL':
      return (
        <span
          className={`inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 ${sizeClasses}`}
          title="Verified against official government gazette / portal"
        >
          <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
          <span>Official Source</span>
        </span>
      );
    case 'CACHED_PORTAL':
      return (
        <span
          className={`inline-flex items-center gap-1 bg-sky-500/10 text-sky-300 border border-sky-500/25 ${sizeClasses}`}
          title="Cached from recent portal sync"
        >
          <Database className="w-3 h-3 text-sky-400 shrink-0" />
          <span>Cached Portal</span>
        </span>
      );
    case 'DEMO_DATA':
      return (
        <span
          className={`inline-flex items-center gap-1 bg-amber-500/10 text-amber-300 border border-amber-500/25 ${sizeClasses}`}
          title="Demonstration data for evaluation"
        >
          <FlaskConical className="w-3 h-3 text-amber-400 shrink-0" />
          <span>Demo Data</span>
        </span>
      );
    case 'UNVERIFIED':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1 bg-slate-800/80 text-slate-400 border border-slate-700/80 ${sizeClasses}`}
          title="Extracted from public web; awaiting confirmation"
        >
          <AlertCircle className="w-3 h-3 text-slate-400 shrink-0" />
          <span>Unverified</span>
        </span>
      );
  }
};

export const DeadlineBadge: React.FC<{
  status: DeadlineUrgency;
  daysRemaining?: number;
  size?: 'xs' | 'sm';
}> = ({ status, daysRemaining, size = 'sm' }) => {
  const cls = size === 'xs' ? 'text-[10px] px-1.5 py-0.2 rounded' : 'text-[11px] px-2 py-0.5 rounded-md';

  switch (status) {
    case 'CRITICAL':
    case 'URGENT':
      return (
        <span className={`inline-flex items-center gap-1 font-medium bg-rose-500/10 text-rose-300 border border-rose-500/30 ${cls}`}>
          <Clock className="w-3 h-3 text-rose-400 shrink-0" />
          <span>{daysRemaining !== undefined ? `${daysRemaining}d left` : 'Closing Soon'}</span>
        </span>
      );
    case 'UPCOMING':
      return (
        <span className={`inline-flex items-center gap-1 font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30 ${cls}`}>
          <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
          <span>{daysRemaining !== undefined ? `${daysRemaining}d left` : 'Upcoming'}</span>
        </span>
      );
    case 'OPEN':
      return (
        <span className={`inline-flex items-center gap-1 font-medium bg-teal-500/10 text-teal-300 border border-teal-500/30 ${cls}`}>
          <CheckCircle className="w-3 h-3 text-teal-400 shrink-0" />
          <span>{daysRemaining !== undefined ? `${daysRemaining}d left` : 'Open'}</span>
        </span>
      );
    case 'EXPIRED':
    default:
      return (
        <span className={`inline-flex items-center gap-1 font-medium bg-slate-800 text-slate-400 border border-slate-700/80 ${cls}`}>
          <Clock className="w-3 h-3 text-slate-500 shrink-0" />
          <span>Closed</span>
        </span>
      );
  }
};

export const VerdictBadge: React.FC<{ verdict: EligibilityVerdict }> = ({ verdict }) => {
  switch (verdict) {
    case 'ELIGIBLE':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
          <CheckCircle className="w-3 h-3 text-emerald-400" />
          <span>Eligible</span>
        </span>
      );
    case 'POTENTIALLY_ELIGIBLE':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
          <AlertTriangle className="w-3 h-3 text-amber-400" />
          <span>Potential Match</span>
        </span>
      );
    case 'INSUFFICIENT_INFO':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
          <AlertCircle className="w-3 h-3 text-slate-400" />
          <span>Info Needed</span>
        </span>
      );
    case 'INELIGIBLE':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/30">
          <AlertCircle className="w-3 h-3 text-rose-400" />
          <span>Criteria Not Met</span>
        </span>
      );
  }
};
