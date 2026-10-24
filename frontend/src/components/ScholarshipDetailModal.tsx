import React, { useEffect } from 'react';
import {
  X,
  ExternalLink,
  ShieldCheck,
  Building,
  Calendar,
  IndianRupee,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import type { ScholarshipScheme, StudentProfile } from '../types';
import { ProvenanceBadge, DeadlineBadge } from './StatusBadge';
import { evaluateLocalEligibility } from './ScholarshipCard';

interface ScholarshipDetailModalProps {
  scheme: ScholarshipScheme | null;
  profile: StudentProfile;
  onClose: () => void;
  onNavigateToAuditor: () => void;
}

export const ScholarshipDetailModal: React.FC<ScholarshipDetailModalProps> = ({
  scheme,
  profile,
  onClose,
  onNavigateToAuditor,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!scheme) return null;

  const evalResult = evaluateLocalEligibility(scheme, profile);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-3xl rounded-3xl bg-navy-950 border border-slate-800 shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-6 sm:p-8 border-b border-slate-800 bg-navy-900/50 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <ProvenanceBadge status={scheme.verificationStatus} size="md" />
              <DeadlineBadge status={scheme.deadlineStatus} />
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
              {scheme.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 flex items-center gap-2">
              <Building className="w-4 h-4 text-teal-400 shrink-0" />
              <span>{scheme.authority}</span>
            </p>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Benefit Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-950/60 to-slate-900 border border-teal-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-teal-400">
                Authorized Benefit Amount
              </div>
              <div className="text-xl font-extrabold text-white mt-0.5">
                {scheme.benefitAmountFormatted}
              </div>
              <div className="text-xs text-slate-300 mt-0.5">{scheme.benefitType}</div>
            </div>

            <div className="text-left sm:text-right text-xs text-slate-400">
              <div>Portal: <span className="text-slate-200 font-semibold">{scheme.portalName}</span></div>
              <div className="mt-1 font-mono text-[11px]">Last Checked: {scheme.lastChecked}</div>
            </div>
          </div>

          {/* Official Circular Text */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Official Gazette / Circular Reference</span>
            </h3>
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
              {scheme.officialCircularNotice}
            </div>
          </div>

          {/* Overview Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Scheme Description & Scope
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {scheme.description}
            </p>
          </div>

          {/* Eligibility Matrix vs Active Profile */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Eligibility Rule Matrix</span>
              <span className="text-teal-400 font-semibold">Match Score: {evalResult.matchScore}%</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-slate-500 block text-[11px]">Eligible Domiciles</span>
                <span className="text-white font-medium mt-0.5 block">
                  {scheme.criteria.allowedDomiciles?.join(', ') || 'Any State / UT'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-slate-500 block text-[11px]">Target Social Categories</span>
                <span className="text-white font-medium mt-0.5 block">
                  {scheme.criteria.allowedCategories?.join(', ') || 'All Categories'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-slate-500 block text-[11px]">Annual Family Income Ceiling</span>
                <span className="text-white font-medium mt-0.5 block">
                  {scheme.criteria.maxFamilyIncome != null
                    ? `₹${scheme.criteria.maxFamilyIncome.toLocaleString('en-IN')}`
                    : 'No Income Cap Specified'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-slate-500 block text-[11px]">Min Marks Threshold</span>
                <span className="text-white font-medium mt-0.5 block">
                  {scheme.criteria.minMarksPercentage != null
                    ? `${scheme.criteria.minMarksPercentage}% aggregate`
                    : 'Pass'}
                </span>
              </div>
            </div>
          </div>

          {/* Required Documents Checklist */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Mandatory Documentation Checklist ({scheme.requiredDocuments.length} Documents)</span>
            </h3>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              {scheme.requiredDocuments.map((doc, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span>{doc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-5 sm:p-6 border-t border-slate-800 bg-navy-900/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <a
            href={scheme.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4 mr-2 text-teal-400" />
            <span>Open Official Portal Form</span>
          </a>

          <div className="w-full sm:w-auto flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onNavigateToAuditor();
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-md shadow-teal-500/20 transition-colors"
            >
              <span>Pre-Flight Audit My Documents</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
