'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/axios';
import { useAdminStore } from '@/store/useAdminStore';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAdminStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/admin/auth/login', { username, password });
      login(res.data?.data?.username ?? 'admin');
      router.replace('/admin/contents');
    } catch {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1C2536] flex items-center justify-center">
      <div className="w-full max-w-sm">
        {/* 로고 */}
        <div className="text-center mb-10">
          <p className="text-white text-2xl font-bold tracking-widest">SALDA</p>
          <p className="text-white/40 text-sm mt-1">살다 관리자</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 space-y-5">
          <h2 className="text-lg font-bold text-gray-800 mb-2">로그인</h2>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">아이디</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="아이디를 입력하세요"
              className="w-full h-11 px-4 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              className="w-full h-11 px-4 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
              required
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-lg bg-[#1C2536] text-white text-sm font-semibold disabled:opacity-60 hover:bg-[#2a3548] transition-colors"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  );
}
