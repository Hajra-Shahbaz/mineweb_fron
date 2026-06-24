import { apiSlice } from '../apiSlice';

// ======================
// Types
// ======================

// Individual skill item (nested inside a category)
export interface ISkill {
  _id: string;
  skill: string;
  order: number;
  isAchieved?: boolean;
  percentage?: number;
}

// Category with nested skills
export interface ISkillCategory {
  _id: string;
  category: string;
  image1?: string;
  image2?: string;
  skills: ISkill[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

// Payload for reordering categories
export interface ICategoryReorderPayload {
  id: string;
  order: number;
}

// Payload for adding a skill
export interface IAddSkillPayload {
  skill: string;
  order?: number;
  isAchieved?: boolean;
  percentage?: number;
}

// Payload for editing a skill
export interface IEditSkillPayload {
  skill?: string;
  order?: number;
  isAchieved?: boolean;
  percentage?: number;
}

// Payload for updating skill achievement
export interface IUpdateAchievementPayload {
  isAchieved?: boolean;
  percentage?: number;
}

// Generic message response
export interface IMessageResponse {
  message: string;
  modifiedCount?: number;
  category?: ISkillCategory;
  skills?: ISkill[];
}

// Response type for reorder skills
export interface IReorderSkillsResponse {
  message: string;
  skills: ISkill[];
}

// Response type for delete skill
export interface IDeleteSkillResponse {
  message: string;
  category: ISkillCategory;
}

// ======================
// API Endpoints
// ======================

export const skillApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    
    // 1. Get all skill categories with their nested skills
    getAllSkills: builder.query<ISkillCategory[], void>({
      query: () => '/skill',
      providesTags: (result) => 
        result 
          ? [
              ...result.map(({ _id }) => ({ type: 'Skill' as const, id: _id })),
              { type: 'Skill', id: 'LIST' },
            ]
          : [{ type: 'Skill', id: 'LIST' }],
    }),

    // 2. Get a single category by ID
    getCategoryById: builder.query<ISkillCategory, string>({
      query: (id) => `/skill/${id}`,
      providesTags: (result, error, id) => [{ type: 'Skill', id }],
    }),

    // 3. Add a new category (Accepts FormData for multipart S3 binary uploads)
    addCategory: builder.mutation<ISkillCategory, FormData>({
      query: (formData) => ({
        url: '/skill',
        method: 'POST',
        body: formData,
        // Don't set Content-Type - browser will set it with boundary for FormData
      }),
      invalidatesTags: [{ type: 'Skill', id: 'LIST' }],
    }),

    // 4. Edit an existing category (Accepts FormData for optional image updates)
    editCategory: builder.mutation<ISkillCategory, { id: string; data: FormData }>({
      query: ({ id, data }) => ({
        url: `/skill/${id}`,
        method: 'PUT',
        body: data,
        // Don't set Content-Type - browser will set it with boundary for FormData
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Skill', id },
        { type: 'Skill', id: 'LIST' },
      ],
    }),

    // 5. Delete a category
    deleteCategory: builder.mutation<IMessageResponse, string>({
      query: (id) => ({
        url: `/skill/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Skill', id },
        { type: 'Skill', id: 'LIST' },
      ],
    }),

    // 6. Reorder categories via drag-and-drop
    reorderCategories: builder.mutation<IMessageResponse, { totalSequence: ICategoryReorderPayload[] }>({
      query: ({ totalSequence }) => ({
        url: '/skill/reorder',
        method: 'PUT',
        body: { totalSequence },
      }),
      invalidatesTags: [{ type: 'Skill', id: 'LIST' }],
    }),

    // 7. Add a new skill to a specific category
    addSkillToCategory: builder.mutation<ISkillCategory, { categoryId: string; data: IAddSkillPayload }>({
      query: ({ categoryId, data }) => ({
        url: `/skill/${categoryId}/skill`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { categoryId }) => [
        { type: 'Skill', id: categoryId },
        { type: 'Skill', id: 'LIST' },
      ],
    }),

    // 8. Edit an existing skill within a category
    editSkill: builder.mutation<ISkillCategory, { categoryId: string; skillId: string; data: IEditSkillPayload }>({
      query: ({ categoryId, skillId, data }) => ({
        url: `/skill/${categoryId}/skill/${skillId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { categoryId, skillId }) => [
        { type: 'Skill', id: categoryId },
        { type: 'Skill', id: 'LIST' },
      ],
    }),

    // 9. Delete a skill from a category
    deleteSkill: builder.mutation<IDeleteSkillResponse, { categoryId: string; skillId: string }>({
      query: ({ categoryId, skillId }) => ({
        url: `/skill/${categoryId}/skill/${skillId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { categoryId, skillId }) => [
        { type: 'Skill', id: categoryId },
        { type: 'Skill', id: 'LIST' },
      ],
    }),

    // 10. Reorder skills within a specific category
    reorderSkillsInCategory: builder.mutation<IReorderSkillsResponse, { categoryId: string; newSkillsArray: ISkill[] }>({
      query: ({ categoryId, newSkillsArray }) => ({
        url: `/skill/${categoryId}/reorder-skills`,
        method: 'PUT',
        body: { newSkillsArray },
      }),
      invalidatesTags: (result, error, { categoryId }) => [
        { type: 'Skill', id: categoryId },
        { type: 'Skill', id: 'LIST' },
      ],
    }),

    // 11. Update skill achievement status and/or percentage
    updateSkillAchievement: builder.mutation<ISkillCategory, { 
      categoryId: string; 
      skillId: string; 
      data: IUpdateAchievementPayload 
    }>({
      query: ({ categoryId, skillId, data }) => ({
        url: `/skill/${categoryId}/skill/${skillId}/achievement`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { categoryId, skillId }) => [
        { type: 'Skill', id: categoryId },
        { type: 'Skill', id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: false, // Safeguards against hot-reloading issues during development
});

// ======================
// Auto-generated Hooks
// ======================

export const {
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
  useUpdateSkillAchievementMutation,
} = skillApi;