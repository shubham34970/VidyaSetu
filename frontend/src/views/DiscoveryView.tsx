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

// ── Shared select style ──────────────────────────────────────────────────────
const SELECT_CLS =
  'w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-teal-500 transition-colors';
const LABEL_CLS = 'block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1';

// ── Filter chip for active filter display ───────────────────────────────────
const FilterChip: React.FC<{ label: string; onRemove: () => void }> = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-500/15 text-teal-300 border border-teal-500/30">
    {label}
    <button onClick={onRemove} className="hover:text-white transition-colors">
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

  return (
    <div className="space-y-6 py-2">
      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/20 mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>Scholarship Discovery Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Higher-Education Schemes & Gazette Circulars
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Cross-checked against your profile ({profile.fullName} • {profile.stateDomicile} •{' '}
            {profile.socialCategory}).
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {compareIds.size > 0 && (
            <button
              id="btn-compare-view"
              onClick={() => setShowCompare(true)}
              className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 border border-violet-500/40 transition-colors"
            >
              <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
              Compare ({compareIds.size})
            </button>
          )}
          {onRefreshDiscovery && (
            <button
              id="btn-refresh-discovery"
              onClick={onRefreshDiscovery}
              disabled={isSyncing}
              className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isSyncing ? 'animate-spin text-teal-400' : ''}`} />
              {isSyncing ? 'Syncing…' : 'Sync Portals'}
            </button>
          )}
          <div className="p-3 rounded-xl bg-teal-950/60 border border-teal-500/30 text-right">
            <div className="text-[10px] text-teal-400 font-semibold uppercase tracking-wider">Profile Matches</div>
            <div className="text-lg font-black text-white">
              {eligibleCount}{' '}
              <span className="text-xs font-normal text-slate-400">/ {schemes.length} schemes</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Search + filter bar ───────────────────────────────────────────── */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden">
        {/* Primary search row */}
        <div className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Free-text search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              id="search-query-input"
              type="text"
              value={filters.query}
              onChange={(e) => setFilter('query', e.target.value)}
              placeholder="Search scheme name, ministry, state, or tag…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
            />
            {filters.query && (
              <button onClick={() => setFilter('query', '')} className="absolute right-3 top-2.5 text-slate-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <select
              id="sort-select"
              value={filters.sort}
              onChange={(e) => setFilter('sort', e.target.value as SearchFilters['sort'])}
              className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-teal-500 transition-colors"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Eligible only toggle */}
          <button
            id="btn-eligible-only"
            onClick={() => setFilter('onlyEligible', !filters.onlyEligible)}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              filters.onlyEligible
                ? 'bg-teal-500 text-slate-950 border-teal-400 font-bold'
                : 'bg-slate-950 text-slate-300 border-slate-700 hover:border-slate-600'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Eligible ({eligibleCount})
          </button>

          {/* Advanced filters toggle */}
          <button
            id="btn-advanced-filters"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              showAdvanced
                ? 'bg-slate-700 text-white border-slate-600'
                : 'bg-slate-950 text-slate-300 border-slate-700 hover:border-slate-600'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters {hasActiveFilters({ ...filters, onlyEligible: false, query: '' }) && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-teal-500 text-slate-950 text-[10px] font-bold">{activeChips.filter(c => c.key !== 'onlyEligible').length}</span>}
            {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Advanced filters panel */}
        {showAdvanced && (
          <div className="border-t border-slate-800 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-teal-400 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5" /> Student Profile Filters
              </p>
              <p className="text-[10px] text-slate-500">
                <Info className="w-3 h-3 inline mr-1" />Sensitive fields are optional and used only for local matching.
              </p>
            </div>

            {/* Row 1: Domicile + Category + Level */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label htmlFor="filter-domicile" className={LABEL_CLS}>State / Domicile</label>
                <select id="filter-domicile" value={filters.domicile} onChange={(e) => setFilter('domicile', e.target.value)} className={SELECT_CLS}>
                  <option value="ALL">All Domiciles</option>
                  {domicileOptions.map((d) => <option key={d} value={d}>{d}</option>)}
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
                <label htmlFor="filter-level" className={LABEL_CLS}>Education Level</label>
                <select id="filter-level" value={filters.level} onChange={(e) => setFilter('level', e.target.value)} className={SELECT_CLS}>
                  <option value="ALL">All Levels</option>
                  <option value="HIGHER_SECONDARY">Higher Secondary (Class 11–12)</option>
                  <option value="UNDERGRADUATE">Undergraduate (UG)</option>
                  <option value="POSTGRADUATE">Postgraduate (PG)</option>
                  <option value="DIPLOMA">Diploma / Polytechnic</option>
                </select>
              </div>
            </div>

            {/* Row 2: Gender + Institution + Year */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label htmlFor="filter-gender" className={LABEL_CLS}>Gender — optional</label>
                <select id="filter-gender" value={filters.gender} onChange={(e) => setFilter('gender', e.target.value)} className={SELECT_CLS}>
                  <option value="ALL">All Genders</option>
                  <option value="FEMALE">Female</option>
                  <option value="MALE">Male</option>
                  <option value="OTHER">Other</option>
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
                <label htmlFor="filter-year" className={LABEL_CLS}>Year of Study</label>
                <select id="filter-year" value={filters.yearOfStudy} onChange={(e) => setFilter('yearOfStudy', e.target.value)} className={SELECT_CLS}>
                  <option value="ALL">Any Year</option>
                  {[1, 2, 3, 4, 5, 6].map((y) => <option key={y} value={y.toString()}>Year {y}</option>)}
                </select>
              </div>
            </div>

            {/* Row 3: Income + Marks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="filter-income" className={LABEL_CLS}>Annual Family Income (₹) — optional</label>
                <input
                  id="filter-income"
                  type="number"
                  min={0}
                  value={filters.maxIncome}
                  onChange={(e) => setFilter('maxIncome', e.target.value)}
                  placeholder="Enter your income e.g. 150000"
                  className={SELECT_CLS + ' placeholder-slate-600'}
                />
              </div>
              <div>
                <label htmlFor="filter-marks" className={LABEL_CLS}>Academic Marks / Percentage — optional</label>
                <input
                  id="filter-marks"
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={filters.minMarks}
                  onChange={(e) => setFilter('minMarks', e.target.value)}
                  placeholder="Enter your percentage e.g. 75.5"
                  className={SELECT_CLS + ' placeholder-slate-600'}
                />
              </div>
            </div>

            {/* Row 4: Scheme characteristics */}
            <div className="pt-3 border-t border-slate-800/80">
              <p className="text-xs font-semibold text-violet-400 flex items-center gap-1.5 mb-3">
                <Sparkles className="w-3.5 h-3.5" /> Scholarship Characteristics
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label htmlFor="filter-type" className={LABEL_CLS}>Scheme Type</label>
                  <select id="filter-type" value={filters.schemeType} onChange={(e) => setFilter('schemeType', e.target.value)} className={SELECT_CLS}>
                    <option value="ALL">All Types</option>
                    <option value="MERIT">Merit</option>
                    <option value="MEANS">Means (Need-Based)</option>
                    <option value="MERIT_CUM_MEANS">Merit-cum-Means</option>
                    <option value="CATEGORY_SPECIFIC">Category Specific</option>
                    <option value="GENDER_SPECIFIC">Gender Specific</option>
                    <option value="DISABILITY">Disability</option>
                    <option value="MINORITY">Minority</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="filter-deadline" className={LABEL_CLS}>Deadline Status</label>
                  <select id="filter-deadline" value={filters.deadlineStatus} onChange={(e) => setFilter('deadlineStatus', e.target.value)} className={SELECT_CLS}>
                    <option value="ALL">All Statuses</option>
                    <option value="CRITICAL">Critical (Imminent)</option>
                    <option value="UPCOMING">Upcoming</option>
                    <option value="OPEN">Open</option>
                    <option value="EXPIRED">Expired</option>
                    <option value="UNKNOWN">Unknown</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="filter-renewable" className={LABEL_CLS}>Award Type</label>
                  <select id="filter-renewable" value={filters.isRenewable} onChange={(e) => setFilter('isRenewable', e.target.value)} className={SELECT_CLS}>
                    <option value="ALL">All Award Types</option>
                    <option value="YES">Renewable (Annual)</option>
                    <option value="NO">One-Time Award</option>
                  </select>
                </div>
              </div>

              {/* Toggle checkboxes */}
              <div className="flex flex-wrap gap-4 mt-3">
                {[
                  { key: 'isOpen', label: 'Open Deadline Only', id: 'filter-open' },
                  { key: 'isDisability', label: 'Disability Schemes', id: 'filter-disability' },
                  { key: 'isMinority', label: 'Minority Schemes', id: 'filter-minority' },
                ].map(({ key, label, id }) => (
                  <label key={key} htmlFor={id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      id={id}
                      type="checkbox"
                      checked={filters[key as keyof SearchFilters] as boolean}
                      onChange={(e) => setFilter(key as keyof SearchFilters, e.target.checked as any)}
                      className="rounded border-slate-600 bg-slate-900 text-teal-500 focus:ring-teal-500"
                    />
                    <span className="text-xs text-slate-300">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Active filter chips + result count */}
        {(activeChips.length > 0 || filters.query) && (
          <div className="border-t border-slate-800 px-4 py-3 flex flex-wrap items-center gap-2">
            <span className="text-[10px] text-slate-500 font-semibold uppercase">Active:</span>
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
              className="ml-auto text-[10px] text-rose-400 hover:text-rose-300 font-semibold transition-colors flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear All
            </button>
          </div>
        )}
      </div>

      {/* ── Result count bar ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">
          <span className="text-white font-bold">{sortedSchemes.length}</span> scholarship
          {sortedSchemes.length !== 1 ? 's' : ''} found
          {sortedSchemes.length !== schemes.length && (
            <span className="ml-1 text-slate-500">(of {schemes.length} total)</span>
          )}
        </p>
        {compareIds.size > 0 && (
          <p className="text-xs text-violet-300">
            <Zap className="w-3.5 h-3.5 inline mr-1" />
            {compareIds.size} selected for comparison
          </p>
        )}
      </div>

      {/* ── Scholarship grid ─────────────────────────────────────────────── */}
      {sortedSchemes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
          <AlertCircle className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No scholarships match the selected filters</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Try resetting your filters or removing the eligibility-only toggle to see all government circulars.
          </p>
          <button
            id="btn-reset-empty-state"
            onClick={resetFilters}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-teal-300 hover:bg-slate-700 border border-slate-700"
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
