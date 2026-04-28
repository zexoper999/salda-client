'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { useAdminStore } from '@/store/useAdminStore';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { login, logout } = useAdminStore();
  const isLoginPage = pathname === '/admin/login';

  const { data, isError, isSuccess } = useQuery({
    queryKey: ['admin-me'],
    queryFn: async () => {
      const res = await api.get('/admin/auth/me');
      return res.data;
    },
    retry: false,
    enabled: !isLoginPage,
  });

  useEffect(() => {
    if (isLoginPage) return;
    if (isSuccess && data?.data?.username) {
      login(data.data.username as string);
    } else if (isError) {
      logout();
      router.replace('/admin/login');
    }
  }, [isSuccess, isError, data, isLoginPage, login, logout, router]);

  const handleLogout = async () => {
    try { await api.post('/admin/auth/logout'); } catch { /* ignore */ }
    logout();
    router.replace('/admin/login');
  };

  if (isLoginPage) {
    return (
      <div className="fixed inset-0 bg-white z-[1000]">
        {children}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-50 z-[1000] flex">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* 헤더 */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-end px-6 gap-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" fill="#9CA3AF" />
                <path d="M4 20C4 16.13 7.58 13 12 13C16.42 13 20 16.13 20 20" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-sm text-gray-600">관리자님, 안녕하세요</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            로그아웃
          </button>
        </header>

        {/* 컨텐츠 */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
