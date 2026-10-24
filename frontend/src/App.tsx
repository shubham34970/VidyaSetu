import React, { useEffect, useState } from 'react';
import { ShieldCheck, Compass, FileCheck, Calendar, Activity, CheckCircle2 } from 'lucide-react';

interface HealthData {
  status: string;
  service: string;
  version: string;
  environment: string;
  tinyfish: {
    cli_installed: boolean;
    cli_version: string;
    api_key_configured: boolean;
  };
}

export const App: React.FC = () => {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/health')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: HealthData) => {
        setHealth(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Backend offline');
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-slate-800 bg-navy-950/80 backdrop-blur-md px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-white">VidyaSetu</span>
                <span className="px-2 py-0.5 text-xs font-semibold bg-teal-500/20 text-teal-300 rounded border border-teal-500/30">
                  Welfare Intelligence
                </span>
              </div>
              <p className="text-xs text-slate-400">HackIIITD 2026 • Team TwoBit (KIET)</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse"></span>
              Foundation Online
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 flex flex-col justify-center">
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-teal-950/60 border border-teal-500/30 text-teal-300 text-xs font-medium mb-6">
            <Activity className="w-3.5 h-3.5" />
            <span>Autonomous Higher-Education Entitlement Engine</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
            Bridging India's <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-400">₹4,200+ Crore</span> Higher-Ed Welfare Gap
          </h1>

          <p className="text-lg text-slate-300 leading-relaxed mb-8">
            VidyaSetu monitors fragmented state and central welfare portals, extracts dynamic gazette circulars via TinyFish, explains personalized eligibility, and audits compliance documents before submission.
          </p>

          {/* Quick Feature Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start space-x-3">
              <Compass className="w-5 h-5 text-teal-400 mt-0.5 shrink-0" />
              <div>
                <h2 className="text-sm font-semibold text-white">Live Discovery</h2>
                <p className="text-xs text-slate-400 mt-1">NSP, UP Post-Matric & AICTE schemes synced.</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start space-x-3">
              <FileCheck className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
              <div>
                <h2 className="text-sm font-semibold text-white">Document Pre-Flight</h2>
                <p className="text-xs text-slate-400 mt-1">Prevents 84% technical rejection trap.</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <h2 className="text-sm font-semibold text-white">Deadline Alerts</h2>
                <p className="text-xs text-slate-400 mt-1">Time-series tracking of circular extensions.</p>
              </div>
            </div>
          </div>

          {/* Backend Diagnostics Card */}
          <div className="p-5 rounded-2xl bg-navy-900 border border-slate-800 text-sm">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <span className="font-semibold text-slate-200">System Integration Check</span>
              <span className="text-xs text-slate-400">FastAPI + TinyFish CLI v0.52.1</span>
            </div>

            {loading ? (
              <div className="text-slate-400 text-xs py-2 flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full border-2 border-teal-400 border-t-transparent animate-spin"></span>
                <span>Connecting to backend services...</span>
              </div>
            ) : error ? (
              <div className="text-amber-400 text-xs py-2">
                Backend connection: {error} (Start backend via <code className="bg-slate-800 px-1 py-0.5 rounded text-slate-200">uvicorn backend.main:app --port 8000</code>)
              </div>
            ) : health ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block">Service</span>
                  <span className="text-emerald-400 font-medium flex items-center mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Online
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">API Version</span>
                  <span className="text-slate-200 font-mono mt-0.5 block">{health.version}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">TinyFish CLI</span>
                  <span className="text-teal-400 font-mono mt-0.5 block">
                    {health.tinyfish.cli_installed ? `v${health.tinyfish.cli_version}` : 'Not detected'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">API Key Status</span>
                  <span className="text-slate-300 mt-0.5 block">
                    {health.tinyfish.api_key_configured ? 'Configured' : 'Offline / Cached'}
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 px-6 text-center text-xs text-slate-500">
        VidyaSetu • Built for HackIIITD 2026 by Team TwoBit • KIET Group of Institutions
      </footer>
    </div>
  );
};

export default App;
