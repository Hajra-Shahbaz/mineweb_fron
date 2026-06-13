import { apiSlice } from '../apiSlice';

// Define the matching types for your React frontend interfaces
export interface IProfilePicture {
  url: string;
  isActive: boolean;
}

export interface IUserProfile {
  _id?: string;
  name: string;
  email: string;          // 🌟 Added email
  phoneNumber?: string;   // 🌟 Added optional phone number
  title: string;
  aboutText: string;
  subText?: string;
  profilePictures: IProfilePicture[];
  resumeUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Request payload interface for the initial text POST block
export interface ICreateProfileInput {
  name: string;
  email: string;          // 🌟 Added email (Required for initial setup)
  phoneNumber?: string;   // 🌟 Added optional phone number
  title: string;
  aboutText: string;
  subText?: string;
}

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    
    // 1. GET: Fetch the live profile data cluster
    getUserProfile: builder.query<{ success: boolean; data: IUserProfile } | IUserProfile, any>({
      query: () => 'user',
      providesTags: ['User'],
    }),

    // 2. POST: Create the profile initial setup config (JSON structure)
    createUserProfile: builder.mutation<any, ICreateProfileInput>({
      query: (profileData) => ({
        url: 'user',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: profileData,
      }),
      invalidatesTags: ['User'],
    }),

    // 3. PUT: Edit profile data (Handles Multipart Form-Data for Files)
    editUserProfile: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: 'user',
        method: 'PUT',
        // IMPORTANT: Do NOT set Content-Type header here. 
        // The browser automatically sets it with the correct boundary parameter when passing FormData.
        body: formData,
      }),
      invalidatesTags: ['User'],
    }),

    // 4. DELETE: Drop profile configuration pipelines completely
    deleteUserProfile: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({
        url: 'user',
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),

  }),
});

export const {
  useGetUserProfileQuery,
  useCreateUserProfileMutation,
  useEditUserProfileMutation,
  useDeleteUserProfileMutation,
} = userApi;