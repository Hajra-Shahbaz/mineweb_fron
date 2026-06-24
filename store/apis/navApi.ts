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
  children?: IUserNav[]; // Nested navigation items
  route?: string;    // Optional route for page navigation (e.g., 'skill/page')
  isPage?: boolean;  // Flag to identify if this is a page navigation item
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
  route?: string;
  isPage?: boolean;
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
  route?: string;
  isPage?: boolean;
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

    // 6. GET: Fetch user nav items -> /api/nav/user or /api/nav/user?visible=true or /api/nav/user?pages=true
    getUserNav: builder.query<ApiResponse<IUserNav[]>, { visibleOnly?: boolean; pagesOnly?: boolean } | void>({
      query: (params) => {
        let url = '/nav/user';
        const queryParams = new URLSearchParams();
        
        if (params?.visibleOnly) {
          queryParams.append('visible', 'true');
        }
        if (params?.pagesOnly) {
          queryParams.append('pages', 'true');
        }
        
        const queryString = queryParams.toString();
        if (queryString) {
          url += `?${queryString}`;
        }
        
        return url;
      },
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

    // ------------------------------------------
    // PAGE NAVIGATION ENDPOINTS (NEW)
    // ------------------------------------------

    // 11. GET: Fetch all page navigation items -> /api/nav/pages
    getPageNavItems: builder.query<ApiResponse<IUserNav[]>, void>({
      query: () => '/nav/pages',
      providesTags: ['Nav'],
    }),

    // 12. GET: Fetch page navigation item by route -> /api/nav/pages/route/:route
    getPageNavItemByRoute: builder.query<ApiResponse<IUserNav>, string>({
      query: (route) => `/nav/pages/route/${route}`,
      providesTags: ['Nav'],
    }),

    // 13. POST: Create a new page navigation item -> /api/nav/pages
    createPageNavItem: builder.mutation<ApiResponse<IUserNav[]>, ICreateUserNavInput>({
      query: (navData) => ({
        url: '/nav/pages',
        method: 'POST',
        body: { ...navData, isPage: true },
      }),
      invalidatesTags: ['Nav'],
    }),

    // 14. PUT: Edit an existing page navigation item -> /api/nav/pages/:targetId
    editPageNavItem: builder.mutation<ApiResponse<IUserNav>, { targetId: string; body: IEditUserNavInput }>({
      query: ({ targetId, body }) => ({
        url: `/nav/pages/${targetId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Nav'],
    }),

    // 15. DELETE: Remove a page navigation item -> /api/nav/pages/:id
    deletePageNavItem: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/nav/pages/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Nav'],
    }),

    // 16. GET: Fetch children of a page navigation item -> /api/nav/pages/:parentId/children
    getPageNavChildren: builder.query<ApiResponse<IUserNav[]>, string>({
      query: (parentId) => `/nav/pages/${parentId}/children`,
      providesTags: ['Nav'],
    }),

    // ------------------------------------------
    // COMPOSITE NAVIGATION ENDPOINTS (NEW)
    // ------------------------------------------

    // 17. GET: Fetch full navigation structure -> /api/nav/full
    getFullNavigation: builder.query<ApiResponse<{ adminNav: IAdminNav[]; userNav: IUserNav[]; pageNav: IUserNav[] }>, void>({
      query: () => '/nav/full',
      providesTags: ['Nav'],
    }),

    // 18. GET: Fetch organized navigation structure -> /api/nav/structure
    getNavigationStructure: builder.query<ApiResponse<{ admin: IAdminNav[]; user: IUserNav[]; pages: IUserNav[] }>, void>({
      query: () => '/nav/structure',
      providesTags: ['Nav'],
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

  // Page hooks (NEW)
  useGetPageNavItemsQuery,
  useGetPageNavItemByRouteQuery,
  useCreatePageNavItemMutation,
  useEditPageNavItemMutation,
  useDeletePageNavItemMutation,
  useGetPageNavChildrenQuery,

  // Composite hooks (NEW)
  useGetFullNavigationQuery,
  useGetNavigationStructureQuery,
} = navApi;