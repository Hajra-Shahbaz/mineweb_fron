'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  useGetAdminNavQuery, 
  useGetPageNavItemsQuery,
  useGetFullNavigationQuery,
  useGetNavigationStructureQuery,
  IAdminNav,
  IUserNav 
} from '@/store/apis/navApi';

import * as LucideIcons from 'lucide-react';
import * as FontAwesomeIcons from 'react-icons/fa';

const LucideIconMap = LucideIcons as unknown as Record<string, React.ComponentType<any>>;
const FontAwesomeIconMap: Record<string, React.ComponentType<any>> = FontAwesomeIcons;

const getIconComponent = (iconName: string) => {
  if (iconName.startsWith('fa')) {
    const icon = FontAwesomeIconMap[iconName] || FontAwesomeIconMap[iconName.charAt(0).toUpperCase() + iconName.slice(1)];
    if (icon) return icon;
  }
  let lucideIcon = LucideIconMap[iconName] || LucideIconMap[iconName.charAt(0).toUpperCase() + iconName.slice(1)];
  return lucideIcon || LucideIcons.LayoutDashboard;
};

interface AdminNavbarProps {
  currentView: string;
  setViewAction: (view: string) => void;
}

export default function AdminNavbar({ currentView, setViewAction }: AdminNavbarProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  
  const { data: adminResponse, isLoading: adminLoading } = useGetAdminNavQuery();
  const { data: pageResponse, isLoading: pageLoading } = useGetPageNavItemsQuery();
  const { data: fullNavResponse, isLoading: fullNavLoading } = useGetFullNavigationQuery();
  const { data: structureResponse, isLoading: structureLoading } = useGetNavigationStructureQuery();
  
  const navItems = adminResponse?.data || [];
  const pageItems = pageResponse?.data || [];
  const isLoading = adminLoading || pageLoading || fullNavLoading || structureLoading;

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    router.push('/admin-hs');
  };

  return (
    <>
      {/* MOBILE HEADER */}
      <div className="md:hidden w-full bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-black flex items-center justify-center shadow-sm">
            <LucideIcons.ShieldAlert size={16} className="text-white" />
          </div>
          <span className="font-bold text-gray-900 tracking-tight">Core</span>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-black hover:bg-gray-100 rounded-md transition-colors">
          {isOpen ? <LucideIcons.X size={20} /> : <LucideIcons.Menu size={20} />}
        </button>
      </div>

      {/* OVERLAY */}
      {isOpen && <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsOpen(false)} />}

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 flex flex-col h-screen z-50 transition-transform duration-300 md:sticky md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        
        {/* BRANDING */}
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gray-900 flex items-center justify-center">
              <LucideIcons.ShieldAlert size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900 tracking-tight">CORE WORKSPACE</h1>
              <p className="text-[10px] text-gray-400 font-semibold tracking-widest uppercase">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {isLoading ? (
             <div className="flex items-center gap-2 text-gray-400 text-xs px-4"><LucideIcons.Loader2 className="animate-spin" size={14} /> Loading...</div>
          ) : (
            <>
              {/* Admin Section */}
              <div className="space-y-1">
                {navItems.map((item: IAdminNav) => {
                  const Icon = getIconComponent(item.iconName);
                  const isActive = currentView === item.id;
                  return (
                    <button key={item.id} onClick={() => { setViewAction(item.id); setIsOpen(false); }} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive ? 'bg-indigo-50 text-black shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                      <div className="flex items-center gap-3">
                        <Icon size={18} className={isActive ? 'text-black' : 'text-gray-400'} />
                        {item.label}
                      </div>
                      {!item.isWorking && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                    </button>
                  );
                })}
              </div>

              {/* Pages Section */}
              {pageItems.length > 0 && (
                <div className="space-y-1">
                  <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Pages</p>
                  {pageItems.map((item: IUserNav) => {
                    const Icon = getIconComponent(item.iconName);
                    const isActive = currentView === item.id;
                    return (
                      <button key={item.id} onClick={() => { item.isPage && item.route ? router.push(`/${item.route}`) : setViewAction(item.id); setIsOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                        <Icon size={18} />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </nav>

        {/* LOGOUT */}
        <div className="p-4 border-t border-gray-100">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors">
            <LucideIcons.LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}