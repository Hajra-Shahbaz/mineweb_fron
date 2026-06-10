import { apiSlice } from '../apiSlice'; // Adjust this path to point to your master apiSlice.ts

// Define the structural type of a Social Link document
export interface ISocial {
  _id: string;
  platform: string;
  url: string;
  iconName?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// Layout payload type for drag-and-drop array sync operations
export interface ISocialReorderPayload {
  id: string;
  order: number;
}

// Inject your endpoints into the central master apiSlice instance
export const socialApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    
    // 1. Fetch all social links sorted by layout index sequence
    getAllSocialLinks: builder.query<ISocial[], void>({
      query: () => '/social',
      providesTags: ['Social'],
    }),

    // 2. Add a new social link instance
    addSocialLink: builder.mutation<ISocial, Partial<ISocial>>({
      query: (body) => ({
        url: '/social',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Social'],
    }),

    // 3. Edit an existing social link dynamically
    editSocialLink: builder.mutation<ISocial, { id: string; data: Partial<ISocial> }>({
      query: ({ id, data }) => ({
        url: `/social/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Social'],
    }),

    // 4. Delete a social link document matching instance
    deleteSocialLink: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/social/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Social'],
    }),

    // 5. Sync sequence timeline layout after frontend drag-and-drop shifts
    reorderSocialLinks: builder.mutation<{ message: string }, { totalSequence: ISocialReorderPayload[] }>({
      query: ({ totalSequence }) => ({
        url: '/social/reorder',
        method: 'PUT',
        body: { totalSequence },
      }),
      invalidatesTags: ['Social'],
    }),
  }),
  overrideExisting: false, // Safeguards against hot-reloading block replacement issues during development
});

// RTK Query auto-generates hooks custom to the endpoint names mapped above
export const {
  useGetAllSocialLinksQuery,
  useAddSocialLinkMutation,
  useEditSocialLinkMutation,
  useDeleteSocialLinkMutation,
  useReorderSocialLinksMutation,
} = socialApi;