'use client';

import React, { useState, useRef } from 'react';
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

} from 'lucide-react';
import { 
  useGetAllProjectsQuery,
  useAddProjectMutation,
  useEditProjectMutation,
  useDeleteProjectMutation,
  useReorderProjectsMutation
} from '@/store/apis/projectApi';

export default function ProjectDashboard() {
  // --- RTK Query Hooks ---
  const { data: rawProjects, isLoading } = useGetAllProjectsQuery();
  const [reorderProjects] = useReorderProjectsMutation();
  const [addProject, { isLoading: isAdding }] = useAddProjectMutation();
  const [editProject, { isLoading: isEditing }] = useEditProjectMutation();
  const [deleteProject] = useDeleteProjectMutation();

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
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Switch Form Fields to Edit Mode ---
  const handleInitiateEdit = (item: any) => {
    setErrorLog(null);
    setEditTargetId(item._id);
    setTitle(item.title || '');
    setDescription(item.description || '');
    setTechStackInput(Array.isArray(item.techStack) ? item.techStack.join(', ') : '');
    setLiveUrl(item.liveUrl || '');
    setGithubUrl(item.githubUrl || '');
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
    setSelectedFile(null);
    setErrorLog(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- Form Submit Router ---
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim() || !techStackInput.trim()) {
      setErrorLog('Please fill out all required validation tracking fields (Title, Description, Tech Stack).');
      return;
    }

    const isDuplicate = projects.some(
      (p: any) => p.title.trim().toLowerCase() === title.trim().toLowerCase() && p._id !== editTargetId
    );
    if (isDuplicate) {
      setErrorLog('A project with this exact title already exists locally. Please use a unique title.');
      return;
    }

    setErrorLog(null);

    const techStackArray = techStackInput
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('techStack', JSON.stringify(techStackArray)); 
    
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

  // --- Drag & Drop Reordering Pipeline ---
  const handleOnDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    if (result.destination.index === result.source.index) return;

    const rawItems = Array.from(projects);
    const [movedItem] = rawItems.splice(result.source.index, 1);
    rawItems.splice(result.destination.index, 0, movedItem);

    const totalSequence = rawItems.map((item: any, index) => ({
      id: item._id,
      order: index, 
    }));

    try {
      await reorderProjects(totalSequence).unwrap(); 
    } catch (err) {
      console.error('Failed processing server-side sequence updates:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-60 flex flex-col items-center justify-center text-gray-400 gap-2 text-sm">
        <RefreshCw size={18} className="animate-spin text-gray-900" />
        <span>Syncing Active Development Projects Pipeline...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 pb-4 pt-0 space-y-4 animate-fade-in mt-0">
      
      {/* Header Container Area */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-gray-900 leading-none">Project Portfolio Engine</h2>
        <p className="text-xs text-gray-400 mt-1">
          Manage your showcase layout, upload files, and drag items to adjust sequencing.
        </p>
      </div>

      {errorLog && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-xs text-red-600">
          <AlertCircle size={14} className="shrink-0" />
          <p><strong className="font-bold">Backend Sync Warning:</strong> {errorLog}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        
        {/* LEFT COLUMN: 2-Column Responsive Card Display Sync */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-3.5 border-b border-gray-50 bg-gray-50/40">
            <h3 className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">Interactive Sequence Aligner</h3>
          </div>

          <div className="p-3.5">
            {projects.length === 0 ? (
              <div className="p-6 border border-dashed border-gray-200 rounded-xl text-center text-gray-400 text-xs">
                No project records found. Fill out the application specification module form to begin.
              </div>
            ) : (
              <DragDropContext onDragEnd={handleOnDragEnd}>
                <Droppable droppableId="project-dash-list">
                  {(provided) => (
                    <div 
                      {...provided.droppableProps} 
                      ref={provided.innerRef} 
                      className="grid grid-cols-1 md:grid-cols-2 gap-3.5"
                    >
                      {projects.map((item: any, index: number) => (
                        <Draggable key={item._id} draggableId={item._id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`flex flex-col justify-between p-3.5 bg-white border rounded-xl transition-all h-32.5 ${
                                snapshot.isDragging 
                                  ? 'border-black shadow-md scale-[1.01] bg-gray-50/40' 
                                  : 'border-gray-100 hover:border-gray-200'
                              }`}
                            >
                              {/* Top Segment: Drag Grip and App Content Meta details */}
                              <div className="flex items-start gap-2.5 min-w-0">
                                <div {...provided.dragHandleProps} className="p-0.5 mt-0.5 text-gray-300 hover:text-gray-600 cursor-grab active:cursor-grabbing shrink-0">
                                  <GripVertical size={15} />
                                </div>

                                {item.imageUrl ? (
                                  <img src={item.imageUrl} alt={item.title} className="w-10 h-10 rounded-lg object-cover bg-gray-50 border border-gray-100 shrink-0" />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100 shrink-0">
                                    <Layers size={15} />
                                  </div>
                                )}

                                <div className="truncate space-y-0.5 min-w-0 flex-1">
                                  <h4 className="text-xs font-semibold text-gray-800 truncate">{item.title}</h4>
                                  <p className="text-[11px] text-gray-400 truncate w-full">
                                    {Array.isArray(item.techStack) ? item.techStack.join(', ') : ''}
                                  </p>
                                </div>
                              </div>

                              {/* Bottom Segment: Action Bars and Context Trackers */}
                              <div className="flex items-center justify-between border-t border-gray-50 pt-2 mt-1.5">
                                <div className="flex gap-2 items-center">
                                  <span className="text-[9px] font-mono font-bold bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">
                                    Idx: {item.order}
                                  </span>
                                  
                                  {/* Link Integrations */}
                                  <div className="flex items-center gap-1.5 ml-1">
                                    {item.githubUrl && (
                                      <a href={item.githubUrl} target="_blank" rel="noopener noreferrer" className="p-0.5 text-gray-400 hover:text-black transition-colors" title="View Source Repository">
                                     <FontAwesomeIcon icon={faGithub} className="w-4 h-4" />
                                      </a>
                                    )}
                                    {item.liveUrl && (
                                      <a href={item.liveUrl} target="_blank" rel="noopener noreferrer" className="p-0.5 text-gray-400 hover:text-black transition-colors" title="View Live Deployment">
                                        <ExternalLink size={13} />
                                      </a>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-0.5">
                                  <button type="button" onClick={() => handleInitiateEdit(item)} className="p-1 text-gray-400 hover:text-black hover:bg-gray-50 rounded-lg transition-colors" title="Edit Project">
                                    <Pencil size={13} />
                                  </button>
                                  <button type="button" onClick={() => handleDeleteClick(item._id)} className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50/50 rounded-lg transition-colors" title="Delete Project">
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

        {/* RIGHT COLUMN: Provision Asset Node Form (Lifted higher & spaces tightened) */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-3 lg:-mt-7">
          <div className="flex items-center justify-between pb-1.5 border-b border-gray-50">
            <div className="flex items-center gap-2 text-gray-800">
              <Sparkles size={14} className={editTargetId ? 'text-amber-500' : 'text-purple-500'} />
              <h3 className="text-xs font-bold tracking-tight">
                {editTargetId ? 'Modify Project Fields' : 'Provision Asset Node'}
              </h3>
            </div>
            {editTargetId && (
              <button type="button" onClick={resetFormState} className="text-gray-400 hover:text-black p-0.5 rounded-lg" title="Cancel Edit Mode">
                <X size={13} />
              </button>
            )}
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-3">
            <div>
              <label htmlFor="titleInput" className="block text-[9px] font-bold tracking-wider uppercase text-gray-400 mb-0.5">Project Title *</label>
              <input id="titleInput" type="text" placeholder="e.g., Cat Matchmaking Portal" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-black transition-colors" />
            </div>

            <div>
              <label htmlFor="techStackInput" className="block text-[9px] font-bold tracking-wider uppercase text-gray-400 mb-0.5">Tech Stack * <span className="lowercase italic font-normal text-gray-400">(comma separated)</span></label>
              <input id="techStackInput" type="text" placeholder="React, Node.js, TypeScript, Tailwind" value={techStackInput} onChange={(e) => setTechStackInput(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-black transition-colors" />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="liveUrlInput" className="block text-[9px] font-bold tracking-wider uppercase text-gray-400 mb-0.5">Live Deployment</label>
                <input id="liveUrlInput" type="url" placeholder="https://..." value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} className="w-full border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-black transition-colors" />
              </div>
              <div>
                <label htmlFor="githubUrlInput" className="block text-[9px] font-bold tracking-wider uppercase text-gray-400 mb-0.5">Source Repo</label>
                <input id="githubUrlInput" type="url" placeholder="https://github.com/..." value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} className="w-full border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-black transition-colors" />
              </div>
            </div>

            <div>
              <label htmlFor="descriptionInput" className="block text-[9px] font-bold tracking-wider uppercase text-gray-400 mb-0.5">Description / Specifications</label>
              <textarea id="descriptionInput" rows={2.5} placeholder="Outline milestones..." value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-black transition-colors resize-none" />
            </div>

            <div>
              <label htmlFor="projectScreenshotInput" className="block text-[9px] font-bold tracking-wider uppercase text-gray-400 mb-0.5">
                Screenshot {editTargetId && <span className="text-gray-400 lowercase italic">(optional override)</span>}
              </label>
              <input id="projectScreenshotInput" type="file" accept="image/*" ref={fileInputRef} title="Upload screenshot" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} className="w-full text-[11px] text-gray-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:text-[10px] file:font-semibold file:bg-gray-50 file:text-black hover:file:bg-gray-100 cursor-pointer" />
            </div>

            <button 
              type="submit" 
              disabled={isAdding || isEditing}
              className={`w-full flex items-center justify-center gap-2 text-white py-2 rounded-xl text-xs font-bold tracking-wide shadow-sm mt-0.5 transition-colors ${
                editTargetId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-black hover:bg-gray-800'
              } disabled:opacity-50`}
            >
              {isAdding || isEditing ? <RefreshCw size={13} className="animate-spin" /> : editTargetId ? <Pencil size={13} /> : <Plus size={13} />}
              <span>{editTargetId ? 'Commit Modifications' : 'Push Asset Instance'}</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}