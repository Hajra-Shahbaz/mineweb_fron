import { apiSlice } from '../apiSlice'; // Adjust this path to point to your master apiSlice.ts

// Define the structural type of an Education document
export interface IEducation {
  _id: string;
  institute: string;
  degree: string;
  duration: string;
  description?: string;
  institutionLogoUrl?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// Layout payload type for drag-and-drop array sync operations
export interface IEducationReorderPayload {
  id: string;
  order: number;
}

// Inject your endpoints into the central master apiSlice instance
export const educationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    
   
    getAllEducation: builder.query<IEducation[], void>({
      query: () => '/education',
      providesTags: ['Education'],
    }),

    // 2. Add a new education block (Accepts FormData for multipart S3 binary uploads)
    addEducation: builder.mutation<IEducation, FormData>({
      query: (formData) => ({
        url: '/education',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Education'],
    }),

    // 3. Edit an existing education node dynamically
    editEducation: builder.mutation<IEducation, { id: string; data: FormData }>({
      query: ({ id, data }) => ({
        url: `/education/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Education'],
    }),

    // 4. Delete an education document tracking index record
    deleteEducation: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/education/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Education'],
    }),

    // 5. Sync sequence timeline layout after frontend drag-and-drop shifts
    reorderEducation: builder.mutation<{ message: string }, { totalSequence: IEducationReorderPayload[] }>({
      query: ({ totalSequence }) => ({
        url: '/education/reorder',
        method: 'PUT',
        body: { totalSequence },
      }),
      invalidatesTags: ['Education'],
    }),
  }),
  overrideExisting: false, // Safeguards against hot-reloading block replacement issues during development
});

// RTK Query auto-generates hooks custom to the endpoint names mapped above
export const {
  useGetAllEducationQuery,
  useAddEducationMutation,
  useEditEducationMutation,
  useDeleteEducationMutation,
  useReorderEducationMutation,
} = educationApi;