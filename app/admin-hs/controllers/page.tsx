'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, Settings, Loader2, CheckSquare } from 'lucide-react';
import AdminNavbar from './components/navbar';

// ==========================================
// COMPONENT WORKSPACE IMPORTS
// ==========================================
import { SystemUserView } from './components/user'; 
import ConfigurationView from './components/configuration';
import ProjectView from './components/project'; 
import ExperienceSequencer from './components/experience';
import EducationDashboard from './components/education';
import SkillDashboard from './components/skill';
import { SocialManager } from './components/social';
import { ContactInbox } from './components/contact';
import { SystemTodoPanel } from './components/task';
import { useGetAllTasksQuery } from '../../../store/apis/taskApi';


// Dynamic Lookup Dictionary Mapping IDs to Components
const ComponentRegistry: Record<string, React.ComponentType<any>> = {
  system: SystemUserView, 
  configuration: ConfigurationView,
  project: ProjectView,
  experience: ExperienceSequencer, 
  education: EducationDashboard,
skill: SkillDashboard,
  social: SocialManager,
  contact: ContactInbox,
  task: SystemTodoPanel,
};

export default function ControllersPage() {
  const router = useRouter();
  const [activeView, setActiveView] = useState<string>('system');
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

  // Pull global tasks cache directly inside parent dashboard scope
  const { data: tasks = [] } = useGetAllTasksQuery();

  // Dynamic States for Navbar Badges
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [hasUrgentTask, setHasUrgentTask] = useState<boolean>(false);

  // Security Guard Authorization Verification Loop
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      router.replace('/admin-hs');
    } else {
      setIsCheckingAuth(false);
    }
  }, [router]);

  // Compute urgent statuses and count updates every 10 seconds
  useEffect(() => {
    const checkTaskMetrics = () => {
      const incomplete = tasks.filter((t: any) => !t.isCompleted);
      setPendingCount(incomplete.length);

      const now = new Date().getTime();
      const urgent = incomplete.some((task: any) => {
        // Safe string parsing configuration matching your input components
        const targetStr = task.endTime ? `${task.deadline} ${task.endTime}` : `${task.deadline} 23:59:59`;
        const diff = new Date(targetStr).getTime() - now;
        
        // Critical 5-minute limit matching the child card components exactly
        return diff > 0 && diff <= 5 * 60 * 1000; 
      });

      setHasUrgentTask(urgent);
    };

    checkTaskMetrics();
    const interval = setInterval(checkTaskMetrics, 10000);
    return () => clearInterval(interval);
  }, [tasks]);

  const ActiveComponent = ComponentRegistry[activeView];

  if (isCheckingAuth) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white gap-3 px-4 text-center">
        <Loader2 className="animate-spin text-purple-600" size={32} />
        <p className="text-sm font-medium text-gray-500 tracking-wide animate-pulse">
          Verifying administrative credentials...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-white text-gray-900 antialiased selection:bg-gray-100 font-sans">
      
      {/* Side Dynamic Navigation Drawer Component */}
      <AdminNavbar currentView={activeView} setViewAction={setActiveView} />

      {/* Primary Workspace Viewport Window */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Responsive Header */}
        <header className="min-h-16 h-auto md:h-16 border-b border-gray-100 px-4 md:px-6 py-3 md:py-0 flex flex-col md:flex-row md:items-center justify-between bg-white sticky top-0 z-40 select-none gap-3 md:gap-0">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-gray-900" />
            <span className="text-sm font-semibold tracking-tight text-gray-800">Hajra Shahbaz</span>
          </div>

          {/* Responsive Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
            <button 
              type="button"
              onClick={() => setActiveView('configuration')}
              title="Open workspace setup configuration layout drawer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:underline bg-purple-50 px-2.5 py-1.5 md:px-3 md:py-1.5 rounded-lg transition-colors"
            >
              <Settings size={12} />
              <span>Configure Workspace</span>
            </button>

            <button 
              type="button"
              onClick={() => setActiveView('task')}
              title="Navigate straight to system pipeline and task milestones"
              className={`relative inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 md:px-3 md:py-1.5 rounded-lg border transition-all duration-200 ${
                activeView === 'task'
                  ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-100 hover:border-gray-300 hover:text-gray-900'
              } ${hasUrgentTask && activeView !== 'task' ? 'border-red-200 bg-red-50/40 text-red-600 hover:bg-red-50/60' : ''}`}
            >
              <CheckSquare size={12} />
              <span>Task View</span>
              
              {/* Dynamic Pending Count Badge */}
              {pendingCount > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full transition-colors ${
                  activeView === 'task' ? 'bg-white text-gray-900' : 'bg-gray-100 text-gray-700'
                }`}>
                  {pendingCount}
                </span>
              )}

              {/* Real-time 5-Minute Warning Urgent Red Dot Indicator */}
              {hasUrgentTask && (
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              )}
            </button>

            <Link 
              href="/" 
              title="Navigate outward to the viewable public live presentation layer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 border border-gray-100 hover:border-gray-300 px-2.5 py-1.5 md:px-3 md:py-1.5 rounded-lg transition-all duration-200"
            >
              <span>Live Portfolio</span>
              <ArrowUpRight size={14} className="text-gray-400" />
            </Link>
          </div>
        </header>

        {/* Dynamic Inner Layout Body Content */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto bg-white">
          {ActiveComponent ? (
            <ActiveComponent />
          ) : (
            <div className="min-h-[400px] bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center p-6 md:p-8 text-center animate-fade-in">
              <p className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Dynamic Node Target Active</p>
              <p className="text-xs text-gray-400 mt-1 max-w-sm">
                You successfully added the layout route key <span className="font-mono font-bold text-gray-700">"{activeView}"</span> to your database, but you need to register its component inside your <span className="font-mono font-bold text-gray-700">ComponentRegistry</span> map within <span className="font-mono text-purple-600">page.tsx</span>.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}