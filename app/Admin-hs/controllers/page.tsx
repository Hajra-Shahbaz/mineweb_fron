'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Settings } from 'lucide-react';
import AdminNavbar from './components/navbar';

// Import all of your workspace view files
import SystemUserView from './components/user';
import ConfigurationView from './components/configuration';
import ProjectView from './components/project'; 
import ExperienceSequencer from './components/experience';
import EducationDashboard from './components/education';
import SkillDashboard from './components/skill';
import { SocialManager } from './components/social';


// Map your Database "Route Target Key ID" string tokens directly to your imported React Components
const ComponentRegistry: Record<string, React.ComponentType<any>> = {
  system: SystemUserView,
  configuration: ConfigurationView,
  project: ProjectView,
  experience: ExperienceSequencer, 
  education:EducationDashboard,
  skill: SkillDashboard, 
  social: SocialManager,
  
};

export default function ControllersPage() {
  // Set the default view to 'system' (Profile Configuration)
  const [activeView, setActiveView] = useState<string>('system');

  // Look up the component context dynamically from our registry map
  const ActiveComponent = ComponentRegistry[activeView];

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-white text-gray-900 antialiased selection:bg-gray-100 font-sans">
      
      {/* Side Dynamic Navigation Drawer Component */}
      <AdminNavbar currentView={activeView} setViewAction={setActiveView} />

      {/* Primary Workspace Viewport Window */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-gray-100 px-6 flex items-center justify-between bg-white sticky top-0 z-40 select-none">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-gray-900" />
            <span className="text-sm font-semibold tracking-tight text-gray-800">Hajra Shahbaz</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick access utility override button to pull up the navigation system form anytime */}
            <button 
              onClick={() => setActiveView('configuration')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:underline bg-purple-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Settings size={12} />
              <span>Configure Workspace</span>
            </button>

            <Link 
              href="/portfolio" 
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 border border-gray-100 hover:border-gray-300 px-3 py-1.5 rounded-lg transition-all duration-200"
            >
              <span>Live Portfolio</span>
              <ArrowUpRight size={14} className="text-gray-400" />
            </Link>
          </div>
        </header>

        {/* Dynamic Inner Layout Body Content */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto bg-white">
          {ActiveComponent ? (
            <ActiveComponent />
          ) : (
            /* Fallback display grid frame if you added an items key via MongoDB but have not imported/registered its component file yet */
            <div className="min-h-[400px] bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center p-8 animate-fade-in">
              <p className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Dynamic Node Target Active</p>
              <p className="text-xs text-gray-400 mt-1 max-w-sm text-center">
                You successfully added the layout route key <span className="font-mono font-bold text-gray-700">"{activeView}"</span> to your database, but you need to register its component inside your <span className="font-mono font-bold text-gray-700">ComponentRegistry</span> map within <span className="font-mono text-purple-600">page.tsx</span>.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}