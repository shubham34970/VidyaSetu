import React, { useState } from 'react';
import {
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  Info,
  Calendar,
  Building,
  RefreshCw,
  ExternalLink,
  Plus,
} from 'lucide-react';
import type { DocumentPreFlightItem, StudentProfile } from '../types';
import { INITIAL_DOCUMENT_AUDIT } from '../data/verifiedSchemes';

interface DocumentAuditorViewProps {
  profile: StudentProfile;
}

export const DocumentAuditorView: React.FC<DocumentAuditorViewProps> = ({ profile }) => {
  const [documents, setDocuments] = useState<DocumentPreFlightItem[]>(INITIAL_DOCUMENT_AUDIT);
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'ACTION_NEEDED'>('ALL');

  // Interactive audit test for income certificate date
  const [incomeCertDate, setIncomeCertDate] = useState('2025-06-12');
  const [incomeCertFeedback, setIncomeCertFeedback] = useState<string | null>(null);

  const handleTestIncomeDate = (dateStr: string) => {
    setIncomeCertDate(dateStr);
    const parsedDate = new Date(dateStr);
    const now = new Date();
    const diffYears = (now.getTime() - parsedDate.getTime()) / (1000 * 3600 * 24 * 365.25);

    if (diffYears < 0) {
      setIncomeCertFeedback('Invalid future date specified.');
    } else if (diffYears > 3.0) {
      setIncomeCertFeedback(
        `Critical: Certificate is ${diffYears.toFixed(1)} years old. UP State & Central guidelines enforce a strict 3-year validity cutoff. This will trigger immediate portal rejection.`
      );
    } else {
      setIncomeCertFeedback(
        `Compliant: Certificate is ${diffYears.toFixed(1)} years old, comfortably within the 3-year statutory validity window.`
      );
    }
  };

  const passCount = documents.filter((d) => d.status === 'PASS').length;
  const warningCount = documents.filter((d) => d.status === 'WARNING').length;
  const failCount = documents.filter((d) => d.status === 'FAIL').length;
  const readinessPercent = Math.round((passCount / documents.length) * 100);

  const displayedDocs = documents.filter((doc) => {
    if (selectedFilter === 'ACTION_NEEDED') {
      return doc.status === 'WARNING' || doc.status === 'FAIL';
    }
    return true;
  });

  return (
    <div className="space-y-8 py-2">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 mb-2">
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Pre-Flight Compliance Auditor</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Prevent the 84% Technical Rejection Trap
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Over 84% of government scholarship rejections occur due to stale validity windows, issuing authority mismatches, or missing Aadhaar NPCI seeding.
          </p>
        </div>

        {/* Readiness Score Card */}
        <div className="p-4 rounded-2xl bg-navy-900/80 border border-slate-800 flex items-center gap-4">
          <div className="relative w-14 h-14 flex items-center justify-center">
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-teal-400"
                strokeDasharray={`${readinessPercent}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-xs font-black text-white">{readinessPercent}%</span>
          </div>

          <div>
            <div className="text-xs font-bold text-white">Pre-Flight Readiness</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {passCount} Pass • {warningCount} Warning • {failCount} Fail
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Expiry Simulator Sandbox */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-navy-900/90 to-slate-900/90 border border-indigo-500/30 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-bold text-white">
              Income Certificate Validity Calculator (UP & Central Schemes)
            </h2>
          </div>
          <span className="text-[11px] font-mono text-indigo-300">Statutory 3-Year Rule</span>
        </div>

        <p className="text-xs text-slate-300">
          Under UP Revenue Board G.O. 4521/1-9-2015, an Income Certificate is valid strictly for 3 years from the date of issue. Test your certificate's issuance date:
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            type="date"
            value={incomeCertDate}
            onChange={(e) => handleTestIncomeDate(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-teal-500"
          />

          <button
            type="button"
            onClick={() => handleTestIncomeDate(incomeCertDate)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
          >
            Audit Certificate Date
          </button>
        </div>

        {incomeCertFeedback && (
          <div
            className={`p-3 rounded-xl border text-xs leading-relaxed ${
              incomeCertFeedback.startsWith('Critical')
                ? 'bg-rose-950/70 border-rose-500/40 text-rose-300'
                : 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
            }`}
          >
            {incomeCertFeedback}
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              selectedFilter === 'ALL'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Audited Documents ({documents.length})
          </button>
          <button
            onClick={() => setSelectedFilter('ACTION_NEEDED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              selectedFilter === 'ACTION_NEEDED'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Action Needed ({warningCount + failCount})
          </button>
        </div>

        <a
          href="https://edistrict.up.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-teal-400 hover:text-teal-300 inline-flex items-center font-medium"
        >
          <span>UP eDistrict Portal</span>
          <ExternalLink className="w-3.5 h-3.5 ml-1" />
        </a>
      </div>

      {/* Audited Documents List */}
      <div className="space-y-4">
        {displayedDocs.map((doc) => {
          const isPass = doc.status === 'PASS';
          const isWarning = doc.status === 'WARNING';
          const isFail = doc.status === 'FAIL';

          return (
            <div
              key={doc.id}
              className={`p-5 rounded-2xl border transition-all ${
                isWarning
                  ? 'bg-amber-950/20 border-amber-500/40'
                  : isFail
                  ? 'bg-rose-950/20 border-rose-500/40'
                  : 'bg-navy-900/60 border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3">
                  {isPass && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
                  {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
                  {isFail && <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}

                  <div>
                    <h3 className="text-base font-bold text-white">{doc.name}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-400">
                      {doc.issuingAuthority && (
                        <span>Authority: <strong className="text-slate-300">{doc.issuingAuthority}</strong></span>
                      )}
                      {doc.issueDate && <span>• Issued: {doc.issueDate}</span>}
                      {doc.validUntil && <span>• Valid Until: {doc.validUntil}</span>}
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  {isPass && (
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      Compliant (Pass)
                    </span>
                  )}
                  {isWarning && (
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      Action Required
                    </span>
                  )}
                  {isFail && (
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      Non-Compliant
                    </span>
                  )}
                </div>
              </div>

              {/* Findings */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs text-slate-300 leading-relaxed mb-3">
                {doc.findings}
              </div>

              {doc.actionRequired && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-start gap-2 mb-3">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>Action Required:</strong> {doc.actionRequired}
                  </div>
                </div>
              )}

              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-slate-600" />
                <span>Statutory Rule: {doc.officialRuleSource}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
