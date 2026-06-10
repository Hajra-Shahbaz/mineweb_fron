import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://apimw.hasoftz.com/api';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: API_URL }),
  tagTypes: ['Project', 'User', 'Nav', 'Experience', 'Education', 'Skill', 'Social'], // Helps RTK Query auto-refresh when things change
  endpoints: () => ({}), // We keep this empty here and inject endpoints from other files!
});