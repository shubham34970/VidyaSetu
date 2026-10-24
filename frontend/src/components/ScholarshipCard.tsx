import React from 'react';
import {
  ExternalLink,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Building,
  ArrowRight,
  ShieldCheck,
  BarChart3,
} from 'lucide-react';
import type { ScholarshipScheme, StudentProfile, EligibilityEvaluation } from '../types';
import { ProvenanceBadge, DeadlineBadge, VerdictBadge } from './StatusBadge';

interface ScholarshipCardProps {
  scheme: ScholarshipScheme;
  profile: StudentProfile;
  evaluation?: EligibilityEvaluation;
  onSelect: (scheme: ScholarshipScheme) => void;
  // Compare feature (Round 2)
  isInCompare?: boolean;
  onToggleCompare?: () => void;
  compareDisabled?: boolean;
}

export const evaluateLocalEligibility = (
  scheme: ScholarshipScheme,
  profile: StudentProfile
): EligibilityEvaluation => {
  const satisfied: string[] = [];
  const conflicting: string[] = [];
  const missing: string[] = [];

  // Domicile Check
  if (scheme.criteria.allowedDomiciles && scheme.criteria.allowedDomiciles.length > 0) {
    const isAll = scheme.criteria.allowedDomiciles.includes('All States & UTs');
    if (isAll || scheme.criteria.allowedDomiciles.includes(profile.stateDomicile)) {
      satisfied.push(`Domicile verified: ${profile.stateDomicile}`);
    } else {
      conflicting.push(
        `Domicile mismatch: Requires ${scheme.criteria.allowedDomiciles.join(' or ')} (Student is ${profile.stateDomicile})`
      );
    }
  }

  // Social Category Check
  if (scheme.criteria.allowedCategories && scheme.criteria.allowedCategories.length > 0) {
    if (scheme.criteria.allowedCategories.includes(profile.socialCategory)) {
      satisfied.push(`Category eligible: ${profile.socialCategory}`);
    } else {
      conflicting.push(
        `Category restriction: Only ${scheme.criteria.allowedCategories.join(', ')} (Student is ${profile.socialCategory})`
      );
    }
  }

  // Gender Check
  if (scheme.criteria.allowedGenders && scheme.criteria.allowedGenders.length > 0) {
    if (scheme.criteria.allowedGenders.includes(profile.gender)) {
      satisfied.push(`Gender requirement satisfied (${profile.gender})`);
    } else {
      conflicting.push(
        `Restricted to ${scheme.criteria.allowedGenders.join(', ')} students (Student is ${profile.gender})`
      );
    }
  }

  // Income Ceiling Check
  if (scheme.criteria.maxFamilyIncome !== undefined) {
    if (profile.annualFamilyIncome <= scheme.criteria.maxFamilyIncome) {
      satisfied.push(
        `Income ₹${profile.annualFamilyIncome.toLocaleString('en-IN')} within ceiling of ₹${scheme.criteria.maxFamilyIncome.toLocaleString('en-IN')}`
      );
    } else {
      conflicting.push(
        `Income ₹${profile.annualFamilyIncome.toLocaleString('en-IN')} exceeds limit of ₹${scheme.criteria.maxFamilyIncome.toLocaleString('en-IN')}`
      );
    }
  }

  // Academic Marks Check
  if (scheme.criteria.minMarksPercentage !== undefined) {
    if (profile.marksPercentage >= scheme.criteria.minMarksPercentage) {
      satisfied.push(
        `Academic score ${profile.marksPercentage}% meets minimum ${scheme.criteria.minMarksPercentage}% threshold`
      );
    } else {
      conflicting.push(
        `Marks score ${profile.marksPercentage}% below required ${scheme.criteria.minMarksPercentage}%`
      );
    }
  }

  // Academic Level Check
  if (scheme.criteria.allowedLevels && scheme.criteria.allowedLevels.length > 0) {
    if (scheme.criteria.allowedLevels.includes(profile.academicLevel)) {
      satisfied.push(`Course level eligible: ${profile.academicLevel}`);
    } else {
      conflicting.push(`Course level requires ${scheme.criteria.allowedLevels.join(' or ')}`);
    }
  }

  let verdict: EligibilityEvaluation['verdict'] = 'ELIGIBLE';
  let matchScore = 100;

  if (conflicting.length > 0) {
    verdict = 'INELIGIBLE';
    matchScore = Math.max(20, 100 - conflicting.length * 30);
  } else if (missing.length > 0) {
    verdict = 'POTENTIALLY_ELIGIBLE';
    matchScore = 75;
  }

  return {
    schemeId: scheme.id,
    verdict,
    matchScore,
    satisfiedConditions: satisfied,
    conflictingConditions: conflicting,
    missingConditions: missing,
    sourceCitations: [scheme.sourceUrl],
  };
};

export const ScholarshipCard: React.FC<ScholarshipCardProps> = ({
  scheme,
  profile,
  evaluation,
  onSelect,
  isInCompare = false,
  onToggleCompare,
  compareDisabled = false,
}) => {
  const evalResult = evaluation || evaluateLocalEligibility(scheme, profile);

  // Scheme type badge color
  const typeColors: Record<string, string> = {
    MERIT: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    MEANS: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    MERIT_CUM_MEANS: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    CATEGORY_SPECIFIC: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    GENDER_SPECIFIC: 'bg-pink-500/15 text-pink-300 border-pink-500/30',
    DISABILITY: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
    MINORITY: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
    FELLOWSHIP: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  };

  return (
    <div className={`rounded-2xl border shadow-lg flex flex-col justify-between transition-all group overflow-hidden ${
      isInCompare
        ? 'bg-violet-950/30 border-violet-500/50 ring-1 ring-violet-500/30'
        : 'bg-navy-900/70 border-slate-800 hover:border-slate-700'
    }`}>
      {/* Top Meta Bar */}
      <div className="p-5 border-b border-slate-800/80 bg-navy-950/40 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <ProvenanceBadge status={scheme.verificationStatus} />
          <DeadlineBadge
            status={scheme.deadlineStatus}
            daysRemaining={
              Math.max(
                0,
                Math.ceil(
                  (new Date(scheme.applicationDeadline).getTime() - new Date().getTime()) /
                    (1000 * 3600 * 24)
                )
              )
            }
          />
        </div>

        {/* Scheme type + renewable badges */}
        {(scheme.schemeType || scheme.isRenewable != null) && (
          <div className="flex flex-wrap gap-1.5">
            {scheme.schemeType && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${typeColors[scheme.schemeType] || 'bg-slate-700 text-slate-300 border-slate-600'}`}>
                {scheme.schemeType.replace(/_/g, ' ')}
              </span>
            )}
            {scheme.isRenewable != null && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                scheme.isRenewable
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : 'bg-slate-700 text-slate-400 border-slate-600'
              }`}>
                {scheme.isRenewable ? 'Renewable' : 'One-Time'}
              </span>
            )}
          </div>
        )}

        <div>
          <h3 className="text-base font-bold text-white group-hover:text-teal-300 transition-colors leading-snug">
            {scheme.name}
          </h3>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate">{scheme.authority}</span>
          </p>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 space-y-4 flex-1">
        {/* Benefit Highlight Box */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Verified Benefit Entitlement
            </div>
            <div className="text-sm font-extrabold text-teal-300 mt-0.5">
              {scheme.benefitAmountFormatted}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">{scheme.benefitType}</div>
          </div>
        </div>

        {/* Eligibility Verdict Banner */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Eligibility Analysis</span>
            <VerdictBadge verdict={evalResult.verdict} />
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5 text-xs">
            {evalResult.satisfiedConditions.slice(0, 2).map((c, i) => (
              <div key={i} className="flex items-start text-emerald-300/90 gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="line-clamp-1">{c}</span>
              </div>
            ))}

            {evalResult.conflictingConditions.map((c, i) => (
              <div key={i} className="flex items-start text-rose-300/90 gap-1.5">
                <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                <span className="line-clamp-1">{c}</span>
              </div>
            ))}
          </div>
        </div>

        {scheme.isExtensionAnnounced && (
          <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-[11px] text-cyan-300 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Official circular extension announced (previously {scheme.previousDeadline})</span>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-navy-950/30 flex items-center justify-between gap-2">
        <a
          href={scheme.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-xs text-slate-400 hover:text-white transition-colors"
          title="Visit official portal in new tab"
        >
          <ExternalLink className="w-3.5 h-3.5 mr-1 text-slate-500" />
          <span className="truncate max-w-[100px]">{scheme.portalName}</span>
        </a>

        <div className="flex items-center gap-2">
          {onToggleCompare && (
            <button
              onClick={onToggleCompare}
              disabled={compareDisabled}
              title={isInCompare ? 'Remove from comparison' : 'Add to comparison (max 3)'}
              className={`p-1.5 rounded-lg text-[10px] border transition-colors ${
                isInCompare
                  ? 'bg-violet-500/20 text-violet-300 border-violet-500/40'
                  : compareDisabled
                  ? 'opacity-40 cursor-not-allowed bg-slate-900 text-slate-500 border-slate-700'
                  : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-violet-500/40 hover:text-violet-300'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => onSelect(scheme)}
            className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 transition-colors"
          >
            <span>Details & Rules</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};
