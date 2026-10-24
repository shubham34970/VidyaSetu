import React, { useState } from 'react';
import {
  Settings,
  Database,
  ShieldCheck,
  Terminal,
  ExternalLink,
  Cpu,
  Lock,
  Building,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface SettingsViewProps {
  backendOnline: boolean;
  tinyfishInstalled: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  backendOnline,
  tinyfishInstalled,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);

  const officialSources = [
    {
      portal: 'National Scholarship Portal (NSP)',
      authority: 'Ministry of Electronics & Information Technology / Ministry of Education, Govt of India',
      url: 'https://scholarships.gov.in',
      schemes: 'Central Sector Scheme of Scholarships (CSSS), Pragati, Post-Matric SC/ST',
      status: 'VERIFIED_OFFICIAL',
    },
    {
      portal: 'UP Scholarship & Fee Reimbursement Portal',
      authority: 'Social Welfare & Backward Classes Welfare Dept, Government of Uttar Pradesh',
      url: 'https://scholarship.up.gov.in',
      schemes: 'Dashmottar Scholarship (General, OBC, SC, ST, Minorities)',
      status: 'VERIFIED_OFFICIAL',
    },
    {
      portal: 'AICTE Student Development Schemes',
      authority: 'All India Council for Technical Education, Govt of India',
      url: 'https://www.aicte-india.org',
      schemes: 'AICTE Pragati for Girls, Saksham, Swanath Technical Fellowships',
      status: 'VERIFIED_OFFICIAL',
    },
    {
      portal: 'Vidya Lakshmi Portal',
      authority: 'Department of Higher Education & NSDL e-Gov',
      url: 'https://www.vidyalakshmi.co.in',
      schemes: 'PM-USP Central Sector Interest Subsidy on Education Loans',
      status: 'VERIFIED_OFFICIAL',
    },
  ];

  return (
    <div className="space-y-8 py-2">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 mb-2">
          <Settings className="w-3.5 h-3.5" />
          <span>System & Transparency</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Data Sources, TinyFish Engine & Privacy Guarantees
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          VidyaSetu is built on radical transparency: every entitlement claim is attributable to an official government circular.
        </p>
      </div>

      {/* Integration Diagnostics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* TinyFish Engine Status */}
        <div className="p-6 rounded-2xl bg-navy-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-teal-400" />
              <h2 className="text-base font-bold text-white">TinyFish Autonomous Web Engine</h2>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                tinyfishInstalled
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                  : 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
              }`}
            >
              {tinyfishInstalled ? 'CLI v0.52.1 Active' : 'Fallback / Cached Mode'}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            TinyFish powers automated circular discovery across JavaScript-heavy SPAs and unstructured government portals. It supports two key operations:
          </p>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <strong className="text-teal-300 block mb-0.5">1. TinyFish Search:</strong>
              <span className="text-slate-400">
                Discovers new announcements and circulars restricted to official domains (<code>scholarships.gov.in</code>, <code>scholarship.up.gov.in</code>).
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <strong className="text-cyan-300 block mb-0.5">2. TinyFish Fetch:</strong>
              <span className="text-slate-400">
                Traverses verified scheme pages and extracts structured deadlines, income caps, and required documentation.
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-teal-400" />
              <span>Configure API Key Locally:</span>
            </div>
            <p className="font-mono text-[11px] text-teal-300/90 break-all">
              echo TINYFISH_API_KEY=your_key &gt;&gt; backend/.env
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Keys are stored server-side only and never committed to Git or sent to client browsers.
            </p>
          </div>
        </div>

        {/* Civic Privacy Guarantee */}
        <div className="p-6 rounded-2xl bg-navy-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Student Data Privacy Policy</h2>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Unlike commercial ed-tech loan aggregators, VidyaSetu is designed strictly as a public-interest civic technology tool:
          </p>

          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-2.5 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Zero Aadhaar / Identity Storage:</strong> We never prompt for or store complete Aadhaar numbers, PAN cards, or bank login credentials.
              </span>
            </div>

            <div className="flex items-start gap-2.5 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Pre-Flight Client-Side Heuristics:</strong> Document validity audits (such as the UP 3-year certificate rule) run client-side or in ephemeral server memory.
              </span>
            </div>

            <div className="flex items-start gap-2.5 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Official Portal Redirection:</strong> Final form submissions always take place directly on the official state or central government domain.
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
            Compliant with Government of India Digital Personal Data Protection (DPDP) Act guidelines.
          </div>
        </div>
      </div>

      {/* Official Data Sources Table */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white">Monitored Government Portals & Circular Feeds</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            VidyaSetu normalizes data strictly from verifiable official authorities.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-navy-900/60">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-navy-950/60 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="p-4">Official Portal</th>
                <th className="p-4">Governing Authority</th>
                <th className="p-4">Target Schemes</th>
                <th className="p-4 text-right">Portal Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {officialSources.map((source, i) => (
                <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-bold text-white">{source.portal}</td>
                  <td className="p-4 text-slate-400">{source.authority}</td>
                  <td className="p-4 text-teal-300/90">{source.schemes}</td>
                  <td className="p-4 text-right">
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-teal-400 hover:text-teal-300 font-semibold"
                    >
                      <span>Visit</span>
                      <ExternalLink className="w-3.5 h-3.5 ml-1" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
