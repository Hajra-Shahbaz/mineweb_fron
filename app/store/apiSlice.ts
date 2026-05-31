import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Dynamically pull the live URL from your .env.local file.
// Falls back to localhost if the environment variable isn't loaded.
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ;

export const portfolioApi = createApi({
  reducerPath: 'portfolioApi',
  baseQuery: fetchBaseQuery({ baseUrl }),
  tagTypes: ['User', 'Education', 'Experience'],
  endpoints: () => ({}), // Endpoints will be injected here step-by-step
});