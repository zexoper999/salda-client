'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

// 앱 진입점: 인증 상태에 따라 /home 또는 /login 으로 분기
export default function RootPage() {
  const router = useRouter();
  const { isLoggedIn, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;
    router.replace(isLoggedIn ? '/home' : '/login');
  }, [isLoggedIn, isLoading, router]);

  return (
    <div className="flex items-center justify-center min-h-dvh bg-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[var(--color-text-secondary)]">잠시만요...</p>
      </div>
    </div>
  );
}
