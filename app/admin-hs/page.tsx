'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PasscodeLock from './controllers/components/lock'; 

export default function AdminHubPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (localStorage.getItem('auth_token')) {
      router.replace('/admin-hs/controllers');
    } else {
      setChecking(false); 
    }
  }, [router]);

  const handleSuccessRedirect = () => {
    router.push('/admin-hs/controllers');
  };

  if (checking) return null; 

  return (
    // Removed all borders, shadows, and background colors
    <main className="min-h-screen w-full flex items-center justify-center bg-white">
      <div className="flex flex-col items-center">
        {/* Simplified Lock UI */}
        <PasscodeLock
          onSuccessRedirectAction={handleSuccessRedirect}
          bgImageUrl="https://my-blogfolio-web-26.s3.ap-southeast-2.amazonaws.com/0c538a0c0be1058a12c302c4914a3925-removebg-preview.png" 
          correctPin="2310"
        />
        
        {/* Tiny footer text for balance instead of big headings */}
        <p className="mt-8 text-[10px] text-gray-300 uppercase tracking-[0.2em] font-medium">
          Authorized Administrative Access Only
        </p>
      </div>
    </main>
  );
}