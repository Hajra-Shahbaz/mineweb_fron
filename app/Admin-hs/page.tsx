'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import PasscodeLock from './controllers/components/lock'; // Adjust this import path based on where your file is saved

export default function AdminHubPage() {
  const router = useRouter();

  const handleSuccessRedirect = () => {
    // Force a push to the controller page after successful authorization
    router.push('/Admin-hs/controllers');
  };

  return (
    <main className="min-h-screen w-full bg-white">
      <PasscodeLock
        onSuccessRedirectAction={handleSuccessRedirect}
        // Replace this URL with your preferred character image
        bgImageUrl="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop" 
        correctPin="2310"
      />
    </main>
  );
}