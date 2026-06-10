'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useGetAllNavItemsQuery } from '@/store/apis/navApi';
import * as Icons from 'lucide-react';

interface AdminNavbarProps {
  currentView: string;
  setViewAction: (view: string) => void;
}

export default function AdminNavbar({ currentView, setViewAction }: AdminNavbarProps) {
  const router = useRouter();
  
  // RTK Query fetches the base response object. We safely dig down to response.data
  const { data: response, isLoading } = useGetAllNavItemsQuery();
  
  // Safely fallback to an empty array if the response array hasn't landed yet
  const navItems = response?.data || [];

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    router.push('/Admin-hs');
  };

  return (
    <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-gray-100 flex flex-col justify-between h-auto md:h-screen sticky top-0 font-sans select-none z-50">
      <div>
        <div className="p-6 border-b border-gray-50 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-black flex items-center justify-center">
            <Icons.ShieldAlert size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-gray-900 uppercase">Core Workspace</h1>
            <p className="text-[10px] text-gray-400 font-medium tracking-wider uppercase">Administrative Frame</p>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {isLoading ? (
            <div className="p-4 text-xs text-gray-400 animate-pulse flex items-center gap-2">
              <Icons.Loader2 size={12} className="animate-spin" />
              <span>Syncing dynamic map...</span>
            </div>
          ) : (
            navItems.map((item: any) => {
              // Graceful safe evaluation fallback if Lucide text matches fail
              const DynamicIcon = (Icons as any)[item.iconName] || Icons.LayoutDashboard;
              const isActive = currentView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setViewAction(item.id)}
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
                  {!item.isVisible && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-50 text-gray-400 uppercase font-bold tracking-wider scale-95">
                      Muted
                    </span>
                  )}
                </button>
              );
            })
          )}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-50">
        <button 
          onClick={handleLogout} 
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50/50 transition-all duration-200"
        >
          <Icons.LogOut size={18} />
          <span>Exit Session</span>
        </button>
      </div>
    </aside>
  );
}