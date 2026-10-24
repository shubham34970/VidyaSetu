import React, { useState } from 'react';
import {
  ShieldCheck,
  Compass,
  UserCheck,
  FileText,
  Calendar,
  Settings,
  Menu,
  X,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import type { StudentProfile } from '../types';

export type NavTab = 'landing' | 'discovery' | 'profile' | 'auditor' | 'deadlines' | 'settings';

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  profile: StudentProfile;
  backendOnline: boolean;
  tinyfishInstalled: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  profile,
  backendOnline,
  tinyfishInstalled,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'landing', label: 'Overview', icon: Sparkles },
    { id: 'discovery', label: 'Scholarships', icon: Compass },
    { id: 'profile', label: 'Profile Wizard', icon: UserCheck },
    { id: 'auditor', label: 'Document Pre-Flight', icon: FileText },
    { id: 'deadlines', label: 'Deadlines', icon: Calendar },
    { id: 'settings', label: 'Sources & Setup', icon: Settings },
  ];

  const handleSelectTab = (tab: NavTab) => {
    onTabChange(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="border-b border-slate-800 bg-navy-950/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Hackathon Identity */}
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => handleSelectTab('landing')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-teal-500/25 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-white group-hover:text-teal-300 transition-colors">
                  VidyaSetu
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-teal-500/20 text-teal-300 rounded border border-teal-500/30 uppercase tracking-wider">
                  Welfare Intel
                </span>
              </div>
              <p className="text-[11px] text-slate-400">HackIIITD 2026 • Team TwoBit (KIET)</p>
            </div>
          </div>

          {/* Desktop Nav Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`inline-flex items-center px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 mr-1.5 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action / System Status */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Active Profile Pill */}
            <button
              onClick={() => handleSelectTab('profile')}
              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-slate-800/80 border border-slate-700 hover:border-slate-600 text-slate-300 transition-colors"
              title="Click to modify active student profile"
            >
              <span className="w-2 h-2 rounded-full bg-teal-400 mr-2"></span>
              <span className="font-medium text-slate-200 truncate max-w-[140px]">{profile.fullName}</span>
              <span className="text-slate-500 mx-1.5">•</span>
              <span className="text-slate-400">{profile.stateDomicile}</span>
            </button>

            {/* Backend / TinyFish Status */}
            <div className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] bg-slate-900 border border-slate-800 text-slate-400">
              <span
                className={`w-2 h-2 rounded-full mr-1.5 ${
                  backendOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              ></span>
              <span>{backendOnline ? 'API Active' : 'Offline Mode'}</span>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-navy-950 px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 mr-2.5 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Profile: {profile.fullName} ({profile.stateDomicile})</span>
            <span className={backendOnline ? 'text-emerald-400' : 'text-amber-400'}>
              {backendOnline ? 'API Connected' : 'Offline'}
            </span>
          </div>
        </div>
      )}
    </header>
  );
};
