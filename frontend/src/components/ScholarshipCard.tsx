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
  if (scheme.criteria.maxFamilyIncome != null) {
    if (profile?.annualFamilyIncome != null) {
      if (profile.annualFamilyIncome <= scheme.criteria.maxFamilyIncome) {
        satisfied.push(
          `Income ₹${profile.annualFamilyIncome.toLocaleString('en-IN')} within ceiling of ₹${scheme.criteria.maxFamilyIncome.toLocaleString('en-IN')}`
        );
      } else {
        conflicting.push(
          `Income ₹${profile.annualFamilyIncome.toLocaleString('en-IN')} exceeds limit of ₹${scheme.criteria.maxFamilyIncome.toLocaleString('en-IN')}`
        );
      }
    } else {
      missing.push('Annual family income required for verification');
    }
  }

  // Academic Marks Check
  if (scheme.criteria.minMarksPercentage != null) {
    if (profile?.marksPercentage != null) {
      if (profile.marksPercentage >= scheme.criteria.minMarksPercentage) {
        satisfied.push(
          `Academic score ${profile.marksPercentage}% meets minimum ${scheme.criteria.minMarksPercentage}% threshold`
        );
      } else {
        conflicting.push(
          `Marks score ${profile.marksPercentage}% below required ${scheme.criteria.minMarksPercentage}%`
        );
      }
    } else {
      missing.push('Academic marks required for verification');
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

  const daysRemaining = React.useMemo(() => {
    try {
      const diff = new Date(scheme.applicationDeadline).getTime() - new Date().getTime();
      return Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)));
    } catch {
      return undefined;
    }
  }, [scheme.applicationDeadline]);

  // Key criteria summary text
  const criteriaSummary = React.useMemo(() => {
    const parts: string[] = [];
    if (scheme.criteria.allowedLevels && scheme.criteria.allowedLevels.length > 0) {
      parts.push(scheme.criteria.allowedLevels[0].replace(/_/g, ' '));
    }
    if (scheme.criteria.allowedDomiciles && scheme.criteria.allowedDomiciles.length > 0) {
      parts.push(scheme.criteria.allowedDomiciles[0]);
    }
    if (scheme.criteria.maxFamilyIncome != null) {
      parts.push(`Income ≤ ₹${(scheme.criteria.maxFamilyIncome / 100000).toFixed(1)}L`);
    }
    if (scheme.criteria.minMarksPercentage != null) {
      parts.push(`≥ ${scheme.criteria.minMarksPercentage}%`);
    }
    return parts.join(' • ');
  }, [scheme.criteria]);

  return (
    <div
      className={`rounded-xl border transition-all flex flex-col justify-between overflow-hidden group ${
        isInCompare
          ? 'bg-slate-900 border-teal-500/50 ring-1 ring-teal-500/30'
          : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/70'
      }`}
    >
      {/* ── Top Header Row ──────────────────────────────────────────────── */}
      <div className="p-4 pb-3 space-y-2 border-b border-slate-800/50">
        <div className="flex items-start justify-between gap-2">
          <h3
            onClick={() => onSelect(scheme)}
            className="text-sm font-bold text-white group-hover:text-teal-300 transition-colors leading-snug line-clamp-2 cursor-pointer flex-1"
          >
            {scheme.name}
          </h3>
          <div className="flex items-center gap-1.5 shrink-0">
            <ProvenanceBadge status={scheme.verificationStatus} size="xs" />
            <DeadlineBadge status={scheme.deadlineStatus} daysRemaining={daysRemaining} size="xs" />
          </div>
        </div>

        <p className="text-xs text-slate-400 truncate flex items-center gap-1.5">
          <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="truncate">{scheme.authority}</span>
        </p>
      </div>

      {/* ── Main Content ───────────────────────────────────────────────── */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Eligibility criteria summary */}
          {criteriaSummary && (
            <p className="text-[11px] text-slate-400 truncate" title={criteriaSummary}>
              {criteriaSummary}
            </p>
          )}

          {/* Benefit Amount (Prominent, clean) */}
          <div className="flex items-baseline justify-between pt-1 pb-1">
            <span className="text-sm font-extrabold text-teal-300 tracking-tight">
              {scheme.benefitAmountFormatted}
            </span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">
              {scheme.schemeType.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        {/* Student Eligibility Result (At most 2 concise reasons) */}
        <div className="pt-2 border-t border-slate-800/40 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400">Match for you</span>
            <VerdictBadge verdict={evalResult.verdict} />
          </div>

          <div className="space-y-1 text-[11px]">
            {evalResult.conflictingConditions.length > 0 ? (
              evalResult.conflictingConditions.slice(0, 2).map((c, i) => (
                <div key={i} className="flex items-start text-rose-300/90 gap-1.5 leading-snug">
                  <XCircle className="w-3 h-3 text-rose-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-1">{c}</span>
                </div>
              ))
            ) : evalResult.satisfiedConditions.length > 0 ? (
              evalResult.satisfiedConditions.slice(0, 2).map((c, i) => (
                <div key={i} className="flex items-start text-emerald-300/90 gap-1.5 leading-snug">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-1">{c}</span>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-[10px]">No criteria conflicts detected.</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <div className="px-4 py-2.5 border-t border-slate-800/60 bg-slate-950/40 flex items-center justify-between gap-2">
        <a
          href={scheme.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-[11px] text-slate-400 hover:text-white transition-colors truncate max-w-[130px]"
          title="Visit official portal"
        >
          <ExternalLink className="w-3 h-3 mr-1 text-slate-500 shrink-0" />
          <span className="truncate">{scheme.portalName}</span>
        </a>

        <div className="flex items-center gap-1.5">
          {onToggleCompare && (
            <button
              onClick={onToggleCompare}
              disabled={compareDisabled}
              title={isInCompare ? 'Remove from comparison' : 'Add to comparison (max 3)'}
              className={`p-1.5 rounded-lg text-xs border transition-colors ${
                isInCompare
                  ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                  : compareDisabled
                  ? 'opacity-30 cursor-not-allowed bg-slate-900 text-slate-600 border-slate-800'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => onSelect(scheme)}
            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 transition-colors"
          >
            <span>View Details</span>
            <ArrowRight className="w-3 h-3 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};
