'use client';

import React, { useState, useEffect } from 'react';
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
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { 
  useGetAllTasksQuery, 
  useAddTaskMutation, 
  useEditTaskMutation, 
  useDeleteTaskMutation 
} from '../../../../store/apis/taskApi';

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
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [errorLog, setErrorLog] = useState<string | null>(null);

  // --- Force Re-renders every 10 seconds to update dynamic time-left indicators ---
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((prev) => prev + 1), 10000);
    return () => clearInterval(timer);
  }, []);

  // --- Switch Form Fields to Edit Mode ---
  const handleInitiateEdit = (task: any) => {
    setErrorLog(null);
    setEditTargetId(task._id);
    setSubject(task.subject || '');
    setDesc(task.desc || '');
    setDeadline(task.deadline || '');
    setStartTime(task.startTime || '');
    setEndTime(task.endTime || '');
    setPriority(task.priority || 'medium');
  };

  // --- Reset Form Fields ---
  const resetFormState = () => {
    setEditTargetId(null);
    setSubject('');
    setDesc('');
    setDeadline('');
    setStartTime('');
    setEndTime('');
    setPriority('medium');
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
        await editTask({ 
          id: editTargetId, 
          data: { 
            subject: subject.trim(), 
            desc: desc.trim(), 
            deadline,
            startTime,
            endTime,
            priority
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
          startTime,
          endTime,
          priority,
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

  // --- Helper utility calculating dynamic local execution differences ---
  const calculateLocalTimeLeft = (deadlineDate: string, endTimeStr?: string) => {
    const targetStr = endTimeStr ? `${deadlineDate} ${endTimeStr}` : `${deadlineDate} 23:59:59`;
    const difference = new Date(targetStr).getTime() - new Date().getTime();
    
    if (difference <= 0) return 'Overdue';
    
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  // --- Helper utility calculating local deadline styles on the fly ---
  const getUrgencyClasses = (item: any) => {
    if (item.isCompleted) return 'border-gray-100/60 bg-gray-50/40 opacity-60';

    const targetStr = item.endTime ? `${item.deadline} ${item.endTime}` : `${item.deadline} 23:59:59`;
    const difference = new Date(targetStr).getTime() - new Date().getTime();

    // Critical threshold matching parent dashboard warning setup
    if (difference > 0 && difference <= 5 * 60 * 1000) {
      return 'border-red-500 bg-red-50/30 shadow-[0_0_15px_rgba(239,68,68,0.25)] animate-pulse';
    }
    if (difference > 0 && difference <= 15 * 60 * 1000) {
      return 'border-amber-400 bg-amber-50/20 shadow-[0_0_12px_rgba(245,158,11,0.2)]';
    }
    return 'border-gray-100 hover:border-gray-200 shadow-sm';
  };

  const getPriorityBadgeColor = (p: string) => {
    switch (p) {
      case 'high': return 'bg-red-50 text-red-700 border-red-100';
      case 'low': return 'bg-blue-50 text-blue-700 border-blue-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {[1, 2, 3, 4].map((idx) => (
                  <div key={idx} className="flex flex-col justify-between p-3.5 border border-gray-100 bg-white rounded-xl h-[165px] animate-pulse space-y-3">
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
                {tasks.map((item: any) => {
                  const cardStyles = getUrgencyClasses(item);
                  const localTimeLeftText = calculateLocalTimeLeft(item.deadline, item.endTime);
                  
                  return (
                    <div
                      key={item._id}
                      className={`flex flex-col justify-between p-3.5 bg-white border rounded-xl transition-all h-[165px] ${cardStyles}`}
                    >
                      {/* Top Segment */}
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
                          <div className="flex items-center justify-between gap-2">
                            <h4 className={`text-xs font-semibold text-gray-800 truncate ${item.isCompleted ? 'line-through text-gray-400 font-medium' : ''}`}>
                              {item.subject}
                            </h4>
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase shrink-0 tracking-wider ${getPriorityBadgeColor(item.priority)}`}>
                              {item.priority}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-gray-400 font-medium">
                            <span className="flex items-center gap-0.5 whitespace-nowrap">
                              <Clock size={10} />
                              Log: {item.currentDate}
                            </span>
                            <span className={`flex items-center gap-0.5 whitespace-nowrap px-1 rounded ${item.isCompleted ? 'text-gray-400' : 'text-red-600 bg-red-50'}`}>
                              <Calendar size={10} />
                              Due: {item.deadline} {item.endTime && `@ ${item.endTime}`}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Middle Segment */}
                      <div className="bg-gray-50/50 border border-gray-100/40 rounded-lg p-1.5 flex items-start gap-1.5 mt-1 flex-1 min-h-[42px]">
                        <FileText size={11} className="text-gray-300 shrink-0 mt-0.5" />
                        <p className={`text-[10px] text-gray-500 leading-normal font-medium line-clamp-2 break-words ${item.isCompleted ? 'line-through text-gray-400' : ''}`}>
                          {item.desc || 'No secondary operational contextual guidelines appended.'}
                        </p>
                      </div>

                      {/* Bottom Segment */}
                      <div className="flex items-center justify-between border-t border-gray-50 pt-1.5 mt-1 shrink-0">
                        <div className="text-[10px] font-bold text-gray-400">
                          {!item.isCompleted && (
                            <span className={`inline-flex items-center gap-1 ${localTimeLeftText.includes('m left') && !localTimeLeftText.includes('h') ? 'text-red-500 font-extrabold animate-pulse' : ''}`}>
                              {localTimeLeftText.includes('m left') && !localTimeLeftText.includes('h') && <AlertTriangle size={10} />}
                              {localTimeLeftText}
                            </span>
                          )}
                        </div>
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
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Input Box Area */}
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

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="startTimeInput" className="block text-[9px] font-bold tracking-wider uppercase text-gray-400 mb-0.5">Start Time</label>
                <input 
                  id="startTimeInput" 
                  type="time" 
                  value={startTime} 
                  onChange={(e) => setStartTime(e.target.value)} 
                  className="w-full border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-black transition-all bg-white text-gray-800" 
                />
              </div>
              <div>
                <label htmlFor="endTimeInput" className="block text-[9px] font-bold tracking-wider uppercase text-gray-400 mb-0.5">End Time</label>
                <input 
                  id="endTimeInput" 
                  type="time" 
                  value={endTime} 
                  onChange={(e) => setEndTime(e.target.value)} 
                  className="w-full border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-black transition-all bg-white text-gray-800" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="deadlineInput" className="block text-[9px] font-bold tracking-wider uppercase text-gray-400 mb-0.5">Target Date *</label>
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
                <label htmlFor="priorityInput" className="block text-[9px] font-bold tracking-wider uppercase text-gray-400 mb-0.5">Priority Level</label>
                <select
                  id="priorityInput"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-black transition-all bg-white text-gray-800 cursor-pointer"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="descInput" className="block text-[9px] font-bold tracking-wider uppercase text-gray-400 mb-0.5">Operational Context Guidelines</label>
              <textarea 
                id="descInput" 
                rows={3} 
                placeholder="Provide context details, checklist tracking requirements..." 
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