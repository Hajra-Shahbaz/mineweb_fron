'use client';

import React, { useState, useRef } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { 
  GripVertical, 
  RefreshCw, 
  Plus, 
  Pencil, 
  Trash2, 
  Sparkles, 
  X, 
  AlertCircle,
  Briefcase,
  MapPin,
  Calendar,
  FileText
} from 'lucide-react';
import { 
  useGetAllExperiencesQuery,
  useAddExperienceMutation,
  useEditExperienceMutation,
  useDeleteExperienceMutation,
  useReorderExperiencesMutation
} from '../../../../store/apis/experienceApi';

export default function ExperienceDashboard() {
  // --- RTK Query Hooks ---
  const { data: rawExperiences, isLoading } = useGetAllExperiencesQuery();
  const [reorderExperiences] = useReorderExperiencesMutation();
  const [addExperience, { isLoading: isAdding }] = useAddExperienceMutation();
  const [editExperience, { isLoading: isEditing }] = useEditExperienceMutation();
  const [deleteExperience] = useDeleteExperienceMutation();

  // --- Safe Cache Array Normalization ---
  const experiences = Array.isArray(rawExperiences) 
    ? rawExperiences 
    : (rawExperiences as any)?.data || [];

  // --- Interactive UI State Management ---
  const [editTargetId, setEditTargetId] = useState<string | null>(null);
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentJob, setCurrentJob] = useState(false);
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorLog, setErrorLog] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Inline Date Formatter Vector ---
  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return isNaN(date.getTime()) 
      ? dateStr 
      : date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  // --- Switch Form Fields to Edit Mode ---
  const handleInitiateEdit = (item: any) => {
    setErrorLog(null);
    setEditTargetId(item._id);
    setCompany(item.company || '');
    setRole(item.role || '');
    setLocation(item.location || '');
    setStartDate(item.startDate || '');
    setCurrentJob(item.currentJob || false);
    setEndDate(item.currentJob ? '' : item.endDate || '');
    setDescription(item.description || '');
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- Reset Form Fields ---
  const resetFormState = () => {
    setEditTargetId(null);
    setCompany('');
    setRole('');
    setLocation('');
    setStartDate('');
    setEndDate('');
    setCurrentJob(false);
    setDescription('');
    setSelectedFile(null);
    setErrorLog(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- Form Submit Router ---
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!company.trim() || !role.trim() || !startDate.trim() || !description.trim()) {
      setErrorLog('Please fill out all required validation tracking fields (Company, Role, Start Date, Description).');
      return;
    }

    if (!currentJob && !endDate.trim()) {
      setErrorLog('Please provide an End Date or verify that you currently work here.');
      return;
    }

    setErrorLog(null);

    const formData = new FormData();
    formData.append('company', company.trim());
    formData.append('role', role.trim());
    formData.append('location', location.trim());
    formData.append('startDate', startDate.trim());
    formData.append('currentJob', String(currentJob));
    formData.append('endDate', currentJob ? '' : endDate.trim());
    formData.append('description', description.trim());
    
    if (selectedFile) {
      formData.append('experiencePic', selectedFile); 
    }

    try {
      if (editTargetId) {
        await editExperience({ id: editTargetId, data: formData }).unwrap();
      } else {
        await addExperience(formData).unwrap();
      }
      resetFormState();
    } catch (err: any) {
      console.error('Data sync rejection error:', err);
      setErrorLog(err?.data?.error?.message || err?.data?.message || 'Schema validation configuration setup failed.');
    }
  };

  // --- Delete Handler Pipeline ---
  const handleDeleteClick = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this experience profile record?')) return;
    try {
      await deleteExperience(id).unwrap();
      if (editTargetId === id) resetFormState();
    } catch (err) {
      console.error('Purge transaction error:', err);
    }
  };

  // --- Drag & Drop Reordering Pipeline ---
  const handleOnDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    if (result.destination.index === result.source.index) return;

    const rawItems = Array.from(experiences);
    const [movedItem] = rawItems.splice(result.source.index, 1);
    rawItems.splice(result.destination.index, 0, movedItem);

    const totalSequence = rawItems.map((item: any, index) => ({
      id: item._id,
      order: index, 
    }));

    try {
      await reorderExperiences(totalSequence).unwrap(); 
    } catch (err) {
      console.error('Failed processing server-side sequence updates:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pb-4 pt-0 space-y-4 animate-fade-in mt-0">
      
      {/* Header Container Area */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-gray-900 leading-none">Experience Matrix Engine</h2>
        <p className="text-xs text-gray-400 mt-1">
          Manage your career milestone nodes, map company branding vectors, and balance sequence layout indices.
        </p>
      </div>

      {errorLog && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-xs text-red-600">
          <AlertCircle size={14} className="shrink-0" />
          <p><strong className="font-bold">Backend Sync Warning:</strong> {errorLog}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        
        {/* LEFT COLUMN: Timeline Sync and Skeleton Loader Box Engine */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-3.5 border-b border-gray-50 bg-gray-50/40">
            <h3 className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">Interactive Timeline Aligner</h3>
          </div>

          <div className="p-3.5">
            {isLoading ? (
              /* Premium Skeleton Placeholder States */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {[1, 2, 3, 4].map((idx) => (
                  <div key={idx} className="flex flex-col justify-between p-3.5 border border-gray-100 bg-white rounded-xl h-[155px] animate-pulse space-y-3">
                    <div className="flex items-start gap-2.5 flex-1">
                      <div className="w-4 h-4 bg-gray-100 rounded-md shrink-0 mt-0.5" />
                      <div className="w-10 h-10 bg-gray-100 rounded-lg shrink-0" />
                      <div className="flex-1 space-y-2 min-w-0">
                        <div className="h-3 bg-gray-200 rounded-md w-3/4" />
                        <div className="h-2.5 bg-gray-100 rounded-md w-1/2" />
                        <div className="h-2 bg-gray-100 rounded-md w-2/3" />
                      </div>
                    </div>
                    <div className="h-5 bg-gray-50/80 rounded-md w-full" />
                    <div className="border-t border-gray-50 pt-2 flex items-center justify-between">
                      <div className="h-3 bg-gray-100 rounded w-10" />
                      <div className="flex gap-2">
                        <div className="w-4 h-4 bg-gray-100 rounded-md" />
                        <div className="w-4 h-4 bg-gray-100 rounded-md" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : experiences.length === 0 ? (
              <div className="p-6 border border-dashed border-gray-200 rounded-xl text-center text-gray-400 text-xs">
                No corporate workspace instances found. Provision a timeline layer form card component to begin.
              </div>
            ) : (
              <DragDropContext onDragEnd={handleOnDragEnd}>
                <Droppable droppableId="experience-dash-list">
                  {(provided) => (
                    <div 
                      {...provided.droppableProps} 
                      ref={provided.innerRef} 
                      className="grid grid-cols-1 md:grid-cols-2 gap-3.5"
                    >
                      {experiences.map((item: any, index: number) => (
                        <Draggable key={item._id} draggableId={item._id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              style={provided.draggableProps.style as React.CSSProperties}
                              className={`flex flex-col justify-between p-3.5 bg-white border rounded-xl transition-all h-[155px] ${
                                snapshot.isDragging 
                                  ? 'border-black shadow-md scale-[1.01] bg-gray-50/40' 
                                  : 'border-gray-100 hover:border-gray-200'
                              }`}
                            >
                              {/* Top Segment: Drag Grip, Brand Assets, and Layout Metadata */}
                              <div className="flex items-start gap-2.5 min-w-0">
                                <div {...provided.dragHandleProps} className="p-0.5 mt-0.5 text-gray-300 hover:text-gray-600 cursor-grab active:cursor-grabbing shrink-0">
                                  <GripVertical size={15} />
                                </div>

                                {item.companyLogoUrl ? (
                                  <img src={item.companyLogoUrl} alt={item.company} className="w-10 h-10 rounded-lg object-cover bg-gray-50 border border-gray-100 shrink-0" />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100 shrink-0">
                                    <Briefcase size={15} />
                                  </div>
                                )}

                                <div className="truncate space-y-0.5 min-w-0 flex-1">
                                  <h4 className="text-xs font-semibold text-gray-800 truncate">{item.role}</h4>
                                  <p className="text-[11px] text-gray-500 truncate w-full font-medium">
                                    {item.company}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-gray-400">
                                    <span className="flex items-center gap-0.5 whitespace-nowrap">
                                      <Calendar size={10} />{' '}
                                      {formatDisplayDate(item.startDate)} – {item.currentJob ? 'Present' : formatDisplayDate(item.endDate)}
                                    </span>
                                    {item.location && (
                                      <span className="flex items-center gap-0.5 text-gray-500 font-medium truncate max-w-[120px]">
                                        <MapPin size={10} className="text-gray-400 shrink-0" /> {item.location}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Middle Segment: Task Log Specifications Clamped Layer */}
                              <div className="bg-gray-50/50 border border-gray-100/40 rounded-lg p-1.5 flex items-start gap-1.5 mt-1 flex-1 min-h-[42px]">
                                <FileText size={11} className="text-gray-300 shrink-0 mt-0.5" />
                                <p className="text-[10px] text-gray-500 leading-normal font-medium line-clamp-2 break-words">
                                  {item.description || 'No performance tracking metrics specified.'}
                                </p>
                              </div>

                              {/* Bottom Segment: Operations Panel and Order Identifiers */}
                              <div className="flex items-center justify-between border-t border-gray-50 pt-1.5 mt-1 shrink-0">
                                <span className="text-[9px] font-mono font-bold bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">
                                  Idx: {item.order}
                                </span>
                                
                                <div className="flex items-center gap-0.5">
                                  <button type="button" onClick={() => handleInitiateEdit(item)} className="p-1 text-gray-400 hover:text-black hover:bg-gray-50 rounded-lg transition-colors" title="Edit Position Mapping">
                                    <Pencil size={13} />
                                  </button>
                                  <button type="button" onClick={() => handleDeleteClick(item._id)} className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50/50 rounded-lg transition-colors" title="Purge Record Layer">
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>

                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Provision Asset Node Form */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-4 lg:-mt-7">
          <div className="flex items-center justify-between pb-1.5 border-b border-gray-50">
            <div className="flex items-center gap-2 text-gray-800">
              <Sparkles size={14} className={editTargetId ? 'text-amber-500' : 'text-purple-500'} />
              <h3 className="text-xs font-bold tracking-tight">
                {editTargetId ? 'Modify Workspace Fields' : 'Provision Asset Node'}
              </h3>
            </div>
            {editTargetId && (
              <button type="button" onClick={resetFormState} className="text-gray-400 hover:text-black p-0.5 rounded-lg" title="Cancel Edit Mode">
                <X size={13} />
              </button>
            )}
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-3.5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="companyInput" className="block text-[9px] font-bold tracking-wider uppercase text-gray-400 mb-0.5">Company Node *</label>
                <input id="companyInput" type="text" placeholder="e.g., Google" value={company} onChange={(e) => setCompany(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-black transition-colors bg-white text-gray-800" />
              </div>
              <div>
                <label htmlFor="roleInput" className="block text-[9px] font-bold tracking-wider uppercase text-gray-400 mb-0.5">Title / Role *</label>
                <input id="roleInput" type="text" placeholder="e.g., Full Stack Engineer" value={role} onChange={(e) => setRole(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-black transition-colors bg-white text-gray-800" />
              </div>
            </div>

            {/* Geographic Vector taking complete 2/2 full space row */}
            <div>
              <label htmlFor="locationInput" className="block text-[9px] font-bold tracking-wider uppercase text-gray-400 mb-0.5">Geographic Vector</label>
              <div className="relative flex items-center">
                <input id="locationInput" type="text" placeholder="e.g., Lahore, PK (Remote)" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full border border-gray-200 rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-black transition-colors bg-white text-gray-800" />
                <MapPin size={13} className="absolute left-3 text-gray-400" />
              </div>
            </div>

            {/* Cute Custom Formatted Calendar Date Grid Row */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="startDateInput" className="block text-[9px] font-bold tracking-wider uppercase text-gray-400 mb-0.5">Start Date *</label>
                <div className="relative flex items-center group">
                  <input 
                    id="startDateInput" 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)} 
                    className="w-full border border-gray-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-gray-700 font-medium focus:outline-none focus:border-black transition-all accent-black bg-white cursor-pointer hover:border-gray-300 min-h-[32px] [color-scheme:light]" 
                  />
                  <Calendar size={13} className="absolute left-3 text-gray-400 group-hover:text-black transition-colors pointer-events-none" />
                </div>
              </div>
              
              <div>
                <label htmlFor="endDateInput" className="block text-[9px] font-bold tracking-wider uppercase text-gray-400 mb-0.5">End Date *</label>
                <div className="relative flex items-center group">
                  <input 
                    id="endDateInput" 
                    type={currentJob ? "text" : "date"} 
                    placeholder={currentJob ? 'Present' : ''} 
                    value={currentJob ? 'Present' : endDate} 
                    onChange={(e) => setEndDate(e.target.value)} 
                    disabled={currentJob}
                    className="w-full border border-gray-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-gray-700 font-medium focus:outline-none focus:border-black transition-all accent-black bg-white disabled:bg-gray-50/70 disabled:text-gray-400 disabled:border-gray-100 disabled:font-bold cursor-pointer disabled:cursor-not-allowed hover:border-gray-300 min-h-[32px] [color-scheme:light]" 
                  />
                  <Calendar size={13} className="absolute left-3 text-gray-400 group-hover:text-black transition-colors pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Checkbox placement explicitly given its own premium, tidy spacing layout */}
            <div className="bg-gray-50/60 border border-gray-100 rounded-xl p-2.5 flex items-center">
              <label htmlFor="currentJobInput" className="flex items-center gap-2.5 cursor-pointer select-none w-full">
                <input 
                  id="currentJobInput" 
                  type="checkbox" 
                  checked={currentJob} 
                  onChange={(e) => {
                    setCurrentJob(e.target.checked);
                    if (e.target.checked) setEndDate(''); 
                  }}
                  className="w-4 h-4 rounded-md border-gray-200 text-black focus:ring-black cursor-pointer accent-black" 
                />
                <span className="text-[11px] font-semibold text-gray-600 transition-colors hover:text-black">
                  I currently work in this target position node
                </span>
              </label>
            </div>

            <div>
              <label htmlFor="descriptionInput" className="block text-[9px] font-bold tracking-wider uppercase text-gray-400 mb-0.5">Task Logs / Performance Specifications *</label>
              <textarea id="descriptionInput" rows={2.5} placeholder="Built and deployed scalable full-stack structural nodes..." value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-black transition-colors resize-none bg-white text-gray-800" />
            </div>

            <div>
              <label htmlFor="companyLogoInput" className="block text-[9px] font-bold tracking-wider uppercase text-gray-400 mb-0.5">
                Corporate Asset Vector Logo {editTargetId && <span className="text-gray-400 lowercase italic">(optional override)</span>}
              </label>
              <input id="companyLogoInput" type="file" accept="image/*" ref={fileInputRef} title="Upload company vector logo image asset" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} className="w-full text-[11px] text-gray-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:text-[10px] file:font-semibold file:bg-gray-50 file:text-black hover:file:bg-gray-100 cursor-pointer" />
            </div>

            <button 
              type="submit" 
              disabled={isAdding || isEditing}
              className={`w-full flex items-center justify-center gap-2 text-white py-2 rounded-xl text-xs font-bold tracking-wide shadow-sm mt-0.5 transition-colors ${
                editTargetId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-black hover:bg-gray-800'
              } disabled:opacity-50`}
            >
              {isAdding || isEditing ? <RefreshCw size={13} className="animate-spin" /> : editTargetId ? <Pencil size={13} /> : <Plus size={13} />}
              <span>{editTargetId ? 'Commit Node Modifications' : 'Push Asset Instance'}</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}