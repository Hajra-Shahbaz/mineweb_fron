'use client';
import React, { useState } from 'react';
import { 
  useGetInboxQuery, 
  useUpdateMessageDetailsMutation, 
  useToggleArchiveStatusMutation, 
  useDeleteMessageMutation,
  PriorityLevel,
  MessageCategory
} from '../../../../store/apis/contactApi';

const formatTimeAgo = (dateString: string | undefined | null) => {
  const past = dateString ? new Date(dateString) : new Date();
  if (isNaN(past.getTime())) return 'Just now';

  const now = new Date();
  const msPerMinute = 60 * 1000;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;
  const elapsed = now.getTime() - past.getTime();

  if (elapsed < msPerMinute) return 'Just now';
  if (elapsed < msPerHour) return `${Math.round(elapsed / msPerMinute)}m ago`;
  if (elapsed < msPerDay) return `${Math.round(elapsed / msPerHour)}h ago`;
  if (elapsed < msPerDay * 2) return 'Yesterday';
  
  return past.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export const ContactInbox = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'urgent' | 'archived'>('all');

  const getQueryFilters = () => {
    switch (activeFilter) {
      case 'unread': return { isRead: false, isArchived: false };
      case 'urgent': return { priority: 'urgent' as PriorityLevel, isArchived: false };
      case 'archived': return { isArchived: true };
      default: return { isArchived: false };
    }
  };

  const { data: messages, isLoading, isError, error } = useGetInboxQuery(getQueryFilters());
  const [updateMessage] = useUpdateMessageDetailsMutation();
  const [toggleArchive] = useToggleArchiveStatusMutation();
  const [deleteMessage] = useDeleteMessageMutation();

  const categoryColors: Record<MessageCategory, string> = {
    bug_report: 'bg-purple-50 text-purple-700 border-purple-200/60',
    project_inquiry: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    feedback: 'bg-amber-50 text-amber-700 border-amber-200/60',
    general: 'bg-zinc-100 text-zinc-700 border-zinc-200',
    other: 'bg-neutral-100 text-neutral-700 border-neutral-200',
  };

  if (isLoading) {
    return (
      <div className="text-zinc-500 font-mono text-xs tracking-wider bg-white pt-0">
        SYNCHRONIZING INBOX...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-600 text-xs font-mono bg-white pt-0">
        <p className="font-bold">⚠️ Database Sync Interrupted</p>
      </div>
    );
  }

  const messagesList = Array.isArray(messages) ? messages : [];

  return (
    /* Added negative top margin (-mt-4) to cancel out any structural padding applied by outer page layouts */
    <div className="bg-white text-zinc-900 antialiased font-sans w-full p-0 -mt-4">
      
      {/* Controller Navigation Header - Forced flush layout */}
      <div className="flex justify-between items-center border-b border-zinc-200 pb-2 mb-2 bg-white m-0 pt-0">
        <div className="p-0 m-0 leading-none flex items-center">
          <h3 className="text-sm font-bold text-black flex items-center gap-1.5 m-0 p-0 leading-none">
            Message Desk
            <span className="text-[10px] px-1.5 py-0.2 font-mono font-bold rounded-full bg-zinc-900 text-white inline-flex items-center justify-center leading-none">
              {messagesList.length}
            </span>
          </h3>
        </div>
        
        <div className="flex gap-0.5 bg-zinc-100 p-0.5 rounded-lg border border-zinc-200 text-[10px] my-0">
          {(['all', 'unread', 'urgent', 'archived'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-2.5 py-1 rounded-md capitalize transition-all duration-150 font-semibold ${
                activeFilter === tab 
                  ? 'bg-white text-black shadow-sm border border-zinc-200/60' 
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Compact Message Cards Stream */}
      {messagesList.length === 0 ? (
        <div className="py-4 text-center text-xs text-zinc-400 bg-white rounded-xl border border-dashed border-zinc-200 font-mono">
          ⚡ No transmissions detected.
        </div>
      ) : (
        <div className="space-y-2 bg-white">
          {messagesList.map((msg) => (
            <div 
              key={msg._id} 
              className={`p-3 border rounded-lg transition-all duration-200 relative overflow-hidden group ${
                msg.isRead 
                  ? 'bg-zinc-50/40 border-zinc-100 opacity-60 hover:opacity-100' 
                  : 'bg-white border-zinc-200 hover:border-zinc-300 shadow-[0_2px_8px_rgba(0,0,0,0.02)]'
              }`}
            >
              {/* Mini border alert strip */}
              {!msg.isRead && msg.priority === 'urgent' && (
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
              )}

              {/* Top Header Section */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-baseline gap-1 mb-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-bold text-xs text-zinc-900 tracking-tight">
                    {msg.subject || 'Untitled Inquiry'}
                  </span>
                  
                  {msg.priority === 'urgent' && (
                    <span className="px-1 py-0.2 rounded text-[8px] font-bold bg-red-50 text-red-600 border border-red-100 uppercase tracking-wide">
                      Urgent
                    </span>
                  )}
                  <span className={`px-1 py-0.2 rounded text-[8px] font-semibold border capitalize tracking-wide ${categoryColors[msg.category]}`}>
                    {msg.category?.replace('_', ' ')}
                  </span>
                </div>

                <span className="text-zinc-400 text-[10px] font-mono whitespace-nowrap">
                  {formatTimeAgo(msg.createdAt)}
                </span>
              </div>

              {/* Sender Sub-Details Line */}
              <div className="text-zinc-500 text-[10px] font-mono mb-1.5">
                via <span className="text-zinc-700 font-sans font-semibold">{msg.name}</span> &lt;{msg.email}&gt;
                {msg.phoneNumber && <span className="text-zinc-400 font-sans"> • {msg.phoneNumber}</span>}
              </div>

              {/* Main Message Block */}
              <p className="text-zinc-800 text-xs leading-normal whitespace-pre-wrap bg-zinc-50 p-2 rounded border border-zinc-200/60 font-mono text-left mb-2">
                {msg.message}
              </p>

              {/* Highly Compact Notes Input Field */}
              <div className="relative flex items-center mb-2">
                <span className="absolute left-2.5 text-[9px] font-mono text-zinc-400 font-bold uppercase tracking-wider pointer-events-none">NOTE:</span>
                <input
                  type="text"
                  placeholder="Append notes..."
                  defaultValue={msg.notes || ''}
                  onBlur={(e) => {
                    if (e.target.value !== (msg.notes || '')) {
                      updateMessage({ id: msg._id, notes: e.target.value });
                    }
                  }}
                  className="w-full bg-zinc-50/30 focus:bg-white text-zinc-800 placeholder-zinc-300 border border-zinc-200/70 focus:border-zinc-300 rounded pl-10 pr-2 py-1 text-[11px] font-mono outline-none transition-colors"
                />
              </div>

              {/* Bottom Actions Tray - Ultra Low Height */}
              <div className="flex justify-between items-center border-t border-zinc-100 pt-1.5 gap-2">
                <label className="flex items-center gap-1.5 cursor-pointer select-none text-[10px] font-semibold text-zinc-400 hover:text-zinc-700 transition-colors">
                  <input 
                    type="checkbox"
                    checked={msg.priority === 'urgent'}
                    onChange={(e) => updateMessage({ id: msg._id, priority: e.target.checked ? 'urgent' : 'medium' })}
                    className="rounded bg-zinc-50 border-zinc-300 text-zinc-900 focus:ring-0 focus:ring-offset-0 w-3 h-3 cursor-pointer"
                  />
                  <span className="font-mono text-[9px] uppercase tracking-wider">Escalate</span>
                </label>

                <div className="flex items-center gap-2 font-mono text-[10px]">
                  <button 
                    onClick={() => updateMessage({ id: msg._id, isRead: !msg.isRead })} 
                    className="text-zinc-500 hover:text-zinc-950 font-medium"
                  >
                    {msg.isRead ? '[UNREAD]' : '[READ]'}
                  </button>
                  
                  <button 
                    onClick={() => toggleArchive({ id: msg._id, isArchived: !msg.isArchived })} 
                    className="text-zinc-500 hover:text-zinc-950 font-medium"
                  >
                    {msg.isArchived ? '[RESTORE]' : '[ARCHIVE]'}
                  </button>

                  <button 
                    onClick={() => confirm('Purge message permanently?') && deleteMessage(msg._id)} 
                    className="text-red-500 hover:text-red-700 font-medium"
                  >
                    [PURGE]
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};