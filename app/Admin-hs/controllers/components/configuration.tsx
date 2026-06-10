'use client';

import React, { useState } from 'react';
import { 
  useGetAllNavItemsQuery, 
  useAddNavItemMutation, 
  useEditNavItemMutation, 
  useDeleteNavItemMutation 
} from '@/store/apis/navApi';
import { Plus, Trash2, Eye, EyeOff, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';

export default function ConfigurationView() {
  // 1. Fetch the hook response object
  const { data: response, isLoading } = useGetAllNavItemsQuery();
  
  // 2. Extract elements safely: checking if response has an inner '.data' layout, 
  // otherwise falling back directly to response itself if it is already an array.
  const navItems = Array.isArray(response) 
    ? response 
    : (response as any)?.data || [];

  const [addNavItem] = useAddNavItemMutation();
  const [editNavItem] = useEditNavItemMutation();
  const [deleteNavItem] = useDeleteNavItemMutation();

  // Local Interactive Form Mappings
  const [newId, setNewId] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newIconName, setNewIconName] = useState('LayoutDashboard');
  const [errLog, setErrLog] = useState<string | null>(null);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newId || !newLabel) return;
    setErrLog(null);
    
    try {
      await addNavItem({ 
        // Force lowercase formatting immediately to align with component directory objects safely
        id: newId.toLowerCase().trim(), 
        label: newLabel.trim(), 
        iconName: newIconName.trim(), // Strict Lucide PascalCase mapping (e.g., 'GraduationCap')
        isVisible: true 
      }).unwrap();
      
      setNewId('');
      setNewLabel('');
      setNewIconName('LayoutDashboard');
    } catch (err: any) {
      console.error('Failed provisioning dynamic module node:', err);
      setErrLog(err?.data?.error || err?.message || 'Unknown network processing error.');
    }
  };

  const handleToggleVisibility = async (id: string, currentVisibility: boolean) => {
    try {
      await editNavItem({ id, body: { isVisible: !currentVisibility } }).unwrap();
    } catch (err) {
      console.error('Failed altering visibility state:', err);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteNavItem(id).unwrap();
    } catch (err) {
      console.error('Failed purging module item instance:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-75 flex flex-col items-center justify-center text-gray-400 gap-2 text-sm">
        <RefreshCw size={20} className="animate-spin text-gray-900" />
        <span>Syncing Data Nodes via RTK Cache Layer...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-gray-900">Workspace Management Configuration</h2>
        <p className="text-sm text-gray-400 mt-1">Direct control structure over application layout arrays and portfolio endpoints.</p>
      </div>

      {errLog && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-sm text-red-600 animate-shake">
          <AlertCircle size={16} className="shrink-0" />
          <p><strong className="font-bold">Database Rejected:</strong> {errLog}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT COMPONENT COLUMN: Active Data Collection Manager Grid */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-gray-50 bg-gray-50/40">
            <h3 className="text-xs font-bold tracking-wider text-gray-400 uppercase">Interactive Elements Configuration Engine</h3>
          </div>
          
          <div className="divide-y divide-gray-100">
            {navItems.map((item: any) => (
              <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50/30 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5 font-mono">ID Route Key Target: /{item.id} | Icon Module: {item.iconName}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleVisibility(item.id, item.isVisible)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                      item.isVisible ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'
                    }`}
                  >
                    {item.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                    <span>{item.isVisible ? 'Visible' : 'Hidden'}</span>
                  </button>

                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    title="Delete item"
                    aria-label="Delete item"
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50/50 transition-all duration-200"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COMPONENT COLUMN: Dynamic Route Registry Form Module Wrapper */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-gray-800 pb-2 border-b border-gray-50">
            <Sparkles size={16} className="text-purple-500" />
            <h3 className="text-sm font-bold tracking-tight">Register New Workspace Module</h3>
          </div>

          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold tracking-wider uppercase text-gray-400 mb-1.5">Route Target Key ID</label>
              <input 
                type="text" placeholder="e.g., system, project, education" value={newId} onChange={(e) => setNewId(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black font-mono transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold tracking-wider uppercase text-gray-400 mb-1.5">Label Text Title</label>
              <input 
                type="text" placeholder="e.g., Profile Configuration" value={newLabel} onChange={(e) => setNewLabel(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold tracking-wider uppercase text-gray-400 mb-1.5">Lucide Icon Name Mapping String</label>
              <input 
                type="text" placeholder="e.g., User, Settings, Briefcase, Code" value={newIconName} onChange={(e) => setNewIconName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black font-mono transition-colors"
              />
            </div>

            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-black text-white hover:bg-gray-800 transition-colors py-2.5 rounded-xl text-xs font-bold tracking-wide shadow-sm mt-2">
              <Plus size={14} />
              <span>Provision Workspace Element</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}