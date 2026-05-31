import { configureStore } from '@reduxjs/toolkit';
import { portfolioApi } from './apiSlice';

export const store = configureStore({
  reducer: {
    // Mounts the auto-generated api cache reducer
    [portfolioApi.reducerPath]: portfolioApi.reducer,
  },
  // Adding the api middleware enables caching, invalidation, and polling features of RTK Query
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(portfolioApi.middleware),
});

// Strict TypeScript Types to use across your application layouts
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;