import { apiSlice } from '../apiSlice'; // Adjust this path to point to your master apiSlice.ts

// Define the structural type of a Task document based on your taskM.ts model
export interface ITask {
  _id: string;
  subject: string;
  desc?: string;
  currentDate: string;
  deadline: string;
  startTime?: string;      // Optional field for initial milestones
  endTime?: string;        // Optional field for final milestones
  priority: 'low' | 'medium' | 'high';
  isCompleted: boolean;
  timeLeft: string;        // Received dynamically via Mongoose virtuals
  createdAt: string;
  updatedAt: string;
}

// Inject your endpoints into the central master apiSlice instance
export const taskApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    
    // 1. Fetch all task milestone entries
    // Targets: '/api/tasks'
    // Generic parameters changed: <ITask[], void> instead of the backend object literal wrapper layout
    getAllTasks: builder.query<ITask[], void>({
      query: () => '/tasks',
      transformResponse: (response: { success: boolean; count: number; data: ITask[] }) => response.data,
      providesTags: ['Task'],
    }),

    // 2. Add a new task item node
    addTask: builder.mutation<{ success: boolean; data: ITask }, Partial<ITask>>({
      query: (body) => ({
        url: '/tasks',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Task'],
    }),

    // 3. Edit task variables dynamically (e.g., toggling completion status or altering priority)
    editTask: builder.mutation<{ success: boolean; data: ITask }, { id: string; data: Partial<ITask> }>({
      query: ({ id, data }) => ({
        url: `/tasks/${id}`,
        method: 'PATCH', // Matches your taskController update router method
        body: data,
      }),
      invalidatesTags: ['Task'],
    }),

    // 4. Permanently delete a task instance record
    deleteTask: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Task'],
    }),
  }),
  overrideExisting: false, // Safeguards against hot-reloading block replacement issues during development
});

// RTK Query auto-generates hooks tailored to the endpoints specified above
export const {
  useGetAllTasksQuery,
  useAddTaskMutation,
  useEditTaskMutation,
  useDeleteTaskMutation,
} = taskApi;