'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../store/store';
import { portfolioApi } from '../store/apiSlice';

// 1. Inject our test endpoint
const testApiInjection = portfolioApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfileDataTest: builder.query<any, void>({
      query: () => '/user',
      providesTags: ['User'],
    }),
  }),
  overrideExisting: true,
});

const { useGetProfileDataTestQuery } = testApiInjection;

// 2. The Internal Content Component that consumes the Redux state safely
function AdminHSContent() {
  const { data, error, isLoading } = useGetProfileDataTestQuery();

  return (
    <div className="p-8 max-w-4xl mx-auto rounded-3xl border border-white/20 bg-white/10 dark:bg-[#191973]/10 backdrop-blur-md shadow-2xl transition-all">
      <h1 className="text-3xl font-bold tracking-tight text-[#191973] dark:text-white mb-2">
        Owl·Control Systems
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        Target Gateway: <code className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded text-xs text-pink-500">{process.env.NEXT_PUBLIC_API_BASE_URL}</code>
      </p>

      <hr className="border-white/10 mb-6" />

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Live Production Connection Test:</h2>

        {isLoading && (
          <div className="flex items-center gap-3 text-amber-500 animate-pulse">
            <span className="text-xl">🔄</span>
            <p className="font-medium">Streaming payload from your live server subdomain...</p>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
            <p className="font-bold mb-1">❌ Connection Refused / Error Encountered:</p>
            <pre className="text-xs overflow-auto max-h-40 p-2 bg-black/20 rounded">
              {JSON.stringify(error, null, 2)}
            </pre>
          </div>
        )}

        {data && (
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm">
            <p className="font-bold mb-2">✅ Success! Connected to Production Database:</p>
            <pre className="text-xs text-slate-700 dark:text-slate-300 overflow-auto max-h-60 p-3 bg-white/50 dark:bg-black/30 rounded-lg">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

// 3. Main Export wrapped directly with the state Provider container to clear any context issues
export default function AdminHSPage() {
  return (
    <Provider store={store}>
      <AdminHSContent />
    </Provider>
  );
}