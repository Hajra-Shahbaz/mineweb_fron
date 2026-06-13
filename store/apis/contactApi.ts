import { apiSlice } from '../apiSlice'; // Adjust this path to point to your master apiSlice.ts

export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';
export type MessageCategory = 'general' | 'project_inquiry' | 'feedback' | 'bug_report' | 'other';

// Updated interface matching your database structure
export interface IContactMessage {
  _id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  subject: string;
  message: string;
  isRead: boolean;
  priority: PriorityLevel;
  category: MessageCategory;
  isArchived: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Updated payload allowing visitors or yourself to explicitly pass priority/category settings
export interface IContactSubmitPayload {
  name: string;
  email: string;
  phoneNumber?: string;
  subject: string;
  message: string;
  priority?: PriorityLevel;   // Optional: so the form can explicitly pass an urgency flag
  category?: MessageCategory; // Optional: so the form can explicitly pass a category selection
}

// Flexible query argument for filtering your dashboard view on the fly
export interface IInboxFilters {
  isRead?: boolean;
  priority?: PriorityLevel;
  category?: MessageCategory;
  isArchived?: boolean;
}

// Dynamic payload allowing updates to read state, priority changes, or saving admin notes
export interface IUpdateMessagePayload {
  id: string;
  isRead?: boolean;
  priority?: PriorityLevel;
  category?: MessageCategory;
  notes?: string;
}

export interface IToggleArchivePayload {
  id: string;
  isArchived: boolean;
}

export const contactApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    
    // 1. Submit a new contact form message (Used by portfolio visitors)
    // Targets: 'POST /api/contact'
    submitMessage: builder.mutation<{ message: string; data: IContactMessage }, IContactSubmitPayload>({
      query: (body) => ({
        url: '/contact',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Contact'],
    }),

    // 2. Fetch inbox messages with optional dynamic filters (e.g., ?isRead=false&priority=urgent)
    // Targets: 'GET /api/contact'
    getInbox: builder.query<IContactMessage[], IInboxFilters | void>({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined) params.append(key, String(value));
          });
        }
        const queryString = params.toString();
        return `/contact${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Contact'],
    }),

    // 3. Update any message detail (Mark read, switch category, edit admin notes, check/uncheck urgent)
    // Targets: 'PUT /api/contact/:id'
    updateMessageDetails: builder.mutation<{ message: string; data: IContactMessage }, IUpdateMessagePayload>({
      query: ({ id, ...body }) => ({
        url: `/contact/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Contact'],
    }),

    // 4. Send a message to the archive or restore it back to the inbox
    // Targets: 'PATCH /api/contact/:id/archive'
    toggleArchiveStatus: builder.mutation<{ message: string; data: IContactMessage }, IToggleArchivePayload>({
      query: ({ id, isArchived }) => ({
        url: `/contact/${id}/archive`,
        method: 'PATCH',
        body: { isArchived },
      }),
      invalidatesTags: ['Contact'],
    }),

    // 5. Hard Delete/Permanent purge from your dashboard view
    // Targets: 'DELETE /api/contact/:id'
    deleteMessage: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/contact/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Contact'],
    }),
  }),
  overrideExisting: false,
});

// Clean, auto-generated semantic hooks
export const {
  useSubmitMessageMutation,
  useGetInboxQuery,
  useUpdateMessageDetailsMutation,
  useToggleArchiveStatusMutation,
  useDeleteMessageMutation,
} = contactApi;