'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGetAdminNavQuery, IAdminNav } from '@/store/apis/navApi';

// Explicit individual imports tell the compiler exactly what to bundle!
import { 
  ShieldAlert, 
  Menu, 
  X, 
  ChevronLeft, 
  LayoutDashboard, 
  LogOut,
  User,        // Add any specific icons you use on your backend navigation fields here
  FolderKanban,
  GraduationCap,
  Briefcase,
  Wrench,
  Share2,
  Mail,
  CheckSquare,
  Settings,
  Loader2
} from 'lucide-react';

// Create a local map linking strings to your actual imported icon modules
const IconMap: Record<string, React.ComponentType<any>> = {
  ShieldAlert,
  Menu,
  X,
  ChevronLeft,
  LayoutDashboard,
  LogOut,
  User,
  FolderKanban,
  GraduationCap,
  Briefcase,
  Wrench,
  Share2,
  Mail,
  CheckSquare,
  Settings,
  Loader2
};

interface AdminNavbarProps {
  currentView: string;
  setViewAction: (view: string) => void;
}

export default function AdminNavbar({ currentView, setViewAction }: AdminNavbarProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { data: response, isLoading } = useGetAdminNavQuery();
  const navItems = response?.data || [];

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    router.push('/admin-hs');
  };

  const handleNavigation = (viewId: string) => {
    setViewAction(viewId);
    setIsOpen(false);
  };

  return (
    <>
      {/* MOBILE TOP UTILITY CONTROLLER LAYER */}
      <div className="md:hidden w-full bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-50 select-none">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-black flex items-center justify-center">
            <ShieldAlert size={14} className="text-white" />
          </div>
          <div>
            <h1 className="text-xs font-bold tracking-tight text-gray-900 uppercase">Core Workspace</h1>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100"
        >
          {isOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* PRIMARY SIDEBAR PRESENTATION VIEWPORT */}
      <aside 
        className={`
          fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-100 flex flex-col justify-between h-screen font-sans select-none z-50 transition-transform duration-300 ease-in-out
          md:sticky md:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div>
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-black flex items-center justify-center">
                <ShieldAlert size={18} className="text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight text-gray-900 uppercase">Core Workspace</h1>
                <p className="text-[10px] text-gray-400 font-medium tracking-wider uppercase">Administrative Frame</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="md:hidden p-1.5 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-50"
            >
              <ChevronLeft size={18} />
            </button>
          </div>

          <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-160px)]">
            {isLoading ? (
              <div className="p-4 text-xs text-gray-400 animate-pulse flex items-center gap-2">
                <Loader2 size={12} className="animate-spin" />
                <span>Syncing dynamic map...</span>
              </div>
            ) : (
              navItems.map((item: IAdminNav) => {
                // Read from our optimized registry map smoothly
                const DynamicIcon = IconMap[item.iconName] || LayoutDashboard;
                const isActive = currentView === item.id;
                
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavigation(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive 
                        ? 'bg-gray-900 text-white shadow-sm' 
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <DynamicIcon size={18} className={isActive ? 'text-white' : 'text-gray-400'} />
                      <span>{item.label}</span>
                    </div>
                    
                    {!item.isWorking && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-100 uppercase font-bold tracking-wider scale-95">
                        Under Dev
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-50 bg-white">
          <button 
            type="button"
            onClick={handleLogout} 
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50/50 transition-all duration-200"
          >
            <LogOut size={18} />
            <span>Exit Session</span>
          </button>
        </div>
      </aside>
    </>
  );
}