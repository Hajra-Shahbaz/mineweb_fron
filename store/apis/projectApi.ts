import { apiSlice } from '../apiSlice'; // Adjust this import path to point to your master apiSlice.ts

// Define the structural type of a Project document
export interface IProject {
  _id: string;
  title: string;
  description: string;
  techStack: string[];
  liveUrl?: string;
  githubUrl?: string;
  imageUrl?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// Layout payload type for your drag-and-drop array sync
export interface IReorderPayload {
  id: string;
  order: number;
}

// Inject your endpoints into the central apiSlice instead of spinning up a separate standalone instance
export const projectApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    
    // 1. Fetch all projects sorted by layout sequence sequence
    // Note: The parent base url is 'https://apimw.hasoftz.com/api', so this targets '/project'
    getAllProjects: builder.query<IProject[], void>({
      query: () => '/project',
      providesTags: ['Project'],
    }),

    // 2. Add a new project (Accepts FormData for multipart upload)
    addProject: builder.mutation<IProject, FormData>({
      query: (formData) => ({
        url: '/project',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Project'],
    }),

    // 3. Edit an existing project card dynamically
    editProject: builder.mutation<IProject, { id: string; data: FormData }>({
      query: ({ id, data }) => ({
        url: `/project/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Project'],
    }),

    // 4. Delete a project document target card
    deleteProject: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/project/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Project'],
    }),

    // 5. Sync sequence layout after frontend drag-and-drop movement
    reorderProjects: builder.mutation<{ message: string }, IReorderPayload[]>({
      query: (totalSequence) => ({
        url: '/project/reorder',
        method: 'PUT',
        body: { totalSequence },
      }),
      invalidatesTags: ['Project'],
    }),
  }),
  overrideExisting: false, // Prevents module replacement conflicts during Turbopack hot reloading
});

// RTK Query automatically generates hooks when injected from the modified endpoint keys
export const {
  useGetAllProjectsQuery,
  useAddProjectMutation,
  useEditProjectMutation,
  useDeleteProjectMutation,
  useReorderProjectsMutation,
} = projectApi;