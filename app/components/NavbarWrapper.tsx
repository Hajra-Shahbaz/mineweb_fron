// app/components/NavbarWrapper.tsx
'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from '../lib/navbar';

export default function NavbarWrapper() {
  const pathname = usePathname();
  
  // If the path starts with /admin-hs, return null (hide the navbar)
  if (pathname.startsWith('/admin-hs')) {
    return null;
  }

  return <Navbar />;
}