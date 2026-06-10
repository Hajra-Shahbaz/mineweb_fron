import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './apiSlice'; 
// Note: You don't even need to import projectApi here anymore for the store setup!

export const store = configureStore({
  reducer: {
    // 1. Only register the parent/base API reducer path
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  // 2. Only add the parent/base middleware once
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;