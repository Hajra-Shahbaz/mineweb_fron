import { apiSlice } from '../apiSlice'; // Adjust this path to point to your master apiSlice.ts

// Define the structural type of an Experience document
export interface IExperience {
  _id: string;
  company: string;
  role: string;
  location?: string;
  startDate: string;
  endDate?: string;
  currentJob: boolean;
  description: string;
  companyLogoUrl?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// Layout payload type for drag-and-drop array sync operations
export interface IExperienceReorderPayload {
  id: string;
  order: number;
}

// Inject your endpoints into the central master apiSlice instance
export const experienceApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    
    // 1. Fetch all work experience records sorted by custom layout index sequence
    // Targets: 'https://apimw.hasoftz.com/api/experience'
    getAllExperiences: builder.query<IExperience[], void>({
      query: () => '/experience',
      providesTags: ['Experience'],
    }),

    // 2. Add a new experience block (Accepts FormData for multipart S3 binary uploads)
    addExperience: builder.mutation<IExperience, FormData>({
      query: (formData) => ({
        url: '/experience',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Experience'],
    }),

    // 3. Edit an existing experience node dynamically
    editExperience: builder.mutation<IExperience, { id: string; data: FormData }>({
      query: ({ id, data }) => ({
        url: `/experience/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Experience'],
    }),

    // 4. Delete an experience document tracking index record
    deleteExperience: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/experience/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Experience'],
    }),

    // 5. Sync sequence timeline layout after frontend drag-and-drop shifts
    reorderExperiences: builder.mutation<{ message: string }, IExperienceReorderPayload[]>({
      query: (totalSequence) => ({
        url: '/experience/reorder',
        method: 'PUT',
        body: { totalSequence },
      }),
      invalidatesTags: ['Experience'],
    }),
  }),
  overrideExisting: false, // Safeguards against hot-reloading block replacement issues during development
});

// RTK Query auto-generates hooks custom to the endpoint names mapped above
export const {
  useGetAllExperiencesQuery,
  useAddExperienceMutation,
  useEditExperienceMutation,
  useDeleteExperienceMutation,
  useReorderExperiencesMutation,
} = experienceApi;