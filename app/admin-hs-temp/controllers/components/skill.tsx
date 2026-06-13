'use client';

import React, { useState, useMemo } from 'react';
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
  Layers,
  Tag,
  Sliders,
  FolderKanban
} from 'lucide-react';
import { 
  useGetAllSkillsQuery,
  useAddSkillMutation,
  useEditSkillMutation,
  useDeleteSkillMutation,
  useReorderSkillsMutation,
  ISkill
} from '../../../../store/apis/skillApi';

export default function SkillDashboard() {
  // --- RTK Query Hooks ---
  const { data: rawSkills, isLoading } = useGetAllSkillsQuery();
  const [reorderSkills] = useReorderSkillsMutation();
  const [addSkill, { isLoading: isAdding }] = useAddSkillMutation();
  const [editSkill, { isLoading: isEditing }] = useEditSkillMutation();
  const [deleteSkill] = useDeleteSkillMutation();

  // --- Safe Cache Array Normalization ---
  const skillsList = useMemo<ISkill[]>(() => {
    return Array.isArray(rawSkills) 
      ? rawSkills 
      : (rawSkills as any)?.data || [];
  }, [rawSkills]);

  // --- Extract All Unique Categories (Alphabetical) ---
  const categories = useMemo<string[]>(() => {
    const unique = new Set<string>(
      skillsList.map((s: ISkill) => s.category?.toLowerCase()).filter(Boolean)
    );
    return Array.from(unique).sort();
  }, [skillsList]);

  // --- Group Skills by Category and Sort by Order Index ---
  const groupedSkills = useMemo(() => {
    const groups: { [key: string]: ISkill[] } = {};
    
    // Initialize groups
    categories.forEach(cat => {
      groups[cat] = [];
    });
    
    if (categories.length === 0) {
      groups['uncategorized'] = [];
    }
    
    // Populate and sort
    skillsList.forEach((skill) => {
      const cat = skill.category?.toLowerCase() || 'uncategorized';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(skill);
    });

    // Ensure items within each section respect their sequential layout index
    Object.keys(groups).forEach(cat => {
      groups[cat].sort((a, b) => a.order - b.order);
    });

    return groups;
  }, [skillsList, categories]);

  // --- Interactive UI State Management ---
  const [editTargetId, setEditTargetId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [errorLog, setErrorLog] = useState<string | null>(null);

  // --- Switch Form Fields to Edit Mode ---
  const handleInitiateEdit = (item: ISkill) => {
    setErrorLog(null);
    setEditTargetId(item._id);
    setName(item.name || '');
    setCategory(item.category || '');
  };

  // --- Reset Form Fields ---
  const resetFormState = () => {
    setEditTargetId(null);
    setName('');
    setCategory('');
    setErrorLog(null);
  };

  // --- Form Submit Router ---
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !category.trim()) {
      setErrorLog('Please fill out all required validation tracking fields (Skill Name, Category Vector).');
      return;
    }

    setErrorLog(null);

    const payload = {
      name: name.trim(),
      category: category.trim().toLowerCase(),
    };

    try {
      if (editTargetId) {
        await editSkill({ id: editTargetId, data: payload }).unwrap();
      } else {
        await addSkill(payload).unwrap();
      }
      resetFormState();
    } catch (err: any) {
      console.error('Data sync rejection error:', err);
      setErrorLog(err?.data?.error?.message || err?.data?.message || 'Schema validation configuration setup failed.');
    }
  };

  // --- Delete Handler Pipeline ---
  const handleDeleteClick = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this stack skill record?')) return;
    try {
      await deleteSkill(id).unwrap();
      if (editTargetId === id) resetFormState();
    } catch (err) {
      console.error('Purge transaction error:', err);
    }
  };

  // --- Advanced Drag & Drop Cross-Section Reordering Pipeline ---
  const handleOnDragEnd = async (result: DropResult) => {
    const { destination, source } = result;
    
    // Dropped outside a valid container boundary layout zone
    if (!destination) return;

    const sourceCategory = source.droppableId;
    const destCategory = destination.droppableId;

    // Create mutable deep array variants of our current layout scopes
    const sourceSectionItems = Array.from(groupedSkills[sourceCategory] || []);
    const destSectionItems = sourceCategory === destCategory 
      ? sourceSectionItems 
      : Array.from(groupedSkills[destCategory] || []);

    // Remove item instance from its starting context coordinate position
    const [movedItem] = sourceSectionItems.splice(source.index, 1);

    // 🌟 Check if item was dropped into a completely different category cluster
    if (sourceCategory !== destCategory) {
      // Inline-patch its classification value before re-indexing it into the destination array
      movedItem.category = destCategory;
      
      // Inject modified item into the target destination container
      destSectionItems.splice(destination.index, 0, movedItem);
      
      // Fire an isolation background edit update to commit the database category string update immediately
      try {
        await editSkill({ 
          id: movedItem._id, 
          data: { category: destCategory } 
        }).unwrap();
      } catch (err) {
        console.error('Failed processing categorization transaction swap updates:', err);
        return; // Halt layout sequence alignment computation if baseline patch fails
      }
    } else {
      // Standard intra-container shifting mechanism execution paths
      destSectionItems.splice(destination.index, 0, movedItem);
    }

    // --- Recalculate layout layout values for the updated structural maps ---
    const sequencePayloadMap: { [key: string]: { id: string; order: number }[] } = {};

    // Re-index elements affected in the source array zone block
    sequencePayloadMap[sourceCategory] = sourceSectionItems.map((item, index) => ({
      id: item._id,
      order: index,
    }));

    // Re-index elements inside the destination column sequence
    sequencePayloadMap[destCategory] = destSectionItems.map((item, index) => ({
      id: item._id,
      order: index,
    }));

    // Aggregate everything neatly together alongside non-altered track instances
    const totalSequence: { id: string; order: number }[] = [];

    // Push the newly recalculated blocks
    totalSequence.push(...sequencePayloadMap[sourceCategory]);
    if (sourceCategory !== destCategory) {
      totalSequence.push(...sequencePayloadMap[destCategory]);
    }

    // Capture assets from columns completely bypassed by this mutation instance 
    Object.keys(groupedSkills).forEach((catKey) => {
      if (catKey !== sourceCategory && catKey !== destCategory) {
        groupedSkills[catKey].forEach((item) => {
          totalSequence.push({ id: item._id, order: item.order });
        });
      }
    });

    // Sync all calculated values up directly with the Express backend instance
    try {
      await reorderSkills({ totalSequence }).unwrap(); 
    } catch (err) {
      console.error('Failed processing sequential backend index array sorting updates:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pb-4 pt-0 space-y-4 animate-fade-in mt-0">
      
      {/* Header Container Area */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-gray-900 leading-none">Skills Matrix Engine</h2>
        <p className="text-xs text-gray-400 mt-1">
          Manage your framework tech stack vectors, compartmentalize proficiency clusters, and balance layout index sequences.
        </p>
      </div>

      {errorLog && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-xs text-red-600">
          <AlertCircle size={14} className="shrink-0" />
          <p><strong className="font-bold">Backend Sync Warning:</strong> {errorLog}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        
        {/* LEFT COLUMN: Sectional Category Lists with DragDrop Context Wrapper */}
        <div className="lg:col-span-2 space-y-6">
          {isLoading ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-4 shadow-sm">
              <div className="h-4 bg-gray-100 rounded w-1/4 animate-pulse mb-2" />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {[1, 2, 3].map((idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 border border-gray-50 bg-white rounded-xl h-[52px] animate-pulse" />
                ))}
              </div>
            </div>
          ) : skillsList.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 border-dashed border-gray-200 text-center text-gray-400 text-xs shadow-sm">
              No engine parameters matching active tier. Provision a new technology asset card to populate the layout grid.
            </div>
          ) : (
            <DragDropContext onDragEnd={handleOnDragEnd}>
              {categories.map((catKey) => {
                const categorySkills = groupedSkills[catKey] || [];
                if (categorySkills.length === 0) return null;

                return (
                  <div key={catKey} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm transition-all hover:shadow-md/5">
                    {/* Category Block Header Segment */}
                    <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/40 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FolderKanban size={13} className="text-gray-400" />
                        <h3 className="text-xs font-bold tracking-wider text-gray-800 uppercase">
                          {catKey}
                        </h3>
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 font-mono px-2 py-0.5 bg-gray-100 rounded-md">
                        {categorySkills.length} Units
                      </span>
                    </div>

                    {/* Droppable Zone Bound to Category Identifier */}
                    <div className="p-3.5 bg-gray-50/15">
                      <Droppable droppableId={catKey}>
                        {(provided, snapshot) => (
                          <div 
                            {...provided.droppableProps} 
                            ref={provided.innerRef} 
                            className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-1 rounded-xl transition-colors duration-200 ${
                              snapshot.isDraggingOver ? 'bg-gray-50/80 border border-dashed border-gray-200' : 'bg-transparent'
                            }`}
                          >
                            {categorySkills.map((item: ISkill, index: number) => (
                              <Draggable key={item._id} draggableId={item._id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={`flex items-center justify-between p-2.5 bg-white border rounded-xl transition-all h-[52px] ${
                                      snapshot.isDragging 
                                        ? 'border-black shadow-md scale-[1.01] bg-gray-50/90 z-50' 
                                        : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                      <div {...provided.dragHandleProps} className="p-0.5 text-gray-300 hover:text-gray-600 cursor-grab active:cursor-grabbing shrink-0">
                                        <GripVertical size={13} />
                                      </div>

                                      <div className="truncate space-y-0.5 min-w-0">
                                        <h4 className="text-xs font-bold text-gray-800 truncate leading-snug">{item.name}</h4>
                                        <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-gray-400">
                                          <Tag size={8} className="shrink-0 text-gray-300" />
                                          <span className="font-mono font-medium lowercase">idx-val:{item.order}</span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-0.5 shrink-0 ml-1">
                                      <button type="button" onClick={() => handleInitiateEdit(item)} className="p-1 text-gray-400 hover:text-black hover:bg-gray-50 rounded-lg transition-colors" title="Edit Stack Field">
                                        <Pencil size={11} />
                                      </button>
                                      <button type="button" onClick={() => handleDeleteClick(item._id)} className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50/50 rounded-lg transition-colors" title="Purge Record Layer">
                                        <Trash2 size={11} />
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  </div>
                );
              })}
            </DragDropContext>
          )}
        </div>

        {/* RIGHT COLUMN: Provision Asset Node Form Component with Live DataList Hints */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-1.5 border-b border-gray-50">
            <div className="flex items-center gap-2 text-gray-800">
              <Sparkles size={14} className={editTargetId ? 'text-amber-500' : 'text-purple-500'} />
              <h3 className="text-xs font-bold tracking-tight">
                {editTargetId ? 'Modify Stack Vector' : 'Provision Skill Node'}
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
              <label htmlFor="skillNameInput" className="block text-[9px] font-bold tracking-wider uppercase text-gray-400 mb-0.5">Skill Identity Name *</label>
              <div className="relative flex items-center group">
                <input id="skillNameInput" type="text" placeholder="e.g., TypeScript, Next.js, Docker" value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-200 rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-black transition-colors bg-white text-gray-800" />
                <Layers size={13} className="absolute left-3 text-gray-400 group-hover:text-black transition-colors pointer-events-none" />
              </div>
            </div>

            <div>
              <label htmlFor="categoryInput" className="block text-[9px] font-bold tracking-wider uppercase text-gray-400 mb-0.5">Category Classification Vector *</label>
              <div className="relative flex items-center group">
                <input 
                  id="categoryInput" 
                  type="text" 
                  list="existingCategories"
                  placeholder="e.g., Frontend, Backend, Devops" 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)} 
                  className="w-full border border-gray-200 rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-black transition-colors bg-white text-gray-800" 
                />
                <Sliders size={13} className="absolute left-3 text-gray-400 group-hover:text-black transition-colors pointer-events-none" />
              </div>
              
              <datalist id="existingCategories">
                {categories.map((cat: string) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>

              <p className="text-[9px] text-gray-400 mt-1 leading-normal italic">
                Tip: Typing or choosing an existing category merges this item right into that specific structural layout block group instantly.
              </p>
            </div>

            <button 
              type="submit" 
              disabled={isAdding || isEditing}
              className={`w-full flex items-center justify-center gap-2 text-white py-2 rounded-xl text-xs font-bold tracking-wide shadow-sm mt-0.5 transition-colors ${
                editTargetId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-black hover:bg-gray-800'
              } disabled:opacity-50`}
            >
              {isAdding || isEditing ? <RefreshCw size={13} className="animate-spin" /> : editTargetId ? <Pencil size={13} /> : <Plus size={13} />}
              <span>{editTargetId ? 'Commit Node Modifications' : 'Push Stack Instance'}</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}