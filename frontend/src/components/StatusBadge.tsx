import React from 'react';
import { ShieldCheck, Database, FlaskConical, AlertCircle, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { VerificationStatus, DeadlineUrgency, EligibilityVerdict } from '../types';

interface StatusBadgeProps {
  status: VerificationStatus;
  size?: 'sm' | 'md';
}

export const ProvenanceBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1 font-medium';

  switch (status) {
    case 'VERIFIED_OFFICIAL':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shadow-sm ${sizeClasses}`}
          title="Verified against official government gazette / portal"
        >
          <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
          <span>Official Verified</span>
        </span>
      );
    case 'CACHED_PORTAL':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-sm ${sizeClasses}`}
          title="Cached from recent portal sync"
        >
          <Database className="w-3 h-3 text-cyan-400 shrink-0" />
          <span>Cached Portal</span>
        </span>
      );
    case 'DEMO_DATA':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-amber-950/80 text-amber-300 border border-amber-500/40 shadow-sm ${sizeClasses}`}
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
          className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-slate-800 text-slate-400 border border-slate-700 ${sizeClasses}`}
          title="Extracted from public web; awaiting confirmation"
        >
          <AlertCircle className="w-3 h-3 text-slate-400 shrink-0" />
          <span>Unverified</span>
        </span>
      );
  }
};

export const DeadlineBadge: React.FC<{ status: DeadlineUrgency; daysRemaining?: number }> = ({
  status,
  daysRemaining,
}) => {
  switch (status) {
    case 'CRITICAL':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-950/90 text-rose-300 border border-rose-500/50 animate-pulse">
          <Clock className="w-3 h-3 text-rose-400" />
          <span>{daysRemaining !== undefined ? `${daysRemaining}d left (Closing Soon)` : 'Closing Soon'}</span>
        </span>
      );
    case 'UPCOMING':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-950/80 text-amber-300 border border-amber-500/40">
          <AlertTriangle className="w-3 h-3 text-amber-400" />
          <span>{daysRemaining !== undefined ? `${daysRemaining} days remaining` : 'Urgent Window'}</span>
        </span>
      );
    case 'OPEN':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-950/80 text-teal-300 border border-teal-500/40">
          <CheckCircle className="w-3 h-3 text-teal-400" />
          <span>{daysRemaining !== undefined ? `Open (${daysRemaining}d left)` : 'Portal Open'}</span>
        </span>
      );
    case 'EXPIRED':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>Closed</span>
        </span>
      );
  }
};

export const VerdictBadge: React.FC<{ verdict: EligibilityVerdict }> = ({ verdict }) => {
  switch (verdict) {
    case 'ELIGIBLE':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>High Match (Eligible)</span>
        </span>
      );
    case 'POTENTIALLY_ELIGIBLE':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>Potentially Eligible</span>
        </span>
      );
    case 'INSUFFICIENT_INFO':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
          <AlertCircle className="w-3.5 h-3.5 text-cyan-400" />
          <span>More Info Required</span>
        </span>
      );
    case 'INELIGIBLE':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
          <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
          <span>Criteria Mismatch</span>
        </span>
      );
  }
};
