import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import type { NavTab } from './components/Navbar';
import type { StudentProfile } from './types';
import { INITIAL_STUDENT_PROFILE } from './data/verifiedSchemes';

import { LandingView } from './views/LandingView';
import { ProfileWizardView } from './views/ProfileWizardView';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('landing');
  const [profile, setProfile] = useState<StudentProfile>(INITIAL_STUDENT_PROFILE);
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [tinyfishInstalled, setTinyfishInstalled] = useState<boolean>(false);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/health')
      .then((res) => {
        if (!res.ok) throw new Error('Offline');
        return res.json();
      })
      .then((data) => {
        setBackendOnline(data.status === 'ok');
        setTinyfishInstalled(Boolean(data.tinyfish?.cli_installed));
      })
      .catch(() => {
        setBackendOnline(false);
        setTinyfishInstalled(false);
      });
  }, []);

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
        {activeTab !== 'landing' && activeTab !== 'profile' && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-white mb-2">View: {activeTab}</h2>
            <p className="text-slate-400 text-sm">Under active assembly</p>
          </div>
        )}
      </main>

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
