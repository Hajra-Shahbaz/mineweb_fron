import { apiSlice } from '../apiSlice';

// ==========================================
// FRONTEND INTERFACES & PAYLOAD TYPES
// ==========================================

export interface IAdminNav {
  _id?: string;
  id: string;        // Route target key identifier (e.g., 'dashboard')
  label: string;     // Text display label
  iconName: string;  // Lucide React icon string representation
  isWorking: boolean; // Admin layout availability toggle
}

export interface IUserNav {
  _id?: string;
  id: string;        // Route target key identifier (e.g., 'projects')
  label: string;     // Text display label
  iconName: string;  // Lucide React icon string representation
  isVisible: boolean; // Public portfolio layout toggle
}

// Common response wrapper matching Express controller structures
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Payloads for creating items
export interface ICreateAdminNavInput {
  id: string;
  label: string;
  iconName: string;
  isWorking: boolean;
}

export interface ICreateUserNavInput {
  id: string;
  label: string;
  iconName: string;
  isVisible: boolean;
}

// Payloads for editing items (Allows optional updates, including resetting the target id)
export interface IEditAdminNavInput {
  id?: string;
  label?: string;
  iconName?: string;
  isWorking?: boolean;
}

export interface IEditUserNavInput {
  id?: string;
  label?: string;
  iconName?: string;
  isVisible?: boolean;
}

// ==========================================
// RTK QUERY API SLICE INJECTION
// ==========================================

export const navApi = apiSlice.injectEndpoints({
  // Allows Next.js Fast Refresh to safely reload endpoints without console warnings
  overrideExisting: true,
  
  endpoints: (builder) => ({
    
    // ------------------------------------------
    // ADMIN NAVIGATION ENDPOINTS
    // ------------------------------------------

    // 1. GET: Fetch all admin navigation items -> /api/nav/admin
    getAdminNav: builder.query<ApiResponse<IAdminNav[]>, void>({
      query: () => '/nav/admin',
      providesTags: ['Nav'],
    }),

    // 2. POST: Create a new admin nav item -> /api/nav/admin
    createAdminNavItem: builder.mutation<ApiResponse<IAdminNav[]>, ICreateAdminNavInput>({
      query: (navData) => ({
        url: '/nav/admin',
        method: 'POST',
        body: navData,
      }),
      invalidatesTags: ['Nav'],
    }),

    // 3. PUT: Edit an existing admin nav item by targetId -> /api/nav/admin/:targetId
    editAdminNavItem: builder.mutation<ApiResponse<IAdminNav>, { targetId: string; body: IEditAdminNavInput }>({
      query: ({ targetId, body }) => ({
        url: `/nav/admin/${targetId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Nav'],
    }),

    // 4. DELETE: Remove an admin nav item -> /api/nav/admin/:id
    deleteAdminNavItem: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/nav/admin/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Nav'],
    }),

    // 5. PATCH: Drag & drop reorder admin nav items -> /api/nav/admin/reorder
    reorderAdminNav: builder.mutation<ApiResponse<IAdminNav[]>, { sortedItems: IAdminNav[] }>({
      query: ({ sortedItems }) => ({
        url: '/nav/admin/reorder',
        method: 'PATCH',
        body: { sortedItems },
      }),
      invalidatesTags: ['Nav'],
    }),

    // ------------------------------------------
    // USER / PORTFOLIO NAVIGATION ENDPOINTS
    // ------------------------------------------

    // 6. GET: Fetch user nav items -> /api/nav/user or /api/nav/user?visible=true
    getUserNav: builder.query<ApiResponse<IUserNav[]>, { visibleOnly?: boolean } | void>({
      query: (params) => `/nav/user${params?.visibleOnly ? '?visible=true' : ''}`,
      providesTags: ['Nav'],
    }),

    // 7. POST: Create a new user nav item -> /api/nav/user
    createUserNavItem: builder.mutation<ApiResponse<IUserNav[]>, ICreateUserNavInput>({
      query: (navData) => ({
        url: '/nav/user',
        method: 'POST',
        body: navData,
      }),
      invalidatesTags: ['Nav'],
    }),

    // 8. PUT: Edit an existing user nav item by targetId -> /api/nav/user/:targetId
    editUserNavItem: builder.mutation<ApiResponse<IUserNav>, { targetId: string; body: IEditUserNavInput }>({
      query: ({ targetId, body }) => ({
        url: `/nav/user/${targetId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Nav'],
    }),

    // 9. DELETE: Remove a user nav item -> /api/nav/user/:id
    deleteUserNavItem: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/nav/user/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Nav'],
    }),

    // 10. PATCH: Drag & drop reorder user nav items -> /api/nav/user/reorder
    reorderUserNav: builder.mutation<ApiResponse<IUserNav[]>, { sortedItems: IUserNav[] }>({
      query: ({ sortedItems }) => ({
        url: '/nav/user/reorder',
        method: 'PATCH',
        body: { sortedItems },
      }),
      invalidatesTags: ['Nav'],
    }),

  }),
});

// ==========================================
// EXPORT AUTO-GENERATED REACT HOOKS
// ==========================================

export const {
  // Admin hooks
  useGetAdminNavQuery,
  useCreateAdminNavItemMutation,
  useEditAdminNavItemMutation,
  useDeleteAdminNavItemMutation,
  useReorderAdminNavMutation,
  
  // User hooks
  useGetUserNavQuery,
  useCreateUserNavItemMutation,
  useEditUserNavItemMutation,
  useDeleteUserNavItemMutation,
  useReorderUserNavMutation,
} = navApi;