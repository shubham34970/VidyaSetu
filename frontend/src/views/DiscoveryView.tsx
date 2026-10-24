import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Compass,
  Sparkles,
  RefreshCw,
  Building2,
  CheckCircle2,
  AlertCircle,
  Database,
} from 'lucide-react';
import type { ScholarshipScheme, StudentProfile } from '../types';
import { ScholarshipCard, evaluateLocalEligibility } from '../components/ScholarshipCard';

interface DiscoveryViewProps {
  schemes: ScholarshipScheme[];
  profile: StudentProfile;
  onSelectScheme: (scheme: ScholarshipScheme) => void;
  onRefreshDiscovery?: () => void;
  isSyncing?: boolean;
}

export const DiscoveryView: React.FC<DiscoveryViewProps> = ({
  schemes,
  profile,
  onSelectScheme,
  onRefreshDiscovery,
  isSyncing = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomicile, setSelectedDomicile] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [onlyEligible, setOnlyEligible] = useState(false);

  // Filter schemes
  const filteredSchemes = useMemo(() => {
    return schemes.filter((scheme) => {
      // Search
      const matchesSearch =
        scheme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scheme.authority.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scheme.portalName.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Domicile
      if (selectedDomicile !== 'ALL') {
        const allowed = scheme.criteria.allowedDomiciles || [];
        const matchesDom = allowed.includes('All States & UTs') || allowed.includes(selectedDomicile);
        if (!matchesDom) return false;
      }

      // Category
      if (selectedCategory !== 'ALL') {
        const allowedCats = scheme.criteria.allowedCategories || [];
        if (!allowedCats.includes(selectedCategory)) return false;
      }

      // Eligibility toggle
      if (onlyEligible) {
        const res = evaluateLocalEligibility(scheme, profile);
        if (res.verdict !== 'ELIGIBLE') return false;
      }

      return true;
    });
  }, [schemes, searchQuery, selectedDomicile, selectedCategory, onlyEligible, profile]);

  // Aggregate total potential benefit for eligible schemes
  const eligibleCount = useMemo(() => {
    return schemes.filter((s) => evaluateLocalEligibility(s, profile).verdict === 'ELIGIBLE').length;
  }, [schemes, profile]);

  return (
    <div className="space-y-8 py-2">
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/20 mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>Scholarship Discovery Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Higher-Education Schemes & Gazette Circulars
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time multi-portal intelligence cross-checked against your profile ({profile.fullName} •{' '}
            {profile.stateDomicile} • {profile.socialCategory}).
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onRefreshDiscovery && (
            <button
              onClick={onRefreshDiscovery}
              disabled={isSyncing}
              className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isSyncing ? 'animate-spin text-teal-400' : ''}`} />
              <span>{isSyncing ? 'Syncing Portals...' : 'Sync Live Portals'}</span>
            </button>
          )}

          <div className="p-3 rounded-xl bg-teal-950/60 border border-teal-500/30 text-right">
            <div className="text-[10px] text-teal-400 font-semibold uppercase">Eligible Matches</div>
            <div className="text-lg font-black text-white">
              {eligibleCount}{' '}
              <span className="text-xs font-normal text-slate-400">/ {schemes.length} schemes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-navy-900/60 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scheme name, ministry, or portal (e.g. UP Post-Matric, AICTE, NSP)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setOnlyEligible(!onlyEligible)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                onlyEligible
                  ? 'bg-teal-500 text-slate-950 border-teal-400 font-bold'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Matching Only ({eligibleCount})</span>
            </button>
          </div>
        </div>

        {/* Detailed Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
              Domicile Restriction
            </label>
            <select
              value={selectedDomicile}
              onChange={(e) => setSelectedDomicile(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-teal-500"
            >
              <option value="ALL">All Domiciles (National + States)</option>
              <option value="Uttar Pradesh">Uttar Pradesh (UP Schemes)</option>
              <option value="Delhi">Delhi</option>
              <option value="Bihar">Bihar</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
              Social Category Eligibility
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-teal-500"
            >
              <option value="ALL">All Categories</option>
              <option value="GENERAL">General</option>
              <option value="OBC">OBC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
              <option value="EWS">EWS</option>
            </select>
          </div>
        </div>
      </div>

      {/* Schemes Grid */}
      {filteredSchemes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchemes.map((scheme) => (
            <ScholarshipCard
              key={scheme.id}
              scheme={scheme}
              profile={profile}
              onSelect={onSelectScheme}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-navy-900/40 border border-slate-800 space-y-3">
          <AlertCircle className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No scholarships match the selected filters</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Try resetting your search query or disabling "Matching Only" to view all available government circulars.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedDomicile('ALL');
              setSelectedCategory('ALL');
              setOnlyEligible(false);
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-teal-300 hover:bg-slate-700 border border-slate-700"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
