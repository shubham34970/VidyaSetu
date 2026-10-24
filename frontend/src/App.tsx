import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import type { NavTab } from './components/Navbar';
import type { StudentProfile } from './types';
import { INITIAL_STUDENT_PROFILE } from './data/verifiedSchemes';

import { LandingView } from './views/LandingView';
import { ProfileWizardView } from './views/ProfileWizardView';
import { DiscoveryView } from './views/DiscoveryView';
import { DocumentAuditorView } from './views/DocumentAuditorView';
import { DeadlineTrackerView } from './views/DeadlineTrackerView';
import { SettingsView } from './views/SettingsView';
import { ScholarshipDetailModal } from './components/ScholarshipDetailModal';
import { VERIFIED_SCHEMES } from './data/verifiedSchemes';
import type { ScholarshipScheme } from './types';

import { api } from './services/api';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('landing');
  const [profile, setProfile] = useState<StudentProfile>(INITIAL_STUDENT_PROFILE);
  const [schemes, setSchemes] = useState<ScholarshipScheme[]>(VERIFIED_SCHEMES);
  const [selectedScheme, setSelectedScheme] = useState<ScholarshipScheme | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [tinyfishInstalled, setTinyfishInstalled] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  useEffect(() => {
    // Initial health check
    api
      .getHealth()
      .then((data) => {
        setBackendOnline(data.status === 'ok');
        setTinyfishInstalled(Boolean(data.tinyfish?.cli_installed));
      })
      .catch(() => {
        setBackendOnline(false);
        setTinyfishInstalled(false);
      });

    // Initial schemes fetch
    api
      .getScholarships()
      .then((data) => {
        if (data && data.length > 0) setSchemes(data);
      })
      .catch(() => {});
  }, []);

  const handleRefreshDiscovery = async () => {
    setIsSyncing(true);
    try {
      const res = await api.searchDiscovery('scholarships', true);
      if (res && res.schemes && res.schemes.length > 0) {
        setSchemes(res.schemes);
      }
    } catch {
      // Fallback intact
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        profile={profile}
        backendOnline={backendOnline}
        tinyfishInstalled={tinyfishInstalled}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'landing' && <LandingView onNavigate={setActiveTab} />}
        {activeTab === 'profile' && (
          <ProfileWizardView
            profile={profile}
            onSaveProfile={setProfile}
            onComplete={() => setActiveTab('discovery')}
          />
        )}
        {activeTab === 'discovery' && (
          <DiscoveryView
            schemes={schemes}
            profile={profile}
            onSelectScheme={setSelectedScheme}
            onRefreshDiscovery={handleRefreshDiscovery}
            isSyncing={isSyncing}
          />
        )}
        {activeTab === 'auditor' && <DocumentAuditorView profile={profile} />}
        {activeTab === 'deadlines' && <DeadlineTrackerView />}
        {activeTab === 'settings' && (
          <SettingsView
            backendOnline={backendOnline}
            tinyfishInstalled={tinyfishInstalled}
          />
        )}
      </main>

      {selectedScheme && (
        <ScholarshipDetailModal
          scheme={selectedScheme}
          profile={profile}
          onClose={() => setSelectedScheme(null)}
          onNavigateToAuditor={() => setActiveTab('auditor')}
        />
      )}

      <footer className="border-t border-slate-800/80 bg-navy-950/60 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>VidyaSetu • HackIIITD 2026 (Esya '26) • Team TwoBit • KIET Group of Institutions</p>
          <p className="text-slate-400">Autonomous Welfare Intelligence Powered by TinyFish API</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
