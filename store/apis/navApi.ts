// store/apis/navApi.ts
import { apiSlice } from '../apiSlice';

// Define the matching types for your React frontend interfaces
export interface INavItem {
  _id?: string;
  id: string;        // Route target key identifier (e.g., 'system', 'project')
  label: string;     // Text display label
  iconName: string;  // Lucide React icon string representation
  isVisible: boolean;// Visibility master toggle
}

// Request payload interface for creating a navigation item
export interface ICreateNavInput {
  id: string;
  label: string;
  iconName: string;
  isVisible?: boolean;
}

// Request payload interface for updating an existing navigation item
export interface IEditNavInput {
  label?: string;
  iconName?: string;
  isVisible?: boolean;
}

export const navApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    
    // 1. GET: Fetch all navigation items (For Admin Panel)
    getAllNavItems: builder.query<INavItem[], void>({
      query: () => 'nav/admin-nav', // Changed from admin/admin-nav
      providesTags: ['Nav'],
    }),

    // 2. GET: Fetch visible navigation items only (For Public Portfolio)
    getPortfolioNavItems: builder.query<INavItem[], void>({
      query: () => 'nav/portfolio-nav', // Changed from admin/portfolio-nav
      providesTags: ['Nav'],
    }),

    // 3. POST: Create a new navigation view module element
    addNavItem: builder.mutation<INavItem, ICreateNavInput>({
      query: (navData) => ({
        url: 'nav/admin-nav', // Changed from admin/admin-nav
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: navData,
      }),
      invalidatesTags: ['Nav'],
    }),

    // 4. PUT: Edit an existing navigation component entry
    editNavItem: builder.mutation<INavItem, { id: string; body: IEditNavInput }>({
      query: ({ id, body }) => ({
        url: `nav/admin-nav/${id}`, // Changed from admin/admin-nav/${id}
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Nav', id }, 'Nav'],
    }),

    // 5. DELETE: Remove a navigational link element from database
    deleteNavItem: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `nav/admin-nav/${id}`, // Changed from admin/admin-nav/${id}
        method: 'DELETE',
      }),
      invalidatesTags: ['Nav'],
    }),

  }),
});

export const {
  useGetAllNavItemsQuery,
  useGetPortfolioNavItemsQuery,
  useAddNavItemMutation,
  useEditNavItemMutation,
  useDeleteNavItemMutation,
} = navApi;