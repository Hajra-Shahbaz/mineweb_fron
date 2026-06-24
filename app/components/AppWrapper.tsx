// app/components/AppWrapper.tsx
"use client";

import { useEffect, useState } from 'react';
import { useGetUserProfileQuery } from '@/store/apis/userApi';

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = useGetUserProfileQuery({});
  const [isColorApplied, setIsColorApplied] = useState(false);
  
  const mainColor = (data as any)?.data?.mainColor || (data as any)?.mainColor;

  useEffect(() => {
    if (mainColor && typeof mainColor === 'string') {
      document.documentElement.style.setProperty('--brand-color', mainColor);
      setIsColorApplied(true);
    } else if (!isLoading && !mainColor) {
      // If API loaded but no color, use default
      document.documentElement.style.setProperty('--brand-color', '#3b82f6');
      setIsColorApplied(true);
    }
  }, [mainColor, isLoading]);

  // Don't render children until color is applied
  if (!isColorApplied && isLoading) {
    return null; // or a loading spinner
  }

  return <>{children}</>;
}