'use client';

import React, { useState, useMemo } from 'react';
import { 
  useGetAdminNavQuery,
  useCreateAdminNavItemMutation,
  useEditAdminNavItemMutation,
  useDeleteAdminNavItemMutation,
  useReorderAdminNavMutation,
  useGetUserNavQuery,
  useCreateUserNavItemMutation,
  useEditUserNavItemMutation,
  useDeleteUserNavItemMutation,
  useReorderUserNavMutation,
  IAdminNav,
  IUserNav
} from '@/store/apis/navApi';
import { 
  Plus, Trash2, Eye, EyeOff, Sparkles, RefreshCw, AlertCircle, 
  Shield, Briefcase, FileCode, GripVertical, Edit3, X, Check, Search
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
// Integrated requested robust accessible framework mapping engine
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

type TabType = 'admin' | 'user';

const FONT_AWESOME_ICONS = [
  'fa-solid fa-house', 'fa-solid fa-user', 'fa-solid fa-gear', 'fa-solid fa-chart-line',
  'fa-solid fa-envelope', 'fa-solid fa-folder', 'fa-solid fa-code', 'fa-solid fa-briefcase',
  'fa-solid fa-graduation-cap', 'fa-solid fa-layer-group', 'fa-solid fa-laptop-code',
  'fa-solid fa-database', 'fa-solid fa-server', 'fa-solid fa-terminal', 'fa-solid fa-book',
  'fa-solid fa-shield-halved', 'fa-solid fa-bars-progress', 'fa-solid fa-link',
  'fa-brands fa-github', 'fa-brands fa-linkedin', 'fa-brands fa-twitter', 'fa-brands fa-react'
];

const LUCIDE_ICON_NAMES = Object.keys(LucideIcons).filter(
  (key) => typeof (LucideIcons as any)[key] === 'function' || typeof (LucideIcons as any)[key] === 'object'
);

interface UnifiedIconItem {
  id: string;
  type: 'lucide' | 'fontawesome';
  displayName: string;
  rawValue: string;
}

export default function ConfigurationView() {
  const [activeTab, setActiveTab] = useState<TabType>('admin');

  const { data: adminResponse, isLoading: adminLoading } = useGetAdminNavQuery();
  const { data: userResponse, isLoading: userLoading } = useGetUserNavQuery({ visibleOnly: false });

  const [createAdminItem] = useCreateAdminNavItemMutation();
  const [editAdminItem] = useEditAdminNavItemMutation();
  const [deleteAdminItem] = useDeleteAdminNavItemMutation();
  const [reorderAdminNav] = useReorderAdminNavMutation();

  const [createUserItem] = useCreateUserNavItemMutation();
  const [editUserItem] = useEditUserNavItemMutation();
  const [deleteUserItem] = useDeleteUserNavItemMutation();
  const [reorderUserNav] = useReorderUserNavMutation();

  const [newId, setNewId] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newIconName, setNewIconName] = useState('');
  const [iconSearchTerm, setIconSearchTerm] = useState('');
  const [errLog, setErrLog] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editIconName, setEditIconName] = useState('');
  const [isInlinePickerOpen, setIsInlinePickerOpen] = useState(false);

  const adminItems = adminResponse?.data || [];
  const userItems = userResponse?.data || [];
  const isLoading = activeTab === 'admin' ? adminLoading : userLoading;

  const masterIconPool = useMemo(() => {
    const lucideMapped: UnifiedIconItem[] = LUCIDE_ICON_NAMES.map(name => ({
      id: `lucide-${name}`,
      type: 'lucide',
      displayName: name,
      rawValue: name
    }));

    const faMapped: UnifiedIconItem[] = FONT_AWESOME_ICONS.map(name => {
      const cleanName = name.split(' ').pop()?.replace('fa-', '') || name;
      const formattedDisplayName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
      return {
        id: `fa-${name}`,
        type: 'fontawesome',
        displayName: formattedDisplayName,
        rawValue: name
      };
    });

    return [...lucideMapped, ...faMapped];
  }, []);

  const filteredIcons = useMemo(() => {
    const lowerSearch = iconSearchTerm.toLowerCase();
    return masterIconPool
      .filter(icon => icon.displayName.toLowerCase().includes(lowerSearch))
      .slice(0, 40);
  }, [iconSearchTerm, masterIconPool]);

  const formatComponentName = (id: string) => {
    if (!id) return '';
    const pascalId = id
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
    return `${pascalId}UserView`;
  };

  const renderItemIcon = (iconName: string) => {
    if (iconName.startsWith('fa-')) {
      return <i className={`${iconName} text-sm text-gray-500 shrink-0 w-4 text-center`}></i>;
    }
    const TargetIcon = (LucideIcons as any)[iconName] || LucideIcons.HelpCircle;
    return <TargetIcon size={15} className="text-gray-500 shrink-0" />;
  };

  // Replaces flaky native drop mechanics completely with type-safe @hello-pangea/dnd calculations
  const handleDragEnd = async (result: DropResult) => {
    const { source, destination } = result;
    
    // Dropped outside a valid drop zone bounding container reference matrix or index untouched
    if (!destination || source.index === destination.index) return;

    try {
      setErrLog(null);
      
      if (activeTab === 'admin') {
        const currentItems: IAdminNav[] = [...adminItems];
        const [movedItem] = currentItems.splice(source.index, 1);
        
        if (movedItem) {
          currentItems.splice(destination.index, 0, movedItem);
          
          const sanitizedItems = currentItems.map(item => ({
            id: item.id,
            label: item.label,
            iconName: item.iconName,
            isWorking: item.isWorking
          }));

          await reorderAdminNav({ sortedItems: sanitizedItems }).unwrap();
        }
      } else {
        const currentItems: IUserNav[] = [...userItems];
        const [movedItem] = currentItems.splice(source.index, 1);
        
        if (movedItem) {
          currentItems.splice(destination.index, 0, movedItem);
          
          const sanitizedItems = currentItems.map(item => ({
            id: item.id,
            label: item.label,
            iconName: item.iconName,
            isVisible: item.isVisible
          }));

          await reorderUserNav({ sortedItems: sanitizedItems }).unwrap();
        }
      }
    } catch (err: any) {
      console.error('Failed processing drag reorder sync:', JSON.stringify(err, null, 2) || err);
      const detailedError = err?.data?.error || err?.data?.message || err?.message || 'Database validation rejected layout structural format.';
      setErrLog(detailedError);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newId || !newLabel) return;
    setErrLog(null);
    
    const formattedId = newId.toLowerCase().trim();
    
    try {
      if (activeTab === 'admin') {
        await createAdminItem({ 
          id: formattedId, 
          label: newLabel.trim(), 
          iconName: newIconName.trim(), 
          isWorking: true 
        }).unwrap();
      } else {
        await createUserItem({ 
          id: formattedId, 
          label: newLabel.trim(), 
          iconName: newIconName.trim(), 
          isVisible: true 
        }).unwrap();
      }
      
      setNewId('');
      setNewLabel('');
      setNewIconName('LayoutDashboard');
      setIconSearchTerm('');
    } catch (err: any) {
      console.error('Failed provisioning dynamic module node:', err);
      setErrLog(err?.data?.error || err?.message || 'Unknown network processing error.');
    }
  };

  const startInlineEditing = (id: string, currentLabel: string, currentIcon: string) => {
    setEditingId(id);
    setEditLabel(currentLabel);
    setEditIconName(currentIcon);
    setIsInlinePickerOpen(true);
  };

  const cancelInlineEditing = () => {
    setEditingId(null);
    setEditLabel('');
    setEditIconName('');
    setIsInlinePickerOpen(false);
  };

  const handleSaveEditSubmit = async (id: string) => {
    if (!editLabel.trim()) return;
    setErrLog(null);
    try {
      if (activeTab === 'admin') {
        await editAdminItem({ 
          targetId: id, 
          body: { label: editLabel.trim(), iconName: editIconName.trim() } 
        }).unwrap();
      } else {
        await editUserItem({ 
          targetId: id, 
          body: { label: editLabel.trim(), iconName: editIconName.trim() } 
        }).unwrap();
      }
      setEditingId(null);
      setIsInlinePickerOpen(false);
    } catch (err: any) {
      console.error('Failed editing structural node:', err);
      setErrLog(err?.data?.error || err?.message || 'Failed processing field updating operations.');
    }
  };

  const handleToggleState = async (id: string, currentState: boolean) => {
    try {
      if (activeTab === 'admin') {
        await editAdminItem({ targetId: id, body: { isWorking: !currentState } }).unwrap();
      } else {
        await editUserItem({ targetId: id, body: { isVisible: !currentState } }).unwrap();
      }
    } catch (err) {
      console.error('Failed altering component state reference:', err);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      if (activeTab === 'admin') {
        await deleteAdminItem(id).unwrap();
      } else {
        await deleteUserItem(id).unwrap();
      }
    } catch (err) {
      console.error('Failed purging module item instance:', err);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900">Workspace Management Configuration</h2>
          <p className="text-sm text-gray-400 mt-1">Direct control structure over separate administrative and portfolio endpoints.</p>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-xl w-fit border border-gray-200/50 self-start">
          <button
            type="button"
            onClick={() => { setActiveTab('admin'); setErrLog(null); cancelInlineEditing(); }}
            title="Switch to Administrative Navbar Configuration Mode"
            aria-label="Admin Navigation Setup View"
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold tracking-wide rounded-lg transition-all ${
              activeTab === 'admin' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'
            }`}
          >
            <Shield size={14} />
            Admin Navbar
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('user'); setErrLog(null); cancelInlineEditing(); }}
            title="Switch to Public Portfolio Navigation Setup View"
            aria-label="Public Navigation Setup View"
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold tracking-wide rounded-lg transition-all ${
              activeTab === 'user' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'
            }`}
          >
            <Briefcase size={14} />
            Public Portfolio Nav
          </button>
        </div>
      </div>

      {errLog && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-sm text-red-600 animate-shake">
          <AlertCircle size={16} className="shrink-0" />
          <p><strong className="font-bold">Database Rejected:</strong> {errLog}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-gray-50 bg-gray-50/40">
            <h3 className="text-xs font-bold tracking-wider text-gray-400 uppercase">
              Interactive Elements: {activeTab === 'admin' ? 'Administrative Workspace Map' : 'Public Portfolio Map'}
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Drag items safely using the grip element handle area.</p>
          </div>
          
          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center text-gray-400 gap-2 text-sm">
              <RefreshCw size={20} className="animate-spin text-gray-900" />
              <span>Syncing Data Nodes via RTK Cache Layer...</span>
            </div>
          ) : (
            // Context mapping bounds
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="navigation-droppable-list-zone">
                {(provided) => (
                  <div 
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="divide-y divide-gray-100 bg-white"
                  >
                    {activeTab === 'admin' ? (
                      adminItems.length === 0 ? (
                        <p className="p-8 text-center text-xs text-gray-400">No administrative items registered.</p>
                      ) : (
                        adminItems.map((item: IAdminNav, index: number) => {
                          const isRowEditing = editingId === item.id;
                          return (
                            <Draggable key={item.id} draggableId={item.id} index={index} isDragDisabled={isRowEditing}>
                              {(dragProvided, snapshot) => (
                                <div 
                                  ref={dragProvided.innerRef}
                                  {...dragProvided.draggableProps}
                                  style={dragProvided.draggableProps.style as React.CSSProperties}
                                  className={`p-5 flex items-center gap-4 hover:bg-gray-50/50 transition-all duration-150 select-none bg-white ${
                                    snapshot.isDragging ? 'shadow-lg ring-1 ring-black/5 bg-gray-50/90 z-10 rounded-xl' : ''
                                  }`}
                                >
                                  <div 
                                    {...dragProvided.dragHandleProps}
                                    className={`text-gray-300 p-1 ${isRowEditing ? 'cursor-not-allowed opacity-30' : 'cursor-grab active:cursor-grabbing hover:text-gray-600 transition-colors'}`}
                                  >
                                    <GripVertical size={16} />
                                  </div>

                                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    {isRowEditing ? (
                                      <div className="flex-1 grid grid-cols-1 gap-2 max-w-md">
                                        <input 
                                          type="text" 
                                          value={editLabel} 
                                          onChange={(e) => setEditLabel(e.target.value)}
                                          className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-black font-semibold"
                                          placeholder="Edit label..."
                                        />
                                        <div className="text-[11px] text-purple-600 font-mono flex items-center gap-2 mt-1">
                                          <span>Active Icon asset: </span>
                                          {renderItemIcon(editIconName)}
                                          <strong className="font-bold">{editIconName}</strong>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="space-y-1">
                                        <div className="flex items-center gap-2.5">
                                          {renderItemIcon(item.iconName)}
                                          <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                                          <span className="text-[10px] bg-gray-100 text-gray-600 font-mono px-1.5 py-0.5 rounded">
                                            id: {item.id}
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                    
                                    <div className="flex items-center gap-2 self-end sm:self-center">
                                      {isRowEditing ? (
                                        <>
                                          <button
                                            type="button"
                                            onClick={() => handleSaveEditSubmit(item.id)}
                                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg border border-green-200 transition-colors"
                                            title="Save configurations"
                                          >
                                            <Check size={14} />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={cancelInlineEditing}
                                            className="p-1.5 text-gray-400 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
                                            title="Cancel updating fields"
                                          >
                                            <X size={14} />
                                          </button>
                                        </>
                                      ) : (
                                        <>
                                          <button
                                            type="button"
                                            onClick={() => startInlineEditing(item.id, item.label, item.iconName)}
                                            className="p-1.5 text-gray-400 hover:text-black rounded-lg hover:bg-gray-100 transition-all duration-200"
                                            title="Edit text node mapping"
                                          >
                                            <Edit3 size={15} />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleToggleState(item.id, item.isWorking)}
                                            title="Toggle workspace activation status"
                                            aria-label="Toggle status visibility"
                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                                              item.isWorking ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'
                                            }`}
                                          >
                                            {item.isWorking ? <Eye size={14} /> : <EyeOff size={14} />}
                                            <span>{item.isWorking ? 'Active' : 'Under Dev'}</span>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteItem(item.id)}
                                            title="Purge link record from database"
                                            aria-label="Delete link record completely"
                                            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50/50 transition-all duration-200"
                                          >
                                            <Trash2 size={16} />
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          );
                        })
                      )
                    ) : userItems.length === 0 ? (
                      <p className="p-8 text-center text-xs text-gray-400">No public portfolio navigation items registered.</p>
                    ) : (
                      userItems.map((item: IUserNav, index: number) => {
                        const isRowEditing = editingId === item.id;
                        return (
                          <Draggable key={item.id} draggableId={item.id} index={index} isDragDisabled={isRowEditing}>
                            {(dragProvided, snapshot) => (
                              <div 
                                ref={dragProvided.innerRef}
                                {...dragProvided.draggableProps}
                                style={dragProvided.draggableProps.style as React.CSSProperties}
                                className={`p-5 flex items-center gap-4 hover:bg-gray-50/50 transition-all duration-150 select-none bg-white ${
                                  snapshot.isDragging ? 'shadow-lg ring-1 ring-black/5 bg-gray-50/90 z-10 rounded-xl' : ''
                                }`}
                              >
                                <div 
                                  {...dragProvided.dragHandleProps}
                                  className={`text-gray-300 p-1 ${isRowEditing ? 'cursor-not-allowed opacity-30' : 'cursor-grab active:cursor-grabbing hover:text-gray-600 transition-colors'}`}
                                >
                                  <GripVertical size={16} />
                                </div>

                                <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                  {isRowEditing ? (
                                    <div className="flex-1 grid grid-cols-1 gap-2 max-w-md">
                                      <input 
                                        type="text" 
                                        value={editLabel} 
                                        onChange={(e) => setEditLabel(e.target.value)}
                                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-black font-semibold"
                                        placeholder="Edit label..."
                                      />
                                      <div className="text-[11px] text-purple-600 font-mono flex items-center gap-2 mt-1">
                                        <span>Active Icon asset: </span>
                                        {renderItemIcon(editIconName)}
                                        <strong className="font-bold">{editIconName}</strong>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2.5">
                                        {renderItemIcon(item.iconName)}
                                        <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                                        <span className="text-[10px] bg-gray-100 text-gray-600 font-mono px-1.5 py-0.5 rounded">
                                          id: {item.id}
                                        </span>
                                      </div>
                                      
                                      <div className="text-xs text-gray-400 space-y-0.5 font-sans">
                                        <div className="flex items-center gap-1 text-gray-500 font-medium">
                                          <FileCode size={13} className="text-purple-500 shrink-0" />
                                          <span>Portfolio Route: </span>
                                          <code className="text-purple-600 font-mono text-[11px] bg-purple-50/50 px-1 rounded">/{item.id}</code>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  
                                  <div className="flex items-center gap-2 self-end sm:self-center">
                                    {isRowEditing ? (
                                      <>
                                        <button
                                          type="button"
                                          onClick={() => handleSaveEditSubmit(item.id)}
                                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg border border-green-200 transition-colors"
                                          title="Save configurations"
                                        >
                                          <Check size={14} />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={cancelInlineEditing}
                                          className="p-1.5 text-gray-400 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
                                          title="Cancel updating fields"
                                        >
                                          <X size={14} />
                                        </button>
                                      </>
                                    ) : (
                                      <>
                                        <button
                                          type="button"
                                          onClick={() => startInlineEditing(item.id, item.label, item.iconName)}
                                          className="p-1.5 text-gray-400 hover:text-black rounded-lg hover:bg-gray-100 transition-all duration-200"
                                          title="Edit text node mapping"
                                        >
                                          <Edit3 size={15} />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleToggleState(item.id, item.isVisible)}
                                          title="Toggle route viewport filter"
                                          aria-label="Toggle visibility node"
                                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                                            item.isVisible ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'
                                          }`}
                                        >
                                          {item.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                                          <span>{item.isVisible ? 'Visible' : 'Hidden'}</span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteItem(item.id)}
                                          title="Purge link record from database"
                                          aria-label="Delete user item record completely"
                                          className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50/50 transition-all duration-200"
                                        >
                                          <Trash2 size={16} />
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>

        {/* Sidebar Creation Panel Card Layout */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2 text-gray-800 pb-2 border-b border-gray-50">
            <Sparkles size={16} className="text-purple-500" />
            <h3 className="text-sm font-bold tracking-tight">
              Provision to: <span className="capitalize font-mono bg-gray-50 text-purple-600 px-1.5 py-0.5 rounded text-xs">{activeTab}</span>
            </h3>
          </div>

          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold tracking-wider uppercase text-gray-400 mb-1.5">Route Target Key ID</label>
              <input 
                type="text" placeholder="e.g., system, project, education" value={newId} onChange={(e) => setNewId(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black font-mono transition-colors"
              />
              {newId && activeTab === 'admin' && (
                <p className="text-[10px] text-blue-500 mt-1 font-sans">
                  Will map to component: <code className="font-mono font-bold">{formatComponentName(newId)}</code>
                </p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold tracking-wider uppercase text-gray-400 mb-1.5">Label Text Title</label>
              <input 
                type="text" placeholder="e.g., Profile Configuration" value={newLabel} onChange={(e) => setNewLabel(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black transition-colors"
              />
            </div>

            <div className="pt-2 border-t border-gray-50 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold tracking-wider uppercase text-gray-400">
                  Select System Display Icon
                </label>
                <div className="flex items-center gap-1.5 text-xs text-black bg-gray-50 border border-gray-200 rounded-lg px-2 py-0.5 font-mono max-w-[150px] truncate">
                  {renderItemIcon(editingId && isInlinePickerOpen ? editIconName : newIconName)}
                  <span className="truncate">{editingId && isInlinePickerOpen ? editIconName : newIconName}</span>
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={13} />
                <input 
                  type="text" 
                  placeholder="Filter catalog icons instantly by name..." 
                  value={iconSearchTerm}
                  onChange={(e) => setIconSearchTerm(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:border-black focus:bg-white transition-all"
                />
              </div>

              <div className="border border-gray-100 rounded-xl overflow-hidden bg-gray-50/30">
                <div className="p-2 grid grid-cols-4 gap-1.5 overflow-y-auto max-h-48 min-h-32">
                  {filteredIcons.length === 0 ? (
                    <div className="col-span-4 p-4 text-center text-[11px] text-gray-400">
                      No matching icons found.
                    </div>
                  ) : (
                    filteredIcons.map((icon) => {
                      const currentActiveTarget = editingId && isInlinePickerOpen ? editIconName : newIconName;
                      const isSelected = currentActiveTarget === icon.rawValue;
                      return (
                        <button
                          key={icon.id}
                          type="button"
                          title={`Select ${icon.displayName}`}
                          aria-label={`Select display icon named ${icon.displayName}`}
                          onClick={() => {
                            if (editingId && isInlinePickerOpen) {
                              setEditIconName(icon.rawValue);
                            } else {
                              setNewIconName(icon.rawValue);
                            }
                          }}
                          className={`p-2 rounded-lg flex flex-col items-center justify-center gap-1 border text-center transition-all bg-white hover:bg-black hover:text-white ${
                            isSelected ? 'border-purple-500 ring-1 ring-purple-400 bg-purple-50/20 font-bold' : 'border-gray-100 hover:border-black'
                          }`}
                        >
                          {icon.type === 'lucide' ? (
                            (() => {
                              const IconComponent = (LucideIcons as any)[icon.rawValue];
                              return IconComponent && <IconComponent size={14} />;
                            })()
                          ) : (
                            <i className={`${icon.rawValue} text-xs`}></i>
                          )}
                          <span className="text-[8px] font-mono truncate w-full tracking-tighter px-0.5">{icon.displayName}</span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              title={`Provision ${activeTab === 'admin' ? 'Admin' : 'Portfolio'} Link`} 
              aria-label="Provision navigation setup node" 
              className="w-full flex items-center justify-center gap-2 bg-black text-white hover:bg-gray-800 transition-colors py-2.5 rounded-xl text-xs font-bold tracking-wide shadow-sm mt-4"
            >
              <Plus size={14} />
              <span>Provision {activeTab === 'admin' ? 'Admin' : 'Portfolio'} Link</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}