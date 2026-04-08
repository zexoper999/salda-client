'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/axios';
import type { ApiResponse, User } from '@/types';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { login, logout } = useAuthStore();

  const { data, isError, isSuccess } = useQuery<ApiResponse<User>>({
    queryKey: ['auth-me'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<User>>('/auth/me');
      return res.data;
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5분 캐시
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
