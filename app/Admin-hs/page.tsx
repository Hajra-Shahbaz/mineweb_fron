'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PasscodeLock from './controllers/components/lock'; 

export default function AdminHubPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // If token already exists, auto-forward past the lock screen
    if (localStorage.getItem('auth_token')) {
      router.replace('/admin-hs/controllers');
    } else {
      setChecking(false); 
    }
  }, [router]);

  const handleSuccessRedirect = () => {
    router.push('/Admin-hs/controllers');
  };

  if (checking) return null; // Or a simple clean loading blank space

  return (
    <main className="min-h-screen w-full bg-white">
      <PasscodeLock
        onSuccessRedirectAction={handleSuccessRedirect}
        bgImageUrl="https://my-blogfolio-web-26.s3.ap-southeast-2.amazonaws.com/0c538a0c0be1058a12c302c4914a3925-removebg-preview.png" 
        correctPin="2310"
      />
    </main>
  );
}