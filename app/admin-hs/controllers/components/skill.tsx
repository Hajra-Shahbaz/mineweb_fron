'use client';

import React, { useState, useRef, useMemo, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { 
  GripVertical, RefreshCw, Plus, Pencil, Trash2, X, AlertCircle,
  FolderOpen, Hash, ChevronDown, ChevronRight, ImageIcon, Check,
  ImagePlus, Percent, Award, Star, Eye, Loader2, Search,
  Sparkles
} from 'lucide-react';
import { 
  useGetAllSkillsQuery,
  useGetCategoryByIdQuery,
  useAddCategoryMutation,
  useEditCategoryMutation,
  useDeleteCategoryMutation,
  useReorderCategoriesMutation,
  useAddSkillToCategoryMutation,
  useEditSkillMutation,
  useDeleteSkillMutation,
  useReorderSkillsInCategoryMutation,
  useUpdateSkillAchievementMutation
} from '@/store/apis/skillApi';

// ======================
// Types
// ======================

interface Skill {
  _id: string;
  skill: string;
  order: number;
  isAchieved?: boolean;
  percentage?: number;
}

interface Category {
  _id: string;
  category: string;
  image1?: string;
  image2?: string;
  skills: Skill[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

// ======================
// Main Component
// ======================

export default function SkillDashboard() {
  // --- API Hooks ---
  const { data: rawCategories, isLoading, refetch } = useGetAllSkillsQuery();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const { data: selectedCategory, isLoading: isLoadingCategory } = useGetCategoryByIdQuery(
    selectedCategoryId || '',
    { skip: !selectedCategoryId }
  );
  
  const [reorderCategories] = useReorderCategoriesMutation();
  const [addCategory, { isLoading: isAddingCategory }] = useAddCategoryMutation();
  const [editCategory, { isLoading: isEditingCategory }] = useEditCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();
  const [addSkill, { isLoading: isAddingSkill }] = useAddSkillToCategoryMutation();
  const [editSkill, { isLoading: isEditingSkill }] = useEditSkillMutation();
  const [deleteSkill] = useDeleteSkillMutation();
  const [reorderSkills] = useReorderSkillsInCategoryMutation();
  const [updateAchievement, { isLoading: isUpdatingAchievement }] = useUpdateSkillAchievementMutation();

  // --- State ---
  const categories = useMemo(() => {
    if (Array.isArray(rawCategories)) return rawCategories as Category[];
    return (rawCategories as any)?.data || [];
  }, [rawCategories]);

  const [editCategoryId, setEditCategoryId] = useState<string | null>(null);
  const [editSkillId, setEditSkillId] = useState<string | null>(null);
  const [editingSkillCategoryId, setEditingSkillCategoryId] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'category' | 'skill'>('category');
  const [editingAchievementSkill, setEditingAchievementSkill] = useState<{ categoryId: string; skillId: string } | null>(null);
  const [showCategoryDetail, setShowCategoryDetail] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form states
  const [categoryName, setCategoryName] = useState('');
  const [selectedImage1, setSelectedImage1] = useState<File | null>(null);
  const [selectedImage2, setSelectedImage2] = useState<File | null>(null);
  const [previewImage1, setPreviewImage1] = useState<string | null>(null);
  const [previewImage2, setPreviewImage2] = useState<string | null>(null);
  const [existingImage1, setExistingImage1] = useState<string | null>(null);
  const [existingImage2, setExistingImage2] = useState<string | null>(null);
  const [deleteImage1, setDeleteImage1] = useState<boolean>(false);
  const [deleteImage2, setDeleteImage2] = useState<boolean>(false);
  const [skillName, setSkillName] = useState('');
  const [targetCategoryId, setTargetCategoryId] = useState<string>('');
  const [achievementPercentage, setAchievementPercentage] = useState<number>(0);
  const [achievementStatus, setAchievementStatus] = useState<boolean>(false);
  const [errorLog, setErrorLog] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const image1InputRef = useRef<HTMLInputElement>(null);
  const image2InputRef = useRef<HTMLInputElement>(null);

  // --- Helpers ---
  const showSuccess = (msg: string) => { setSuccessMessage(msg); setTimeout(() => setSuccessMessage(null), 3000); };
  const showError = (msg: string) => { setErrorLog(msg); setTimeout(() => setErrorLog(null), 5000); };

  const resetForms = () => {
    setEditCategoryId(null);
    setEditSkillId(null);
    setEditingSkillCategoryId(null);
    setCategoryName('');
    setSkillName('');
    setTargetCategoryId('');
    setSelectedImage1(null);
    setSelectedImage2(null);
    setPreviewImage1(null);
    setPreviewImage2(null);
    setExistingImage1(null);
    setExistingImage2(null);
    setDeleteImage1(false);
    setDeleteImage2(false);
    setErrorLog(null);
    setSuccessMessage(null);
    setEditingAchievementSkill(null);
    setShowCategoryDetail(null);
    if (image1InputRef.current) image1InputRef.current.value = '';
    if (image2InputRef.current) image2InputRef.current.value = '';
  };

  const getAchievementColor = (percentage: number = 0) => {
    if (percentage >= 80) return 'bg-green-50 text-green-700 border-green-200';
    if (percentage >= 50) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    if (percentage >= 20) return 'bg-orange-50 text-orange-700 border-orange-200';
    return 'bg-gray-50 text-gray-500 border-gray-200';
  };

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase().trim();
    return categories.filter((cat: Category) => 
      cat.category.toLowerCase().includes(q) ||
      cat.skills.some((s: Skill) => s.skill.toLowerCase().includes(q))
    );
  }, [categories, searchQuery]);

  // --- Handlers ---
  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const handleViewCategory = (id: string) => {
    setSelectedCategoryId(id);
    setShowCategoryDetail(id);
    setErrorLog(null);
    setSuccessMessage(null);
  };

  const handleEditCategory = (category: Category) => {
    setEditCategoryId(category._id);
    setCategoryName(category.category || '');
    setExistingImage1(category.image1 || null);
    setExistingImage2(category.image2 || null);
    setDeleteImage1(false);
    setDeleteImage2(false);
    setSelectedImage1(null);
    setSelectedImage2(null);
    setPreviewImage1(null);
    setPreviewImage2(null);
    setActiveTab('category');
    setShowCategoryDetail(null);
    setEditSkillId(null);
    setEditingSkillCategoryId(null);
    setTargetCategoryId('');
    if (image1InputRef.current) image1InputRef.current.value = '';
    if (image2InputRef.current) image2InputRef.current.value = '';
  };

  const handleEditSkill = (categoryId: string, skill: Skill) => {
    setEditSkillId(skill._id);
    setEditingSkillCategoryId(categoryId);
    setSkillName(skill.skill || '');
    setActiveTab('skill');
    setExpandedCategories(prev => new Set(prev).add(categoryId));
    setShowCategoryDetail(null);
    setEditCategoryId(null);
    setCategoryName('');
    setTargetCategoryId('');
    setEditingAchievementSkill(null);
  };

  const handleEditAchievement = (categoryId: string, skill: Skill) => {
    setEditingAchievementSkill({ categoryId, skillId: skill._id });
    setAchievementPercentage(skill.percentage || 0);
    setAchievementStatus(skill.isAchieved || false);
    setShowCategoryDetail(null);
  };

  const handleImageChange = (file: File | null, setPreview: (url: string | null) => void) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleDeleteImage = (num: 1 | 2) => {
    if (num === 1) {
      setSelectedImage1(null);
      setPreviewImage1(null);
      setExistingImage1(null);
      setDeleteImage1(true);
      if (image1InputRef.current) image1InputRef.current.value = '';
    } else {
      setSelectedImage2(null);
      setPreviewImage2(null);
      setExistingImage2(null);
      setDeleteImage2(true);
      if (image2InputRef.current) image2InputRef.current.value = '';
    }
  };

  // --- Form Submissions ---
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) { showError('Category name is required.'); return; }
    
    const isDuplicate = categories.some((c: Category) => 
      c.category.trim().toLowerCase() === categoryName.trim().toLowerCase() && c._id !== editCategoryId
    );
    if (isDuplicate) { showError('Category already exists.'); return; }

    setErrorLog(null);
    setSuccessMessage(null);

    const formData = new FormData();
    formData.append('category', categoryName.trim());
    if (selectedImage1) formData.append('image1', selectedImage1);
    if (selectedImage2) formData.append('image2', selectedImage2);
    if (deleteImage1) formData.append('deleteImage1', 'true');
    if (deleteImage2) formData.append('deleteImage2', 'true');

    try {
      if (editCategoryId) {
        await editCategory({ id: editCategoryId, data: formData }).unwrap();
        showSuccess('Category updated!');
      } else {
        await addCategory(formData).unwrap();
        showSuccess('Category created!');
      }
      setTimeout(() => { resetForms(); refetch(); }, 1500);
    } catch (err: any) {
      showError(err?.data?.message || 'Failed to save category.');
    }
  };

  const handleSkillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName.trim()) { showError('Skill name is required.'); return; }
    
    const categoryId = targetCategoryId || editingSkillCategoryId;
    if (!categoryId) { showError('Please select a category.'); return; }

    const category = categories.find((c: Category) => c._id === categoryId);
    if (category) {
      const isDuplicate = category.skills.some((s: Skill) => 
        s.skill.trim().toLowerCase() === skillName.trim().toLowerCase() && s._id !== editSkillId
      );
      if (isDuplicate) { showError('Skill already exists.'); return; }
    }

    setErrorLog(null);
    setSuccessMessage(null);

    try {
      if (editSkillId && editingSkillCategoryId) {
        await editSkill({ 
          categoryId: editingSkillCategoryId, 
          skillId: editSkillId, 
          data: { skill: skillName.trim() } 
        }).unwrap();
        showSuccess('Skill updated!');
      } else {
        await addSkill({ 
          categoryId: categoryId, 
          data: { skill: skillName.trim(), order: category?.skills?.length || 0 } 
        }).unwrap();
        showSuccess('Skill added!');
      }
      setTimeout(() => { resetForms(); refetch(); }, 1500);
    } catch (err: any) {
      showError(err?.data?.message || 'Failed to save skill.');
    }
  };

  const handleAchievementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAchievementSkill) return;
    setErrorLog(null);
    setSuccessMessage(null);

    try {
      await updateAchievement({
        categoryId: editingAchievementSkill.categoryId,
        skillId: editingAchievementSkill.skillId,
        data: { isAchieved: achievementStatus, percentage: achievementPercentage }
      }).unwrap();
      showSuccess('Achievement updated!');
      setTimeout(() => { setEditingAchievementSkill(null); refetch(); }, 1500);
    } catch (err: any) {
      showError(err?.data?.message || 'Failed to update achievement.');
    }
  };

  // --- Delete Handlers ---
  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Delete this category and all its skills?')) return;
    try {
      await deleteCategory(id).unwrap();
      if (editCategoryId === id) resetForms();
      showSuccess('Category deleted!');
      refetch();
    } catch (err) {
      showError('Failed to delete category.');
    }
  };

  const handleDeleteSkill = async (categoryId: string, skillId: string) => {
    if (!window.confirm('Delete this skill?')) return;
    try {
      await deleteSkill({ categoryId, skillId }).unwrap();
      if (editSkillId === skillId) resetForms();
      showSuccess('Skill deleted!');
      refetch();
    } catch (err) {
      showError('Failed to delete skill.');
    }
  };

  // --- Drag & Drop ---
  const handleCategoryDragEnd = async (result: DropResult) => {
    if (!result.destination || result.destination.index === result.source.index) return;
    const items = [...categories];
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    const sequence = items.map((item: Category, index: number) => ({ id: item._id, order: index }));
    try {
      await reorderCategories({ totalSequence: sequence }).unwrap();
      showSuccess('Categories reordered!');
      refetch();
    } catch (err) {
      showError('Failed to reorder categories.');
    }
  };

  const handleSkillDragEnd = async (result: DropResult, categoryId: string) => {
    if (!result.destination || result.destination.index === result.source.index) return;
    const category = categories.find((c: Category) => c._id === categoryId);
    if (!category) return;
    const items = [...category.skills];
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    const newSkillsArray = items.map((item: Skill, index: number) => ({ ...item, order: index }));
    try {
      await reorderSkills({ categoryId, newSkillsArray }).unwrap();
      showSuccess('Skills reordered!');
      refetch();
    } catch (err) {
      showError('Failed to reorder skills.');
    }
  };

  // --- Loading ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-gray-900 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-900 rounded-lg">
                <FolderOpen size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Skills</h1>
                <p className="text-sm text-gray-500">Manage categories & skills</p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
                  aria-label="Search categories and skills"
                />
              </div>
              <button
                onClick={() => refetch()}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Refresh"
              >
                <RefreshCw size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Messages */}
        {(errorLog || successMessage) && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 text-sm ${
            errorLog ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'
          }`}>
            {errorLog ? <AlertCircle size={18} /> : <Check size={18} />}
            <p className="flex-1">{errorLog || successMessage}</p>
            <button onClick={() => { setErrorLog(null); setSuccessMessage(null); }} className="hover:opacity-70">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Categories List */}
          <section className="lg:col-span-8" aria-label="Categories">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FolderOpen size={18} className="text-gray-700" />
                  <h2 className="text-sm font-medium text-gray-900">Categories</h2>
                  <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                    {filteredCategories.length}
                  </span>
                </div>
              </div>

              <div className="p-4">
                {filteredCategories.length === 0 ? (
                  <div className="py-12 text-center border-2 border-dashed border-gray-200 rounded-lg">
                    <FolderOpen size={40} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-600 font-medium">No categories</p>
                    <p className="text-sm text-gray-400 mt-1">Create your first category</p>
                  </div>
                ) : (
                  <DragDropContext onDragEnd={handleCategoryDragEnd}>
                    <Droppable droppableId="categories">
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                          {filteredCategories.map((category: Category, index: number) => (
                            <Draggable key={category._id} draggableId={category._id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  style={provided.draggableProps.style as React.CSSProperties}
                                  className={`bg-white border rounded-lg transition-all ${
                                    snapshot.isDragging ? 'border-blue-400 shadow-lg ring-2 ring-blue-400/20' : 'border-gray-200 hover:border-gray-300'
                                  }`}
                                >
                                  {/* Category Header */}
                                  <div className="flex items-center gap-3 px-4 py-3">
                                    <div {...provided.dragHandleProps} className="text-gray-300 hover:text-gray-500 cursor-grab">
                                      <GripVertical size={16} />
                                    </div>
                                    
                                    <button onClick={() => toggleCategory(category._id)} className="text-gray-400 hover:text-gray-600">
                                      {expandedCategories.has(category._id) ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                    </button>

                                    <div className="flex items-center gap-2">
                                      {category.image1 ? (
                                        <img src={category.image1} alt="" className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
                                      ) : (
                                        <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-200">
                                          <ImageIcon size={16} className="text-gray-300" />
                                        </div>
                                      )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                      <h3 className="text-sm font-medium text-gray-900 truncate">{category.category}</h3>
                                      <p className="text-xs text-gray-500">{category.skills?.length || 0} skills</p>
                                    </div>

                                    <div className="flex items-center gap-1">
                                      <button onClick={() => handleViewCategory(category._id)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded" aria-label="View">
                                        <Eye size={16} />
                                      </button>
                                      <button onClick={() => { setTargetCategoryId(category._id); setActiveTab('skill'); setExpandedCategories(prev => new Set(prev).add(category._id)); }} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded" aria-label="Add skill">
                                        <Plus size={16} />
                                      </button>
                                      <button onClick={() => handleEditCategory(category)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded" aria-label="Edit">
                                        <Pencil size={16} />
                                      </button>
                                      <button onClick={() => handleDeleteCategory(category._id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded" aria-label="Delete">
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Skills List */}
                                  {expandedCategories.has(category._id) && (
                                    <div className="border-t border-gray-100 px-4 pb-3 pt-2 bg-gray-50/30">
                                      {category.skills?.length > 0 ? (
                                        <DragDropContext onDragEnd={(result) => handleSkillDragEnd(result, category._id)}>
                                          <Droppable droppableId={`skills-${category._id}`}>
                                            {(provided) => (
                                              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-1.5">
                                                {category.skills.map((skill: Skill, idx: number) => (
                                                  <Draggable key={skill._id} draggableId={skill._id} index={idx}>
                                                    {(provided, snapshot) => (
                                                      <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        style={provided.draggableProps.style as React.CSSProperties}
                                                        className={`flex items-center gap-3 px-3 py-2 bg-white border rounded-lg transition-all ${
                                                          snapshot.isDragging ? 'border-blue-400 shadow-md' : 'border-gray-100 hover:border-gray-200'
                                                        }`}
                                                      >
                                                        <div {...provided.dragHandleProps} className="text-gray-300 hover:text-gray-500 cursor-grab">
                                                          <GripVertical size={14} />
                                                        </div>
                                                        <Hash size={12} className="text-gray-300" />
                                                        <span className="text-sm text-gray-800 flex-1">{skill.skill}</span>
                                                        
                                                        {skill.percentage && skill.percentage > 0 && (
                                                          <span className={`px-2 py-0.5 rounded-full text-xs border ${getAchievementColor(skill.percentage)}`}>
                                                            {skill.percentage}%
                                                          </span>
                                                        )}
                                                        {skill.isAchieved && <Award size={16} className="text-green-600" />}
                                                        
                                                        <div className="flex items-center gap-0.5">
                                                          <button onClick={() => handleEditAchievement(category._id, skill)} className="p-1 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded" aria-label="Achievement">
                                                            <Star size={14} />
                                                          </button>
                                                          <button onClick={() => handleEditSkill(category._id, skill)} className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded" aria-label="Edit skill">
                                                            <Pencil size={14} />
                                                          </button>
                                                          <button onClick={() => handleDeleteSkill(category._id, skill._id)} className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded" aria-label="Delete skill">
                                                            <Trash2 size={14} />
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
                                        </DragDropContext>
                                      ) : (
                                        <p className="text-sm text-gray-400 text-center py-2">No skills</p>
                                      )}
                                    </div>
                                  )}
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
          </section>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-4">
            {/* Tabs */}
            <div className="bg-white border border-gray-200 rounded-lg p-1 flex">
              {['category', 'skill'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab as 'category' | 'skill'); setErrorLog(null); setSuccessMessage(null); }}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all ${
                    activeTab === tab ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center justify-center gap-2 capitalize">
                    {tab === 'category' ? <FolderOpen size={16} /> : <Hash size={16} />}
                    {tab}
                  </span>
                </button>
              ))}
            </div>

            {/* Category Detail */}
            {showCategoryDetail && selectedCategory && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Eye size={18} className="text-gray-700" />
                    Details
                  </h3>
                  <button onClick={() => { setShowCategoryDetail(null); setSelectedCategoryId(null); }} className="text-gray-400 hover:text-gray-600">
                    <X size={18} />
                  </button>
                </div>
                {isLoadingCategory ? (
                  <div className="py-6 flex justify-center"><Loader2 size={20} className="animate-spin text-gray-600" /></div>
                ) : (
                  <div className="space-y-3 mt-4">
                    <p className="font-medium text-gray-900">{selectedCategory.category}</p>
                    <div className="flex gap-3 text-xs text-gray-500">
                      <span>Skills: {selectedCategory.skills?.length || 0}</span>
                      <span>Order: #{selectedCategory.order}</span>
                    </div>
                    <div className="flex gap-2">
                      {selectedCategory.image1 && <img src={selectedCategory.image1} alt="" className="w-12 h-12 rounded-lg object-cover border border-gray-200" />}
                      {selectedCategory.image2 && <img src={selectedCategory.image2} alt="" className="w-12 h-12 rounded-lg object-cover border border-gray-200" />}
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => { handleEditCategory(selectedCategory); setShowCategoryDetail(null); }} className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-black">
                        Edit
                      </button>
                      <button onClick={() => { setTargetCategoryId(selectedCategory._id); setActiveTab('skill'); setShowCategoryDetail(null); }} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                        Add Skill
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Category Form */}
            {activeTab === 'category' && !showCategoryDetail && (
              <form onSubmit={handleCategorySubmit} className="bg-white border border-gray-200 rounded-lg p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className={`p-1.5 rounded-lg ${editCategoryId ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'}`}>
                    <Sparkles size={16} />
                  </span>
                  {editCategoryId ? 'Edit Category' : 'New Category'}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="catName" className="block text-xs font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      id="catName"
                      type="text"
                      placeholder="Category name"
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                      disabled={isAddingCategory || isEditingCategory}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Images</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[1, 2].map((num) => {
                        const isFirst = num === 1;
                        const preview = isFirst ? previewImage1 : previewImage2;
                        const existing = isFirst ? existingImage1 : existingImage2;
                        const selected = isFirst ? selectedImage1 : selectedImage2;
                        return (
                          <div key={num}>
                            <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-gray-400 transition-colors">
                              {(preview || existing) ? (
                                <div className="relative w-full aspect-square">
                                  <img src={preview || existing || ''} alt="" className="w-full h-full object-cover rounded" />
                                  <button type="button" onClick={() => handleDeleteImage(num as 1 | 2)} className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600">
                                    <X size={12} />
                                  </button>
                                </div>
                              ) : (
                                <div className="py-4">
                                  <ImagePlus size={24} className="mx-auto text-gray-400" />
                                  <p className="text-xs text-gray-500 mt-1">Upload</p>
                                </div>
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                ref={isFirst ? image1InputRef : image2InputRef}
                                onChange={(e) => {
                                  const file = e.target.files?.[0] || null;
                                  if (isFirst) {
                                    setSelectedImage1(file);
                                    handleImageChange(file, setPreviewImage1);
                                  } else {
                                    setSelectedImage2(file);
                                    handleImageChange(file, setPreviewImage2);
                                  }
                                }}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                disabled={isAddingCategory || isEditingCategory}
                              />
                            </div>
                            <p className="text-xs text-gray-500 text-center mt-1">Image {num}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <button type="submit" disabled={isAddingCategory || isEditingCategory || !categoryName.trim()} className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {(isAddingCategory || isEditingCategory) ? <Loader2 size={18} className="animate-spin" /> : (editCategoryId ? <Pencil size={18} /> : <Plus size={18} />)}
                    {editCategoryId ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            )}

            {/* Skill Form */}
            {activeTab === 'skill' && !showCategoryDetail && (
              <form onSubmit={handleSkillSubmit} className="bg-white border border-gray-200 rounded-lg p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className={`p-1.5 rounded-lg ${editSkillId ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                    <Sparkles size={16} />
                  </span>
                  {editSkillId ? 'Edit Skill' : 'New Skill'}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="skillCat" className="block text-xs font-medium text-gray-700 mb-1">Category *</label>
                    <select
                      id="skillCat"
                      value={targetCategoryId || editingSkillCategoryId || ''}
                      onChange={(e) => { setTargetCategoryId(e.target.value); setEditingSkillCategoryId(null); }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                      disabled={!!editingSkillCategoryId || isAddingSkill || isEditingSkill}
                    >
                      <option value="">Select category</option>
                      {categories.map((cat: Category) => (
                        <option key={cat._id} value={cat._id}>{cat.category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="skillName" className="block text-xs font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      id="skillName"
                      type="text"
                      placeholder="Skill name"
                      value={skillName}
                      onChange={(e) => setSkillName(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                      disabled={isAddingSkill || isEditingSkill}
                    />
                  </div>

                  <button type="submit" disabled={isAddingSkill || isEditingSkill || !skillName.trim() || !(targetCategoryId || editingSkillCategoryId)} className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {(isAddingSkill || isEditingSkill) ? <Loader2 size={18} className="animate-spin" /> : (editSkillId ? <Pencil size={18} /> : <Plus size={18} />)}
                    {editSkillId ? 'Update' : 'Add'}
                  </button>
                </div>
              </form>
            )}

            {/* Achievement Form */}
            {editingAchievementSkill && !showCategoryDetail && (
              <form onSubmit={handleAchievementSubmit} className="bg-white border border-purple-200 rounded-lg p-5">
                <div className="flex items-center justify-between pb-3 border-b border-purple-100">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Star size={18} className="text-purple-600" />
                    Achievement
                  </h3>
                  <button type="button" onClick={() => setEditingAchievementSkill(null)} className="text-gray-400 hover:text-gray-600">
                    <X size={18} />
                  </button>
                </div>
                
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">Status</label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input type="checkbox" checked={achievementStatus} onChange={(e) => setAchievementStatus(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" disabled={isUpdatingAchievement} />
                        Achieved
                      </label>
                      <div className="flex items-center gap-3 flex-1">
                        <Percent size={16} className="text-gray-400" />
                        <input type="range" min="0" max="100" value={achievementPercentage} onChange={(e) => setAchievementPercentage(parseInt(e.target.value))} className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600" disabled={isUpdatingAchievement} />
                        <span className="text-sm font-bold text-purple-700 min-w-10">{achievementPercentage}%</span>
                      </div>
                    </div>
                  </div>

                  <button type="submit" disabled={isUpdatingAchievement} className="w-full bg-purple-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {isUpdatingAchievement ? <Loader2 size={18} className="animate-spin" /> : <Star size={18} />}
                    Update
                  </button>
                </div>
              </form>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}