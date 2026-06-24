'use client';

import React, { useState, useRef, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { 
  GripVertical, 
  Layers, 
  RefreshCw, 
  Plus, 
  Pencil, 
  Trash2, 
  Sparkles, 
  X, 
  AlertCircle,
  ExternalLink,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Copy,
  Filter,
  Loader2,
  FolderOpen
} from 'lucide-react';
import { 
  useGetAllProjectsQuery,
  useAddProjectMutation,
  useEditProjectMutation,
  useDeleteProjectMutation,
  useReorderProjectsMutation,
  useToggleProjectVisibilityMutation,
  useBulkDeleteProjectsMutation
} from '@/store/apis/projectApi';

export default function ProjectDashboard() {
  // --- RTK Query Hooks ---
  const { data: rawProjects, isLoading, refetch } = useGetAllProjectsQuery();
  const [reorderProjects] = useReorderProjectsMutation();
  const [addProject, { isLoading: isAdding }] = useAddProjectMutation();
  const [editProject, { isLoading: isEditing }] = useEditProjectMutation();
  const [deleteProject] = useDeleteProjectMutation();
  const [toggleVisibility] = useToggleProjectVisibilityMutation();
  const [bulkDeleteProjects] = useBulkDeleteProjectsMutation();

  // --- Safe Cache Array Normalization ---
  const projects = Array.isArray(rawProjects) 
    ? rawProjects 
    : (rawProjects as any)?.data || [];

  // --- Interactive UI State Management ---
  const [editTargetId, setEditTargetId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [techStackInput, setTechStackInput] = useState(''); 
  const [liveUrl, setLiveUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorLog, setErrorLog] = useState<string | null>(null);
  const [isHidden, setIsHidden] = useState(false);
  const [isWorking, setIsWorking] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showOnlyVisible, setShowOnlyVisible] = useState(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectAllRef = useRef<HTMLInputElement>(null);

  // --- Filtered Projects ---
  const filteredProjects = showOnlyVisible 
    ? projects.filter((p: any) => !p.isHidden)
    : projects;

  // --- Clear copy success message after 2 seconds ---
  useEffect(() => {
    if (copySuccess) {
      const timer = setTimeout(() => setCopySuccess(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [copySuccess]);

  // --- Switch Form Fields to Edit Mode ---
  const handleInitiateEdit = (item: any) => {
    setErrorLog(null);
    setEditTargetId(item._id);
    setTitle(item.title || '');
    setDescription(item.description || '');
    setTechStackInput(Array.isArray(item.techStack) ? item.techStack.join(', ') : '');
    setLiveUrl(item.liveUrl || '');
    setGithubUrl(item.githubUrl || '');
    setIsHidden(item.isHidden || false);
    setIsWorking(item.isWorking !== undefined ? item.isWorking : true);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- Reset Form Fields ---
  const resetFormState = () => {
    setEditTargetId(null);
    setTitle('');
    setDescription('');
    setTechStackInput('');
    setLiveUrl('');
    setGithubUrl('');
    setIsHidden(false);
    setIsWorking(true);
    setSelectedFile(null);
    setErrorLog(null);
    setIsSubmitting(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- Form Submit Router ---
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    if (!title.trim() || !description.trim() || !techStackInput.trim()) {
      setErrorLog('Please fill out all required fields (Title, Description, Tech Stack).');
      return;
    }

    const isDuplicate = projects.some(
      (p: any) => p.title.trim().toLowerCase() === title.trim().toLowerCase() && p._id !== editTargetId
    );
    if (isDuplicate) {
      setErrorLog('A project with this exact title already exists. Please use a unique title.');
      return;
    }

    setErrorLog(null);
    setIsSubmitting(true);

    const techStackArray = techStackInput
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('techStack', JSON.stringify(techStackArray));
    formData.append('isHidden', String(isHidden));
    formData.append('isWorking', String(isWorking));
    
    if (liveUrl.trim()) formData.append('liveUrl', liveUrl.trim());
    if (githubUrl.trim()) formData.append('githubUrl', githubUrl.trim());
    
    if (selectedFile) {
      formData.append('imageUrl', selectedFile); 
    }

    try {
      if (editTargetId) {
        await editProject({ id: editTargetId, data: formData }).unwrap();
      } else {
        await addProject(formData).unwrap();
      }
      resetFormState();
    } catch (err: any) {
      console.error('Data sync rejection error:', err);
      setErrorLog(err?.data?.error?.message || err?.data?.message || 'Schema validation or duplication rejection failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Delete Handler Pipeline ---
  const handleDeleteClick = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this project profile record?')) return;
    try {
      await deleteProject(id).unwrap();
      if (editTargetId === id) resetFormState();
    } catch (err) {
      console.error('Purge transaction error:', err);
    }
  };

  // --- Toggle Visibility Handler ---
  const handleToggleVisibility = async (id: string) => {
    try {
      await toggleVisibility(id).unwrap();
    } catch (err) {
      console.error('Failed to toggle visibility:', err);
    }
  };

  // --- Bulk Delete Handler ---
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} project(s)?`)) return;
    
    try {
      await bulkDeleteProjects(selectedIds).unwrap();
      setSelectedIds([]);
    } catch (err) {
      console.error('Bulk delete failed:', err);
    }
  };

  // --- Select/Deselect All ---
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredProjects.map((p: any) => p._id));
    } else {
      setSelectedIds([]);
    }
  };

  // --- Toggle Single Selection ---
  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  // --- Drag & Drop Reordering Pipeline ---
  const handleOnDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    if (result.destination.index === result.source.index) return;

    const rawItems = Array.from(filteredProjects);
    const [movedItem] = rawItems.splice(result.source.index, 1);
    rawItems.splice(result.destination.index, 0, movedItem);

    const totalSequence = rawItems.map((item: any, index) => ({
      id: item._id,
      order: index, 
    }));

    try {
      await reorderProjects(totalSequence).unwrap();
      refetch();
    } catch (err) {
      console.error('Failed processing server-side sequence updates:', err);
    }
  };

  // --- Copy ID to Clipboard ---
  const copyToClipboard = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopySuccess('ID copied!');
  };

  // --- Get Status Badge ---
  const getStatusBadge = (item: any) => {
    if (item.isWorking && !item.isHidden) {
      return { label: 'Active', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle };
    }
    if (item.isHidden) {
      return { label: 'Hidden', color: 'bg-gray-100 text-gray-500 border-gray-200', icon: EyeOff };
    }
    if (!item.isWorking) {
      return { label: 'Inactive', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: XCircle };
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-3">
        <Loader2 size={32} className="animate-spin text-gray-300" />
        <span className="text-sm text-gray-400 font-medium">Loading projects...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 pb-8 pt-2 space-y-5">
      
      {/* Toast Notification */}
      {copySuccess && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm shadow-xl z-50 transition-all duration-300 flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-400" />
          {copySuccess}
        </div>
      )}

      {/* Header Container Area */}
      <div className="flex items-center justify-between flex-wrap gap-3 py-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <FolderOpen size={24} className="text-gray-400" />
            Project Portfolio
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Manage, reorder, and showcase your development projects
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowOnlyVisible(!showOnlyVisible)}
            className={`p-2 rounded-xl transition-all duration-200 ${
              showOnlyVisible 
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50 border border-transparent'
            }`}
            title={showOnlyVisible ? 'Show all projects' : 'Show only visible projects'}
          >
            <Filter size={17} />
          </button>
          
          <button
            onClick={() => refetch()}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all duration-200 border border-transparent hover:border-gray-200"
            title="Refresh Projects"
          >
            <RefreshCw size={17} className={isLoading ? 'animate-spin' : ''} />
          </button>
          
          <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
            <span className="text-xs font-medium text-gray-600">
              {filteredProjects.length}
            </span>
            <span className="text-xs text-gray-400">/</span>
            <span className="text-xs text-gray-400">{projects.length}</span>
          </div>
        </div>
      </div>

      {errorLog && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-sm text-red-700">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <p className="flex-1"><strong className="font-semibold">Error:</strong> {errorLog}</p>
          <button 
            onClick={() => setErrorLog(null)}
            className="text-red-400 hover:text-red-600 transition-colors p-1"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* LEFT COLUMN: 2-Column Responsive Card Display Sync */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
            <h3 className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase flex items-center gap-2">
              <GripVertical size={14} />
              Sequence Aligner
            </h3>
            
            {/* Bulk Actions */}
            {filteredProjects.length > 0 && (
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    ref={selectAllRef}
                    type="checkbox"
                    checked={selectedIds.length === filteredProjects.length && filteredProjects.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-2 focus:ring-gray-400 focus:ring-offset-0"
                  />
                  <span className="text-[10px] text-gray-400 font-medium">Select All</span>
                </label>
                {selectedIds.length > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    className="text-[10px] font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 px-2.5 py-1 rounded-lg transition-all duration-200"
                  >
                    Delete ({selectedIds.length})
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="p-4">
            {filteredProjects.length === 0 ? (
              <div className="py-12 border-2 border-dashed border-gray-200 rounded-2xl text-center">
                <FolderOpen size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-sm text-gray-400 font-medium">
                  {projects.length === 0 
                    ? 'No projects yet. Create your first project!'
                    : 'No visible projects. Toggle the filter to see all.'
                  }
                </p>
              </div>
            ) : (
              <DragDropContext onDragEnd={handleOnDragEnd}>
                <Droppable droppableId="project-dash-list">
                  {(provided) => (
                    <div 
                      {...provided.droppableProps} 
                      ref={provided.innerRef} 
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      {filteredProjects.map((item: any, index: number) => {
                        const statusBadge = getStatusBadge(item);
                        const StatusIcon = statusBadge?.icon;

                        return (
                          <Draggable key={item._id} draggableId={item._id} index={index}>
                            {(provided, snapshot) => {
                              const draggableStyle = {
                                ...provided.draggableProps.style,
                              };

                              return (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  style={draggableStyle}
                                  className={`group flex flex-col justify-between p-4 bg-white border-2 rounded-2xl transition-all duration-200 h-[155px] relative ${
                                    item.isHidden ? 'opacity-50 grayscale' : ''
                                  } ${
                                    item.isWorking && !item.isHidden 
                                      ? 'border-emerald-200 bg-emerald-50/30' 
                                      : !item.isWorking && !item.isHidden
                                      ? 'border-amber-200 bg-amber-50/30'
                                      : 'border-gray-200 bg-gray-50/30'
                                  } ${
                                    snapshot.isDragging 
                                      ? 'border-gray-900 shadow-xl scale-[1.02] bg-white ring-2 ring-gray-900/10' 
                                      : item.isWorking && !item.isHidden 
                                      ? 'hover:border-emerald-300 hover:shadow-md' 
                                      : 'hover:border-gray-300 hover:shadow-sm'
                                  }`}
                                >
                                  {/* Status Badge */}
                                  {statusBadge && (
                                    <div className={`absolute top-3 right-3 flex items-center gap-1.5 ${statusBadge.color} px-2 py-0.5 rounded-full border`}>
                                      {StatusIcon && <StatusIcon size={11} />}
                                      <span className="text-[9px] font-semibold uppercase tracking-wide">{statusBadge.label}</span>
                                    </div>
                                  )}

                                  {/* Top Segment */}
                                  <div className="flex items-start gap-3 min-w-0">
                                    <div {...provided.dragHandleProps} className="p-0.5 mt-0.5 text-gray-300 hover:text-gray-600 cursor-grab active:cursor-grabbing shrink-0 transition-colors">
                                      <GripVertical size={16} />
                                    </div>

                                    <input
                                      type="checkbox"
                                      checked={selectedIds.includes(item._id)}
                                      onChange={() => toggleSelection(item._id)}
                                      className="w-4 h-4 mt-0.5 rounded border-gray-300 text-gray-900 focus:ring-2 focus:ring-gray-400 focus:ring-offset-0 shrink-0"
                                      onClick={(e) => e.stopPropagation()}
                                    />

                                    {item.imageUrl ? (
                                      <img src={item.imageUrl} alt={item.title} className="w-11 h-11 rounded-xl object-cover bg-gray-50 border border-gray-200 shrink-0" />
                                    ) : (
                                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-gray-400 border border-gray-200 shrink-0">
                                        <Layers size={18} />
                                      </div>
                                    )}

                                    <div className="truncate space-y-0.5 min-w-0 flex-1">
                                      <h4 className="text-sm font-semibold text-gray-800 truncate">{item.title}</h4>
                                      <p className="text-[11px] text-gray-400 truncate w-full">
                                        {Array.isArray(item.techStack) ? item.techStack.slice(0, 3).join(', ') : ''}
                                        {Array.isArray(item.techStack) && item.techStack.length > 3 && '...'}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Bottom Segment */}
                                  <div className="flex items-center justify-between border-t border-gray-200/60 pt-2.5 mt-1">
                                    <div className="flex gap-2 items-center">
                                      <span className="text-[9px] font-mono font-semibold bg-gray-100 px-2 py-0.5 rounded-md text-gray-500">
                                        #{item.order}
                                      </span>
                                      
                                      <button
                                        onClick={() => handleToggleVisibility(item._id)}
                                        className={`p-1 rounded-lg transition-all duration-200 ${
                                          item.isHidden 
                                            ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100' 
                                            : 'text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50'
                                        }`}
                                        title={item.isHidden ? 'Show Project' : 'Hide Project'}
                                      >
                                        {item.isHidden ? <EyeOff size={13} /> : <Eye size={13} />}
                                      </button>
                                      
                                      <div className="flex items-center gap-1 ml-0.5">
                                        {item.githubUrl && (
                                          <a href={item.githubUrl} target="_blank" rel="noopener noreferrer" className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all" title="View Source">
                                            <FontAwesomeIcon icon={faGithub} className="w-3.5 h-3.5" />
                                          </a>
                                        )}
                                        {item.liveUrl && (
                                          <a href={item.liveUrl} target="_blank" rel="noopener noreferrer" className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all" title="View Live">
                                            <ExternalLink size={13} />
                                          </a>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-0.5 opacity-70 group-hover:opacity-100 transition-opacity">
                                      <button
                                        type="button"
                                        onClick={() => copyToClipboard(item._id)}
                                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                                        title="Copy ID"
                                      >
                                        <Copy size={12} />
                                      </button>
                                      <button 
                                        type="button" 
                                        onClick={() => handleInitiateEdit(item)} 
                                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                                        title="Edit"
                                      >
                                        <Pencil size={13} />
                                      </button>
                                      <button 
                                        type="button" 
                                        onClick={() => handleDeleteClick(item._id)} 
                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        title="Delete"
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    </div>
                                  </div>

                                </div>
                              );
                            }}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Form */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4 lg:-mt-2">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2.5 text-gray-800">
              <div className={`p-1.5 rounded-xl ${editTargetId ? 'bg-amber-50 text-amber-600' : 'bg-purple-50 text-purple-600'}`}>
                <Sparkles size={15} />
              </div>
              <h3 className="text-sm font-bold tracking-tight">
                {editTargetId ? 'Edit Project' : 'New Project'}
              </h3>
            </div>
            {editTargetId && (
              <button 
                type="button" 
                onClick={resetFormState} 
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-all"
                title="Cancel"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-3.5">
            <div>
              <label htmlFor="titleInput" className="block text-[10px] font-semibold tracking-wider uppercase text-gray-500 mb-1">Title <span className="text-red-400">*</span></label>
              <input 
                id="titleInput" 
                type="text" 
                placeholder="e.g., Cat Matchmaking Portal" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all bg-gray-50/50 hover:bg-white" 
                required
              />
            </div>

            <div>
              <label htmlFor="techStackInput" className="block text-[10px] font-semibold tracking-wider uppercase text-gray-500 mb-1">Tech Stack <span className="text-red-400">*</span> <span className="lowercase italic font-normal text-gray-400">(comma separated)</span></label>
              <input 
                id="techStackInput" 
                type="text" 
                placeholder="React, Node.js, TypeScript" 
                value={techStackInput} 
                onChange={(e) => setTechStackInput(e.target.value)} 
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all bg-gray-50/50 hover:bg-white" 
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="liveUrlInput" className="block text-[10px] font-semibold tracking-wider uppercase text-gray-500 mb-1">Live URL</label>
                <input 
                  id="liveUrlInput" 
                  type="url" 
                  placeholder="https://..." 
                  value={liveUrl} 
                  onChange={(e) => setLiveUrl(e.target.value)} 
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all bg-gray-50/50 hover:bg-white" 
                />
              </div>
              <div>
                <label htmlFor="githubUrlInput" className="block text-[10px] font-semibold tracking-wider uppercase text-gray-500 mb-1">GitHub</label>
                <input 
                  id="githubUrlInput" 
                  type="url" 
                  placeholder="https://github.com/..." 
                  value={githubUrl} 
                  onChange={(e) => setGithubUrl(e.target.value)} 
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all bg-gray-50/50 hover:bg-white" 
                />
              </div>
            </div>

            <div>
              <label htmlFor="descriptionInput" className="block text-[10px] font-semibold tracking-wider uppercase text-gray-500 mb-1">Description <span className="text-red-400">*</span></label>
              <textarea 
                id="descriptionInput" 
                rows={2} 
                placeholder="Describe your project..." 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all bg-gray-50/50 hover:bg-white resize-none" 
                required
              />
            </div>

            {/* Status Toggles */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold tracking-wider uppercase text-gray-500 mb-1">Visibility</label>
                <button
                  type="button"
                  onClick={() => setIsHidden(!isHidden)}
                  className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isHidden 
                      ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200' 
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  {isHidden ? <EyeOff size={15} /> : <Eye size={15} />}
                  {isHidden ? 'Hidden' : 'Visible'}
                </button>
              </div>
              <div>
                <label className="block text-[10px] font-semibold tracking-wider uppercase text-gray-500 mb-1">Status</label>
                <button
                  type="button"
                  onClick={() => setIsWorking(!isWorking)}
                  className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isWorking 
                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  {isWorking ? <CheckCircle size={15} /> : <XCircle size={15} />}
                  {isWorking ? 'Active' : 'Inactive'}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="projectScreenshotInput" className="block text-[10px] font-semibold tracking-wider uppercase text-gray-500 mb-1">
                Screenshot {editTargetId && <span className="font-normal lowercase italic text-gray-400">(optional)</span>}
              </label>
              <input 
                id="projectScreenshotInput" 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} 
                className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 cursor-pointer transition-all" 
              />
              {editTargetId && (
                <p className="text-[10px] text-gray-400 mt-1">Leave empty to keep current image</p>
              )}
            </div>

            <button 
              type="submit" 
              disabled={isAdding || isEditing || isSubmitting}
              className={`w-full flex items-center justify-center gap-2.5 text-white py-2.5 rounded-xl text-sm font-semibold tracking-wide shadow-sm transition-all duration-200 ${
                editTargetId 
                  ? 'bg-amber-600 hover:bg-amber-700 active:scale-[0.98]' 
                  : 'bg-gray-900 hover:bg-gray-800 active:scale-[0.98]'
              } disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100`}
            >
              {(isAdding || isEditing || isSubmitting) ? (
                <Loader2 size={17} className="animate-spin" />
              ) : editTargetId ? (
                <Pencil size={17} />
              ) : (
                <Plus size={17} />
              )}
              <span>
                {isAdding || isEditing || isSubmitting 
                  ? 'Saving...' 
                  : editTargetId 
                    ? 'Update Project' 
                    : 'Add Project'
                }
              </span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}