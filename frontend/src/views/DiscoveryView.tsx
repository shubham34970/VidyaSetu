import React, { useState, useMemo, useCallback } from 'react';
import {
  Search,
  Filter,
  Compass,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  SlidersHorizontal,
  BarChart3,
  Zap,
  Info,
} from 'lucide-react';
import type { ScholarshipScheme, StudentProfile, SearchFilters } from '../types';
import { EMPTY_FILTERS, hasActiveFilters } from '../types';
import { ScholarshipCard, evaluateLocalEligibility } from '../components/ScholarshipCard';

interface DiscoveryViewProps {
  schemes: ScholarshipScheme[];
  profile: StudentProfile;
  onSelectScheme: (scheme: ScholarshipScheme) => void;
  onRefreshDiscovery?: () => void;
  isSyncing?: boolean;
}

// ── Shared select & input style ──────────────────────────────────────────────
const SELECT_CLS =
  'w-full h-9 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700/80 text-xs text-slate-200 focus:outline-none focus:border-teal-500 transition-colors';
const LABEL_CLS = 'block text-[11px] font-medium text-slate-400 mb-1';

// ── Filter chip for active filter display ───────────────────────────────────
const FilterChip: React.FC<{ label: string; onRemove: () => void }> = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800 text-teal-300 border border-slate-700/80">
    {label}
    <button onClick={onRemove} className="hover:text-white transition-colors" aria-label={`Remove filter ${label}`}>
      <X className="w-3 h-3" />
    </button>
  </span>
);

// ── Sort selector ────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { value: 'relevance', label: 'Best Match' },
  { value: 'deadline', label: 'Deadline Soonest' },
  { value: 'benefit_desc', label: 'Highest Benefit' },
  { value: 'name', label: 'Name A–Z' },
  { value: 'recently_verified', label: 'Recently Verified' },
];

export const DiscoveryView: React.FC<DiscoveryViewProps> = ({
  schemes,
  profile,
  onSelectScheme,
  onRefreshDiscovery,
  isSyncing = false,
}) => {
  const [filters, setFilters] = useState<SearchFilters>(EMPTY_FILTERS);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [compareIds, setCompareIds] = useState<Set<string>>(new Set());
  const [showCompare, setShowCompare] = useState(false);

  // Derived: unique domicile states for dropdown
  const domicileOptions = useMemo(() => {
    const states = new Set<string>();
    schemes.forEach((s) => {
      (s.criteria.allowedDomiciles || []).forEach((d) => {
        if (d !== 'All States & UTs') states.add(d);
      });
    });
    return [...states].sort();
  }, [schemes]);

  // ── Client-side filter application ───────────────────────────────────────
  const filteredSchemes = useMemo(() => {
    return schemes.filter((s) => {
      // Free-text
      if (filters.query) {
        const q = filters.query.toLowerCase();
        const text = `${s.name} ${s.authority} ${s.portalName} ${s.description} ${(s.tags || []).join(' ')}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      // Domicile
      if (filters.domicile !== 'ALL') {
        const allowed = s.criteria.allowedDomiciles || [];
        if (!allowed.includes('All States & UTs') && !allowed.includes(filters.domicile)) return false;
      }
      // Category
      if (filters.category !== 'ALL') {
        const c = s.criteria.allowedCategories || [];
        if (c.length > 0 && !c.includes(filters.category)) return false;
      }
      // Education level
      if (filters.level !== 'ALL') {
        const lvl = s.criteria.allowedLevels || [];
        if (lvl.length > 0 && !lvl.includes(filters.level)) return false;
      }
      // Gender
      if (filters.gender !== 'ALL') {
        const g = s.criteria.allowedGenders || [];
        if (g.length > 0 && !g.includes(filters.gender)) return false;
      }
      // Institution type
      if (filters.institutionType !== 'ALL') {
        const inst = s.criteria.allowedInstitutionTypes || [];
        if (inst.length > 0 && !inst.includes(filters.institutionType)) return false;
      }
      // Year of study
      if (filters.yearOfStudy !== 'ALL') {
        const yr = parseInt(filters.yearOfStudy, 10);
        if (s.criteria.minYearOfStudy != null && yr < s.criteria.minYearOfStudy) return false;
        if (s.criteria.maxYearOfStudy != null && yr > s.criteria.maxYearOfStudy) return false;
      }
      // Income
      if (filters.maxIncome !== '') {
        const income = parseFloat(filters.maxIncome);
        if (s.criteria.maxFamilyIncome != null && s.criteria.maxFamilyIncome < income) return false;
      }
      // Marks
      if (filters.minMarks !== '') {
        const marks = parseFloat(filters.minMarks);
        if (s.criteria.minMarksPercentage != null && marks < s.criteria.minMarksPercentage) return false;
      }
      // Scheme type
      if (filters.schemeType !== 'ALL') {
        if (s.schemeType !== filters.schemeType) return false;
      }
      // Deadline status
      if (filters.deadlineStatus !== 'ALL') {
        if (s.deadlineStatus !== filters.deadlineStatus) return false;
      }
      // Open only
      if (filters.isOpen) {
        try {
          const dl = new Date(s.applicationDeadline);
          if (dl < new Date()) return false;
        } catch { /* unknown deadline — keep */ }
      }
      // Disability
      if (filters.isDisability && !s.criteria.isDisabilityScheme) return false;
      // Minority
      if (filters.isMinority && !s.criteria.isMinorityScheme) return false;
      // Renewable
      if (filters.isRenewable !== 'ALL') {
        const want = filters.isRenewable === 'YES';
        if (s.isRenewable !== want) return false;
      }
      // Verification status
      if (filters.verificationStatus !== 'ALL') {
        if (s.verificationStatus !== filters.verificationStatus) return false;
      }
      // Eligibility-only toggle
      if (filters.onlyEligible) {
        const ev = evaluateLocalEligibility(s, profile);
        if (ev.verdict !== 'ELIGIBLE') return false;
      }
      return true;
    });
  }, [schemes, filters, profile]);

  // ── Sort ─────────────────────────────────────────────────────────────────
  const sortedSchemes = useMemo(() => {
    const now = new Date();
    const getDL = (s: ScholarshipScheme) => {
      try { return (new Date(s.applicationDeadline).getTime() - now.getTime()) / 86400000; }
      catch { return 9999; }
    };
    switch (filters.sort) {
      case 'deadline':
        return [...filteredSchemes].sort((a, b) => getDL(a) - getDL(b));
      case 'name':
        return [...filteredSchemes].sort((a, b) => a.name.localeCompare(b.name));
      case 'benefit_desc':
        return [...filteredSchemes].sort((a, b) => {
          const num = (s: ScholarshipScheme) => {
            const m = s.benefitAmountFormatted.match(/[\d,]+/);
            return m ? parseInt(m[0].replace(/,/g, ''), 10) : 0;
          };
          return num(b) - num(a);
        });
      case 'recently_verified':
        return [...filteredSchemes].sort((a, b) => b.lastChecked.localeCompare(a.lastChecked));
      default: { // relevance: CRITICAL first, then by deadline
        const urgPriority: Record<string, number> = { CRITICAL: 0, UPCOMING: 1, OPEN: 2, EXPIRED: 3, UNKNOWN: 4 };
        return [...filteredSchemes].sort(
          (a, b) => (urgPriority[a.deadlineStatus] ?? 4) - (urgPriority[b.deadlineStatus] ?? 4) || getDL(a) - getDL(b)
        );
      }
    }
  }, [filteredSchemes, filters.sort]);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const eligibleCount = useMemo(
    () => schemes.filter((s) => evaluateLocalEligibility(s, profile).verdict === 'ELIGIBLE').length,
    [schemes, profile]
  );

  // ── Active filter chips ───────────────────────────────────────────────────
  const activeChips = useMemo(() => {
    const chips: { label: string; key: keyof SearchFilters; value: unknown }[] = [];
    if (filters.domicile !== 'ALL') chips.push({ label: `Domicile: ${filters.domicile}`, key: 'domicile', value: 'ALL' });
    if (filters.category !== 'ALL') chips.push({ label: `Category: ${filters.category}`, key: 'category', value: 'ALL' });
    if (filters.level !== 'ALL') chips.push({ label: `Level: ${filters.level}`, key: 'level', value: 'ALL' });
    if (filters.gender !== 'ALL') chips.push({ label: `Gender: ${filters.gender}`, key: 'gender', value: 'ALL' });
    if (filters.institutionType !== 'ALL') chips.push({ label: `Institution: ${filters.institutionType}`, key: 'institutionType', value: 'ALL' });
    if (filters.yearOfStudy !== 'ALL') chips.push({ label: `Year ${filters.yearOfStudy}`, key: 'yearOfStudy', value: 'ALL' });
    if (filters.maxIncome !== '') chips.push({ label: `Income ≤ ₹${parseInt(filters.maxIncome).toLocaleString('en-IN')}`, key: 'maxIncome', value: '' });
    if (filters.minMarks !== '') chips.push({ label: `Marks ≥ ${filters.minMarks}%`, key: 'minMarks', value: '' });
    if (filters.schemeType !== 'ALL') chips.push({ label: `Type: ${filters.schemeType.replace(/_/g, ' ')}`, key: 'schemeType', value: 'ALL' });
    if (filters.deadlineStatus !== 'ALL') chips.push({ label: `Status: ${filters.deadlineStatus}`, key: 'deadlineStatus', value: 'ALL' });
    if (filters.isOpen) chips.push({ label: 'Open Now', key: 'isOpen', value: false });
    if (filters.isDisability) chips.push({ label: 'Disability Scheme', key: 'isDisability', value: false });
    if (filters.isMinority) chips.push({ label: 'Minority Scheme', key: 'isMinority', value: false });
    if (filters.isRenewable !== 'ALL') chips.push({ label: `Renewable: ${filters.isRenewable}`, key: 'isRenewable', value: 'ALL' });
    if (filters.onlyEligible) chips.push({ label: `Profile Match Only`, key: 'onlyEligible', value: false });
    return chips;
  }, [filters]);

  const setFilter = useCallback(<K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = () => setFilters(EMPTY_FILTERS);

  // ── Compare handlers ─────────────────────────────────────────────────────
  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 3) next.add(id);
      return next;
    });
  };

  const compareSchemes = useMemo(
    () => schemes.filter((s) => compareIds.has(s.id)),
    [schemes, compareIds]
  );

  const hasFiltersActive = hasActiveFilters({ ...filters, onlyEligible: false, query: '' });

  return (
    <div className="space-y-4 py-2">
      {/* ── 1. Simplified Page Header ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Higher-Education Scholarships & Gazette Circulars
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 flex-wrap">
            <span>Find scholarships matched to your profile</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300 font-medium">{schemes.length} total</span>
            <span className="text-slate-600">•</span>
            <span className="inline-flex items-center gap-1.5 text-teal-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
              {eligibleCount} {eligibleCount === 1 ? 'match' : 'matches'} for you
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          {compareIds.size > 0 && (
            <button
              id="btn-compare-view"
              onClick={() => setShowCompare(true)}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 border border-teal-500/30 transition-colors"
            >
              <BarChart3 className="w-3.5 h-3.5 mr-1" />
              Compare ({compareIds.size})
            </button>
          )}
          {onRefreshDiscovery && (
            <button
              id="btn-refresh-discovery"
              onClick={onRefreshDiscovery}
              disabled={isSyncing}
              title="Sync with official scholarship circulars"
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isSyncing ? 'animate-spin text-teal-400' : 'text-slate-400'}`} />
              {isSyncing ? 'Syncing…' : 'Sync Portals'}
            </button>
          )}
        </div>
      </div>

      {/* ── 2. Compact Discovery Toolbar ─────────────────────────────────── */}
      <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 overflow-hidden">
        <div className="p-2.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Prominent Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              id="search-query-input"
              type="text"
              value={filters.query}
              onChange={(e) => setFilter('query', e.target.value)}
              placeholder="Search scheme name, ministry, state, or keywords…"
              className="w-full h-9 pl-9 pr-8 rounded-lg bg-slate-950 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
            />
            {filters.query && (
              <button
                onClick={() => setFilter('query', '')}
                className="absolute right-2.5 top-2.5 text-slate-500 hover:text-white"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <select
              id="sort-select"
              value={filters.sort}
              onChange={(e) => setFilter('sort', e.target.value as SearchFilters['sort'])}
              className="h-9 px-2.5 rounded-lg bg-slate-950 border border-slate-700/80 text-xs text-slate-300 focus:outline-none focus:border-teal-500 transition-colors"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Small Eligible Only Toggle */}
          <button
            id="btn-eligible-only"
            onClick={() => setFilter('onlyEligible', !filters.onlyEligible)}
            className={`h-9 px-3 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              filters.onlyEligible
                ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-700/80 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
            Eligible only ({eligibleCount})
          </button>

          {/* Filters Toggle Button */}
          <button
            id="btn-advanced-filters"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`h-9 px-3 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              showAdvanced || hasFiltersActive
                ? 'bg-slate-800 text-teal-300 border-teal-500/30'
                : 'bg-slate-950 text-slate-300 border-slate-700/80 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {hasFiltersActive && (
              <span className="px-1.5 py-0.2 rounded-full bg-teal-500 text-slate-950 text-[10px] font-bold">
                {activeChips.filter((c) => c.key !== 'onlyEligible').length}
              </span>
            )}
            {showAdvanced ? <ChevronUp className="w-3.5 h-3.5 ml-0.5" /> : <ChevronDown className="w-3.5 h-3.5 ml-0.5" />}
          </button>

          {/* Clear All action (visible when filters are active) */}
          {(hasFiltersActive || filters.query || filters.onlyEligible) && (
            <button
              id="btn-clear-all"
              onClick={resetFilters}
              className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1 transition-colors whitespace-nowrap shrink-0"
            >
              Clear all
            </button>
          )}
        </div>

        {/* ── Collapsible Filters Panel: 3 Groups ────────────────────────── */}
        {showAdvanced && (
          <div className="border-t border-slate-800 p-4 space-y-4 bg-slate-950/60">
            {/* Group 1: Student Profile */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                  <Filter className="w-3 h-3 text-teal-400" /> Student Profile Criteria
                </span>
                <span className="text-[10px] text-slate-500">Sensitive fields are voluntary</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                <div>
                  <label htmlFor="filter-domicile" className={LABEL_CLS}>State / Domicile</label>
                  <select id="filter-domicile" value={filters.domicile} onChange={(e) => setFilter('domicile', e.target.value)} className={SELECT_CLS}>
                    <option value="ALL">All Domiciles</option>
                    {domicileOptions.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="filter-level" className={LABEL_CLS}>Education Level</label>
                  <select id="filter-level" value={filters.level} onChange={(e) => setFilter('level', e.target.value)} className={SELECT_CLS}>
                    <option value="ALL">All Levels</option>
                    <option value="HIGHER_SECONDARY">Higher Secondary (Class 11–12)</option>
                    <option value="UNDERGRADUATE">Undergraduate (UG)</option>
                    <option value="POSTGRADUATE">Postgraduate (PG)</option>
                    <option value="DIPLOMA">Diploma / Polytechnic</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="filter-year" className={LABEL_CLS}>Year of Study</label>
                  <select id="filter-year" value={filters.yearOfStudy} onChange={(e) => setFilter('yearOfStudy', e.target.value)} className={SELECT_CLS}>
                    <option value="ALL">Any Year</option>
                    {[1, 2, 3, 4, 5, 6].map((y) => <option key={y} value={y.toString()}>Year {y}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="filter-category" className={LABEL_CLS}>Social Category</label>
                  <select id="filter-category" value={filters.category} onChange={(e) => setFilter('category', e.target.value)} className={SELECT_CLS}>
                    <option value="ALL">All Categories</option>
                    <option value="GENERAL">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="EWS">EWS</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="filter-inst" className={LABEL_CLS}>Institution Type</label>
                  <select id="filter-inst" value={filters.institutionType} onChange={(e) => setFilter('institutionType', e.target.value)} className={SELECT_CLS}>
                    <option value="ALL">All Types</option>
                    <option value="GOVERNMENT">Government</option>
                    <option value="GOVT_AIDED">Government-Aided</option>
                    <option value="PRIVATE">Private</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="filter-income" className={LABEL_CLS}>Annual Family Income (₹) <span className="text-slate-500 font-normal">(optional)</span></label>
                  <input
                    id="filter-income"
                    type="number"
                    min={0}
                    value={filters.maxIncome}
                    onChange={(e) => setFilter('maxIncome', e.target.value)}
                    placeholder="e.g. 200000"
                    className={SELECT_CLS + ' placeholder-slate-600'}
                  />
                </div>
                <div>
                  <label htmlFor="filter-marks" className={LABEL_CLS}>Marks / Percentage (%) <span className="text-slate-500 font-normal">(optional)</span></label>
                  <input
                    id="filter-marks"
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    value={filters.minMarks}
                    onChange={(e) => setFilter('minMarks', e.target.value)}
                    placeholder="e.g. 75"
                    className={SELECT_CLS + ' placeholder-slate-600'}
                  />
                </div>
                <div>
                  <label htmlFor="filter-gender" className={LABEL_CLS}>Gender <span className="text-slate-500 font-normal">(optional)</span></label>
                  <select id="filter-gender" value={filters.gender} onChange={(e) => setFilter('gender', e.target.value)} className={SELECT_CLS}>
                    <option value="ALL">All Genders</option>
                    <option value="FEMALE">Female</option>
                    <option value="MALE">Male</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Group 2 & Group 3: Scholarship Details & Additional Eligibility */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-3 border-t border-slate-800">
              {/* Group 2: Scholarship Details */}
              <div>
                <span className="text-[11px] font-semibold text-slate-300 block mb-2">
                  Scholarship Characteristics
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label htmlFor="filter-type" className={LABEL_CLS}>Scheme Type</label>
                    <select id="filter-type" value={filters.schemeType} onChange={(e) => setFilter('schemeType', e.target.value)} className={SELECT_CLS}>
                      <option value="ALL">All Types</option>
                      <option value="MERIT">Merit</option>
                      <option value="MEANS">Means</option>
                      <option value="MERIT_CUM_MEANS">Merit-cum-Means</option>
                      <option value="CATEGORY_SPECIFIC">Category</option>
                      <option value="GENDER_SPECIFIC">Gender</option>
                      <option value="DISABILITY">Disability</option>
                      <option value="MINORITY">Minority</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="filter-renewable" className={LABEL_CLS}>Award Type</label>
                    <select id="filter-renewable" value={filters.isRenewable} onChange={(e) => setFilter('isRenewable', e.target.value)} className={SELECT_CLS}>
                      <option value="ALL">All Types</option>
                      <option value="YES">Renewable</option>
                      <option value="NO">One-Time</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="filter-deadline" className={LABEL_CLS}>Deadline Status</label>
                    <select id="filter-deadline" value={filters.deadlineStatus} onChange={(e) => setFilter('deadlineStatus', e.target.value)} className={SELECT_CLS}>
                      <option value="ALL">All</option>
                      <option value="CRITICAL">Critical</option>
                      <option value="UPCOMING">Upcoming</option>
                      <option value="OPEN">Open</option>
                      <option value="EXPIRED">Expired</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Group 3: Additional Eligibility Flags */}
              <div>
                <span className="text-[11px] font-semibold text-slate-300 block mb-2">
                  Additional Eligibility
                </span>
                <div className="flex flex-wrap gap-3 pt-2">
                  {[
                    { key: 'isOpen', label: 'Open Deadlines Only', id: 'filter-open' },
                    { key: 'isDisability', label: 'Disability Schemes', id: 'filter-disability' },
                    { key: 'isMinority', label: 'Minority Schemes', id: 'filter-minority' },
                  ].map(({ key, label, id }) => (
                    <label key={key} htmlFor={id} className="flex items-center gap-2 cursor-pointer bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700">
                      <input
                        id={id}
                        type="checkbox"
                        checked={filters[key as keyof SearchFilters] as boolean}
                        onChange={(e) => setFilter(key as keyof SearchFilters, e.target.checked as any)}
                        className="rounded border-slate-700 bg-slate-950 text-teal-500 focus:ring-teal-500 w-3.5 h-3.5"
                      />
                      <span className="text-xs text-slate-300">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions inside Panel */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={resetFilters}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white transition-colors"
              >
                Reset Filters
              </button>
              <button
                type="button"
                onClick={() => setShowAdvanced(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-teal-500 hover:bg-teal-400 text-slate-950 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Active Filter Chips Row (Visible outside panel) */}
        {(activeChips.length > 0 || filters.query) && (
          <div className="border-t border-slate-800/80 px-3 py-2 flex flex-wrap items-center gap-1.5 bg-slate-950/40">
            <span className="text-[10px] text-slate-500 font-medium">Active:</span>
            {filters.query && (
              <FilterChip label={`"${filters.query}"`} onRemove={() => setFilter('query', '')} />
            )}
            {activeChips.map((chip) => (
              <FilterChip
                key={chip.key}
                label={chip.label}
                onRemove={() => setFilter(chip.key, chip.value as any)}
              />
            ))}
            <button
              id="btn-reset-filters"
              onClick={resetFilters}
              className="ml-auto text-[11px] text-rose-400 hover:text-rose-300 font-medium transition-colors"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ── 3. Results Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
        <p>
          Showing <span className="font-bold text-white">{sortedSchemes.length}</span> of {schemes.length} scholarships
        </p>
        {compareIds.size > 0 && (
          <span className="text-teal-400 font-medium">
            {compareIds.size} of 3 selected to compare
          </span>
        )}
      </div>

      {/* ── 4. Scholarship Cards Grid ────────────────────────────────────── */}
      {sortedSchemes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {sortedSchemes.map((scheme) => (
            <ScholarshipCard
              key={scheme.id}
              scheme={scheme}
              profile={profile}
              onSelect={onSelectScheme}
              isInCompare={compareIds.has(scheme.id)}
              onToggleCompare={() => toggleCompare(scheme.id)}
              compareDisabled={compareIds.size >= 3 && !compareIds.has(scheme.id)}
            />
          ))}
        </div>
      ) : (
        <div className="p-10 text-center rounded-xl bg-slate-900/40 border border-slate-800 space-y-3">
          <AlertCircle className="w-7 h-7 text-slate-500 mx-auto" />
          <h3 className="text-sm font-bold text-white">No scholarships match the selected filters</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try clearing filters or removing the "Eligible only" toggle to view other opportunities.
          </p>
          <button
            id="btn-reset-empty-state"
            onClick={resetFilters}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-teal-300 hover:bg-slate-700 border border-slate-700 transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* ── Comparison Modal ─────────────────────────────────────────────── */}
      {showCompare && compareSchemes.length > 0 && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-slate-950 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-5xl mt-8">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-violet-400" />
                Scholarship Comparison
              </h2>
              <button onClick={() => setShowCompare(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="p-3 text-left text-slate-400 font-semibold w-32">Attribute</th>
                    {compareSchemes.map((s) => (
                      <th key={s.id} className="p-3 text-left text-white font-bold">
                        <div className="max-w-xs">{s.name}</div>
                        <div className="text-slate-400 font-normal text-[10px] mt-0.5">{s.authority}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {[
                    { label: 'Benefit', fn: (s: ScholarshipScheme) => s.benefitAmountFormatted },
                    { label: 'Deadline', fn: (s: ScholarshipScheme) => s.applicationDeadline },
                    { label: 'Level', fn: (s: ScholarshipScheme) => (s.criteria.allowedLevels || []).join(', ') || 'All' },
                    { label: 'Category', fn: (s: ScholarshipScheme) => (s.criteria.allowedCategories || []).join(', ') || 'All' },
                    { label: 'Income Cap', fn: (s: ScholarshipScheme) => s.criteria.maxFamilyIncome ? `₹${s.criteria.maxFamilyIncome.toLocaleString('en-IN')}` : 'No cap' },
                    { label: 'Min Marks', fn: (s: ScholarshipScheme) => s.criteria.minMarksPercentage ? `${s.criteria.minMarksPercentage}%` : 'None' },
                    { label: 'Renewable', fn: (s: ScholarshipScheme) => s.isRenewable == null ? 'Unknown' : s.isRenewable ? 'Yes' : 'One-time' },
                    { label: 'Documents', fn: (s: ScholarshipScheme) => s.requiredDocuments.length.toString() + ' required' },
                  ].map(({ label, fn }) => (
                    <tr key={label} className="hover:bg-slate-900/40">
                      <td className="p-3 text-slate-400 font-semibold">{label}</td>
                      {compareSchemes.map((s) => (
                        <td key={s.id} className="p-3 text-slate-200">{fn(s)}</td>
                      ))}
                    </tr>
                  ))}
                  <tr className="bg-teal-950/20">
                    <td className="p-3 text-slate-400 font-semibold">Eligibility</td>
                    {compareSchemes.map((s) => {
                      const ev = evaluateLocalEligibility(s, profile);
                      const colors: Record<string, string> = {
                        ELIGIBLE: 'text-emerald-400',
                        POTENTIALLY_ELIGIBLE: 'text-yellow-400',
                        INELIGIBLE: 'text-rose-400',
                        INSUFFICIENT_INFO: 'text-slate-400',
                      };
                      return (
                        <td key={s.id} className={`p-3 font-bold ${colors[ev.verdict] || 'text-slate-400'}`}>
                          {ev.verdict.replace(/_/g, ' ')}
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-400 font-semibold">Official Link</td>
                    {compareSchemes.map((s) => (
                      <td key={s.id} className="p-3">
                        <a href={s.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline">
                          Visit Portal ↗
                        </a>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-slate-800 flex justify-end">
              <button onClick={() => { setShowCompare(false); setCompareIds(new Set()); }} className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700">
                Close & Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
