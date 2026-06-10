import { apiSlice } from '../apiSlice'; // Adjust this path to point to your master apiSlice.ts

// Define the structural type of a Skill document
export interface ISkill {
  _id: string;
  name: string;
  category: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// Layout payload type for drag-and-drop array sync operations
export interface ISkillReorderPayload {
  id: string;
  order: number;
}

// Inject your endpoints into the central master apiSlice instance
export const skillApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    
    // 1. Fetch all skill records sorted by layout index sequence
    // Targets: 'https://apimw.hasoftz.com/api/skill'
    getAllSkills: builder.query<ISkill[], void>({
      query: () => '/skill',
      providesTags: ['Skill'],
    }),

    // 2. Add a new skill node
    addSkill: builder.mutation<ISkill, Partial<ISkill>>({
      query: (body) => ({
        url: '/skill',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Skill'],
    }),

    // 3. Edit an existing skill dynamically
    editSkill: builder.mutation<ISkill, { id: string; data: Partial<ISkill> }>({
      query: ({ id, data }) => ({
        url: `/skill/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Skill'],
    }),

    // 4. Delete a skill document matching instance
    deleteSkill: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/skill/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Skill'],
    }),

    // 5. Sync sequence timeline layout after frontend drag-and-drop shifts
    reorderSkills: builder.mutation<{ message: string }, { totalSequence: ISkillReorderPayload[] }>({
      query: ({ totalSequence }) => ({
        url: '/skill/reorder',
        method: 'PUT',
        body: { totalSequence },
      }),
      invalidatesTags: ['Skill'],
    }),
  }),
  overrideExisting: false, // Safeguards against hot-reloading block replacement issues during development
});

// RTK Query auto-generates hooks custom to the endpoint names mapped above
export const {
  useGetAllSkillsQuery,
  useAddSkillMutation,
  useEditSkillMutation,
  useDeleteSkillMutation,
  useReorderSkillsMutation,
} = skillApi;