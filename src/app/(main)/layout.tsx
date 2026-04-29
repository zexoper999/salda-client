'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import BottomTabBar from '@/components/layout/BottomTabBar';

const TOP_LEVEL_PATHS = new Set(['/home', '/subscriptions', '/shop', '/missions', '/my']);

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.replace('/login');
    }
  }, [isLoggedIn, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isTopLevel = TOP_LEVEL_PATHS.has(pathname);

  return (
    <div className={isTopLevel ? 'pb-[60px]' : ''}>
      {children}
      <BottomTabBar />
    </div>
  );
}
