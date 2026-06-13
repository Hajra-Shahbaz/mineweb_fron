'use client';

import React, { useState } from 'react';
import { 
  Check, 
  RefreshCw, 
  Plus, 
  Pencil, 
  Trash2, 
  Sparkles, 
  X, 
  AlertCircle,
  Calendar,
  FileText,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { 
  useGetAllTasksQuery, 
  useAddTaskMutation, 
  useEditTaskMutation, 
  useDeleteTaskMutation 
} from '../../../../store/apis/taskApi'; // Adjusted to match your structural pathing

export const SystemTodoPanel: React.FC = () => {
  // --- RTK Query Hooks ---
  const { data: tasks = [], isLoading, isError } = useGetAllTasksQuery();
  const [addTask, { isLoading: isAdding }] = useAddTaskMutation();
  const [editTask, { isLoading: isEditing }] = useEditTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();

  // --- Interactive UI Form State Management ---
  const [editTargetId, setEditTargetId] = useState<string | null>(null);
  const [subject, setSubject] = useState('');
  const [desc, setDesc] = useState('');
  const [deadline, setDeadline] = useState('');
  const [errorLog, setErrorLog] = useState<string | null>(null);

  // --- Switch Form Fields to Edit Mode ---
  const handleInitiateEdit = (task: any) => {
    setErrorLog(null);
    setEditTargetId(task._id);
    setSubject(task.subject || '');
    setDesc(task.desc || '');
    setDeadline(task.deadline || '');
  };

  // --- Reset Form Fields ---
  const resetFormState = () => {
    setEditTargetId(null);
    setSubject('');
    setDesc('');
    setDeadline('');
    setErrorLog(null);
  };

  // --- Form Submit Router ---
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim() || !deadline) {
      setErrorLog('Please fill out all required validation tracking fields (Subject Title, Target Deadline).');
      return;
    }

    setErrorLog(null);

    try {
      if (editTargetId) {
        // Find existing task item state to preserve completion status flags
        const currentTask = tasks.find(t => t._id === editTargetId);
        await editTask({ 
          id: editTargetId, 
          data: { 
            subject: subject.trim(), 
            desc: desc.trim(), 
            deadline 
          } 
        }).unwrap();
      } else {
        const formattedCurrentDate = new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });

        await addTask({
          subject: subject.trim(),
          desc: desc.trim(),
          currentDate: formattedCurrentDate,
          deadline,
          isCompleted: false,
        }).unwrap();
      }
      resetFormState();
    } catch (err: any) {
      console.error('Data sync rejection error:', err);
      setErrorLog(err?.data?.message || 'Schema validation configuration setup failed.');
    }
  };

  // --- Toggle Completion State Handler ---
  const handleToggleComplete = async (id: string, currentStatus: boolean) => {
    try {
      await editTask({
        id,
        data: { isCompleted: !currentStatus }
      }).unwrap();
    } catch (err) {
      console.error('Failed to update status flag:', err);
    }
  };

  // --- Delete Handler Pipeline ---
  const handleDeleteClick = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently purge this task item node?')) return;
    try {
      await deleteTask(id).unwrap();
      if (editTargetId === id) resetFormState();
    } catch (err) {
      console.error('Purge transaction error:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pb-4 pt-0 space-y-4 animate-fade-in mt-0">
      
      {/* Header Container Area */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-gray-900 leading-none">Task Management Engine</h2>
        <p className="text-xs text-gray-400 mt-1">
          Track lifecycle modifications, manage workspace deliverables, and maintain dynamic structural goal timelines.
        </p>
      </div>

      {errorLog && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-xs text-red-600">
          <AlertCircle size={14} className="shrink-0" />
          <p><strong className="font-bold">Backend Sync Warning:</strong> {errorLog}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        
        {/* LEFT COLUMN: Workspace Task Stream Grid */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-3.5 border-b border-gray-50 bg-gray-50/40 flex items-center justify-between">
            <h3 className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">Interactive Tasks Aligner</h3>
            <span className="text-[10px] font-bold bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">
              {tasks.length} {tasks.length === 1 ? 'Node' : 'Nodes'}
            </span>
          </div>

          <div className="p-3.5">
            {isLoading ? (
              /* Premium Skeleton Placeholder States matching Education Dashboard style */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {[1, 2, 3, 4].map((idx) => (
                  <div key={idx} className="flex flex-col justify-between p-3.5 border border-gray-100 bg-white rounded-xl h-[155px] animate-pulse space-y-3">
                    <div className="flex items-start gap-2.5 flex-1">
                      <div className="w-4 h-4 bg-gray-100 rounded-md shrink-0 mt-0.5" />
                      <div className="flex-1 space-y-2 min-w-0">
                        <div className="h-3 bg-gray-200 rounded-md w-3/4" />
                        <div className="h-2.5 bg-gray-100 rounded-md w-1/2" />
                      </div>
                    </div>
                    <div className="h-5 bg-gray-50/80 rounded-md w-full" />
                    <div className="border-t border-gray-50 pt-2 flex items-center justify-between">
                      <div className="h-3 bg-gray-100 rounded w-16" />
                      <div className="flex gap-2">
                        <div className="w-4 h-4 bg-gray-100 rounded-md" />
                        <div className="w-4 h-4 bg-gray-100 rounded-md" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : isError ? (
              <div className="p-6 border border-dashed border-gray-200 rounded-xl text-center text-gray-400 text-xs">
                Failed to pull live task components from backend runtime pipeline matrix.
              </div>
            ) : tasks.length === 0 ? (
              <div className="p-8 border border-dashed border-gray-200 rounded-xl text-center text-gray-400 text-xs space-y-1">
                <CheckCircle2 className="w-5 h-5 text-gray-300 mx-auto" />
                <p className="font-semibold text-gray-700">All task instances cleared.</p>
                <p className="text-[11px]">Deploy a target milestones card inside the control center matrix to map tasks.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {tasks.map((item: any) => (
                  <div
                    key={item._id}
                    className={`flex flex-col justify-between p-3.5 bg-white border rounded-xl transition-all h-[155px] ${
                      item.isCompleted 
                        ? 'border-gray-100/60 bg-gray-50/40 opacity-60' 
                        : 'border-gray-100 hover:border-gray-200 shadow-sm'
                    }`}
                  >
                    {/* Top Segment: Checkbox Trigger, Subject, and Deadlines */}
                    <div className="flex items-start gap-2.5 min-w-0">
                      <button
                        type="button"
                        onClick={() => handleToggleComplete(item._id, item.isCompleted)}
                        className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                          item.isCompleted 
                            ? 'bg-black border-black text-white' 
                            : 'border-gray-300 hover:border-black bg-white'
                        }`}
                      >
                        {item.isCompleted && <Check size={11} className="stroke-[3]" />}
                      </button>

                      <div className="truncate space-y-0.5 min-w-0 flex-1">
                        <h4 className={`text-xs font-semibold text-gray-800 truncate ${item.isCompleted ? 'line-through text-gray-400 font-medium' : ''}`}>
                          {item.subject}
                        </h4>
                        
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-gray-400 font-medium">
                          <span className="flex items-center gap-0.5 whitespace-nowrap">
                            <Clock size={10} />
                            Log: {item.currentDate}
                          </span>
                          <span className={`flex items-center gap-0.5 whitespace-nowrap px-1 rounded ${item.isCompleted ? 'text-gray-400' : 'text-red-600 bg-red-50'}`}>
                            <Calendar size={10} />
                            Due: {item.deadline}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Middle Segment: Description Component Layer */}
                    <div className="bg-gray-50/50 border border-gray-100/40 rounded-lg p-1.5 flex items-start gap-1.5 mt-1 flex-1 min-h-[42px]">
                      <FileText size={11} className="text-gray-300 shrink-0 mt-0.5" />
                      <p className={`text-[10px] text-gray-500 leading-normal font-medium line-clamp-2 break-words ${item.isCompleted ? 'line-through text-gray-400' : ''}`}>
                        {item.desc || 'No secondary operational contextual guidelines appended.'}
                      </p>
                    </div>

                    {/* Bottom Segment: Operations Panel Actions */}
                    <div className="flex items-center justify-end border-t border-gray-50 pt-1.5 mt-1 shrink-0">
                      <div className="flex items-center gap-0.5">
                        <button 
                          type="button" 
                          onClick={() => handleInitiateEdit(item)} 
                          className="p-1 text-gray-400 hover:text-black hover:bg-gray-50 rounded-lg transition-colors" 
                          title="Edit Task Core Properties"
                        >
                          <Pencil size={13} />
                        </button>
                        <button 
                          type="button" 
                          onClick={() => handleDeleteClick(item._id)} 
                          className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50/50 rounded-lg transition-colors" 
                          title="Purge Task Document Node"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Provision/Modify Task Matrix Input Box */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-4 lg:-mt-7">
          <div className="flex items-center justify-between pb-1.5 border-b border-gray-50">
            <div className="flex items-center gap-2 text-gray-800">
              <Sparkles size={14} className={editTargetId ? 'text-amber-500' : 'text-purple-500'} />
              <h3 className="text-xs font-bold tracking-tight">
                {editTargetId ? 'Modify Task Fields' : 'Provision Task Node'}
              </h3>
            </div>
            {editTargetId && (
              <button type="button" onClick={resetFormState} className="text-gray-400 hover:text-black p-0.5 rounded-lg" title="Cancel Edit Mode">
                <X size={13} />
              </button>
            )}
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-3.5">
            <div>
              <label htmlFor="subjectInput" className="block text-[9px] font-bold tracking-wider uppercase text-gray-400 mb-0.5">Subject Title *</label>
              <input 
                id="subjectInput" 
                type="text" 
                placeholder="e.g., Implement dark mode layout settings" 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)} 
                className="w-full border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-black transition-colors bg-white text-gray-800" 
              />
            </div>

            <div>
              <label htmlFor="deadlineInput" className="block text-[9px] font-bold tracking-wider uppercase text-gray-400 mb-0.5">Target Deadline *</label>
              <div className="relative flex items-center group">
                <input 
                  id="deadlineInput" 
                  type="date" 
                  value={deadline} 
                  onChange={(e) => setDeadline(e.target.value)} 
                  className="w-full border border-gray-200 rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-black transition-all bg-white text-gray-800" 
                />
                <Calendar size={13} className="absolute left-3 text-gray-400 group-hover:text-black transition-colors pointer-events-none" />
              </div>
            </div>

            <div>
              <label htmlFor="descInput" className="block text-[9px] font-bold tracking-wider uppercase text-gray-400 mb-0.5">Operational Context Guidelines</label>
              <textarea 
                id="descInput" 
                rows={4} 
                placeholder="Provide context details, checklist tracking requirements, edge use case rules, etc..." 
                value={desc} 
                onChange={(e) => setDesc(e.target.value)} 
                className="w-full border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-black transition-colors resize-none bg-white text-gray-800" 
              />
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
};