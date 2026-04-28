'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/axios';
import type { ApiResponse, User } from '@/types';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { login, logout } = useAuthStore();
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  const { data, isError, isSuccess } = useQuery<ApiResponse<User>>({
    queryKey: ['auth-me'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<User>>('/auth/me');
      return res.data;
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
    enabled: !isAdminRoute, // 어드민 경로에서는 일반 인증 체크 skip
  });

  useEffect(() => {
    if (isSuccess) {
      if (data?.data) {
        login(data.data);
      } else {
        logout();
      }
    } else if (isError) {
      logout();
    }
  }, [isSuccess, isError, data, login, logout]);

  return <>{children}</>;
}
