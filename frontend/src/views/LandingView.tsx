import React from 'react';
import {
  ShieldCheck,
  Compass,
  FileCheck2,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertOctagon,
  Layers,
  CheckCircle2,
  Building2,
  Search,
} from 'lucide-react';
import type { NavTab } from '../components/Navbar';
import { ProvenanceBadge } from '../components/StatusBadge';
import { VERIFIED_SCHEMES } from '../data/verifiedSchemes';

interface LandingViewProps {
  onNavigate: (tab: NavTab) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-navy-900/90 via-navy-950/80 to-slate-950 p-8 sm:p-12 lg:p-16 border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>

        <div className="relative max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-950/70 border border-teal-500/30 text-teal-300 text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>HackIIITD 2026 • Welfare Intelligence Engine</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6">
            Recovering India's{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-indigo-400">
              ₹4,200+ Crore
            </span>{' '}
            Unclaimed Student Welfare
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 leading-relaxed mb-8">
            VidyaSetu autonomously tracks dynamic state circulars, normalizes eligibility criteria, audits certificates against strict validity windows, and guides students to official portal submissions.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => onNavigate('profile')}
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-slate-950 shadow-lg shadow-teal-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Check My Eligibility</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>

            <button
              onClick={() => onNavigate('discovery')}
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl text-sm font-semibold bg-slate-800/90 hover:bg-slate-700/90 text-white border border-slate-700 transition-all"
            >
              <Search className="w-4 h-4 mr-2 text-teal-400" />
              <span>Explore Verified Schemes</span>
            </button>
          </div>
        </div>

        {/* Live Metrics Row */}
        <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 pt-8 border-t border-slate-800/80">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-teal-400" />
            </div>
            <div>
              <div className="text-2xl font-black text-white">₹4,200+ Cr</div>
              <div className="text-xs text-slate-400">Annual Unspent Welfare Budget</div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
              <AlertOctagon className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <div className="text-2xl font-black text-white">84% Trap</div>
              <div className="text-xs text-slate-400">Rejected on Minor Certificate Flaws</div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Layers className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <div className="text-2xl font-black text-white">30+ Portals</div>
              <div className="text-xs text-slate-400">Fragmented Gazette Circulars</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Architecture Workflow */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            How VidyaSetu Operates End-to-End
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Eliminating procedural friction through autonomous web intelligence and client-side pre-flight audits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold text-sm mb-4 border border-teal-500/20">
              01
            </div>
            <h3 className="text-base font-bold text-white mb-2">Student Intake</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Input domicile, income, caste category, and degree. No Aadhaar numbers or bank passwords stored.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-sm mb-4 border border-cyan-500/20">
              02
            </div>
            <h3 className="text-base font-bold text-white mb-2">TinyFish Discovery</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              TinyFish API navigates state circulars and NSP gazettes in real time, extracting live deadlines and caps.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-sm mb-4 border border-indigo-500/20">
              03
            </div>
            <h3 className="text-base font-bold text-white mb-2">Pre-Flight Audit</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Validates certificate issuance cutoffs (e.g. UP 3-year income rule) and Aadhaar-NPCI seeding before submission.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm mb-4 border border-emerald-500/20">
              04
            </div>
            <h3 className="text-base font-bold text-white mb-2">Guided Portal Action</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Provides direct authenticated deep links to state portals with deadline countdowns and extension alerts.
            </p>
          </div>
        </div>
      </section>

      {/* Target Schemes Spotlight */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Priority Higher-Education Schemes
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Actively tracked and verified against official government circulars.
            </p>
          </div>

          <button
            onClick={() => onNavigate('discovery')}
            className="inline-flex items-center text-xs font-semibold text-teal-400 hover:text-teal-300"
          >
            <span>View All Schemes</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {VERIFIED_SCHEMES.slice(0, 3).map((scheme) => (
            <div
              key={scheme.id}
              className="p-6 rounded-2xl bg-navy-900/60 border border-slate-800 hover:border-slate-700 flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <ProvenanceBadge status={scheme.verificationStatus} />
                  <span className="text-[11px] font-mono text-slate-400">Deadline: {scheme.applicationDeadline}</span>
                </div>

                <h3 className="text-base font-bold text-white line-clamp-2 mb-2">
                  {scheme.name}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-3 mb-4">
                  {scheme.description}
                </p>

                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 mb-4">
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">Max Benefit</div>
                  <div className="text-sm font-bold text-teal-300 mt-0.5">
                    {scheme.benefitAmountFormatted}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 truncate max-w-[150px]">{scheme.portalName}</span>
                <button
                  onClick={() => onNavigate('discovery')}
                  className="font-medium text-teal-400 hover:text-teal-300 inline-flex items-center"
                >
                  Inspect Rules →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Team TwoBit / Hackathon Footer Banner */}
      <section className="p-8 rounded-2xl bg-gradient-to-r from-navy-900 to-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-teal-400 mb-1">
            <Building2 className="w-4 h-4" />
            <span>KIET Group of Institutions • Team TwoBit</span>
          </div>
          <h3 className="text-lg font-bold text-white">Ready to assess student welfare entitlements?</h3>
          <p className="text-xs text-slate-400 mt-1">
            Configure student parameters and run the deterministic eligibility and document audit engine.
          </p>
        </div>

        <button
          onClick={() => onNavigate('profile')}
          className="inline-flex items-center px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 transition-colors shrink-0"
        >
          Launch Profile Wizard
          <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
        </button>
      </section>
    </div>
  );
};
