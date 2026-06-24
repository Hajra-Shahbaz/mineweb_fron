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
  isHidden: boolean;
  isWorking: boolean;
  createdAt: string;
  updatedAt: string;
}

// Layout payload type for your drag-and-drop array sync
export interface IReorderPayload {
  id: string;
  order: number;
}

// Response types
export interface IApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  count?: number;
}

export interface IBulkDeletePayload {
  ids: string[];
}

export interface IBulkDeleteResponse {
  success: boolean;
  message: string;
  data: {
    deletedCount: number;
  };
}

// Inject your endpoints into the central apiSlice instead of spinning up a separate standalone instance
export const projectApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    
    // 1. Fetch all projects sorted by layout sequence
    getAllProjects: builder.query<IProject[], void>({
      query: () => '/project',
      providesTags: ['Project'],
      transformResponse: (response: IApiResponse<IProject[]>) => response.data || [],
    }),

    // 2. Fetch visible projects only (for frontend display)
    getVisibleProjects: builder.query<IProject[], void>({
      query: () => '/project/visible',
      providesTags: ['Project'],
      transformResponse: (response: IApiResponse<IProject[]>) => response.data || [],
    }),

    // 3. Fetch a single project by ID
    getProjectById: builder.query<IProject, string>({
      query: (id) => `/project/${id}`,
      providesTags: (result, error, id) => [{ type: 'Project', id }],
      transformResponse: (response: IApiResponse<IProject>) => response.data!,
    }),

    // 4. Add a new project (Accepts FormData for multipart upload)
    addProject: builder.mutation<IProject, FormData>({
      query: (formData) => ({
        url: '/project',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Project'],
      transformResponse: (response: IApiResponse<IProject>) => response.data!,
    }),

    // 5. Edit an existing project card dynamically
    editProject: builder.mutation<IProject, { id: string; data: FormData }>({
      query: ({ id, data }) => ({
        url: `/project/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Project',
        { type: 'Project', id }
      ],
      transformResponse: (response: IApiResponse<IProject>) => response.data!,
    }),

    // 6. Delete a project document target card
    deleteProject: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/project/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        'Project',
        { type: 'Project', id }
      ],
      transformResponse: (response: IApiResponse) => ({
        message: response.message || 'Project deleted successfully'
      }),
    }),

    // 7. Sync sequence layout after frontend drag-and-drop movement
    reorderProjects: builder.mutation<{ message: string; data: { matched: number; modified: number } }, IReorderPayload[]>({
      query: (totalSequence) => ({
        url: '/project/reorder',
        method: 'PUT',
        body: { totalSequence },
      }),
      invalidatesTags: ['Project'],
      transformResponse: (response: IApiResponse<{ matched: number; modified: number }>) => ({
        message: response.message || 'Projects reordered successfully',
        data: response.data!
      }),
    }),

    // 8. Toggle project visibility (hide/show)
    toggleProjectVisibility: builder.mutation<IProject, string>({
      query: (id) => ({
        url: `/project/${id}/toggle-visibility`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [
        'Project',
        { type: 'Project', id }
      ],
      transformResponse: (response: IApiResponse<IProject>) => response.data!,
    }),

    // 9. Bulk delete projects
    bulkDeleteProjects: builder.mutation<IBulkDeleteResponse, string[]>({
      query: (ids) => ({
        url: '/project/bulk',
        method: 'DELETE',
        body: { ids },
      }),
      invalidatesTags: ['Project'],
      transformResponse: (response: IApiResponse<{ deletedCount: number }>) => ({
        success: response.success,
        message: response.message || 'Projects deleted successfully',
        data: {
          deletedCount: response.data?.deletedCount || 0
        }
      }),
    }),
  }),
  overrideExisting: false, // Prevents module replacement conflicts during Turbopack hot reloading
});

// RTK Query automatically generates hooks when injected from the modified endpoint keys
export const {
  // Queries
  useGetAllProjectsQuery,
  useGetVisibleProjectsQuery,
  useGetProjectByIdQuery,
  
  // Mutations
  useAddProjectMutation,
  useEditProjectMutation,
  useDeleteProjectMutation,
  useReorderProjectsMutation,
  useToggleProjectVisibilityMutation,
  useBulkDeleteProjectsMutation,
} = projectApi;