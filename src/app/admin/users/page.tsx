'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminUsers, useUpdateUserPoint, type AdminUser } from '@/hooks/useAdminUsers';

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getFullYear()).slice(2)}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function InlinePointEdit({ user }: { user: AdminUser }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(user.point));
  const mutation = useUpdateUserPoint();

  const handleSave = async () => {
    const point = Number(value);
    if (isNaN(point) || point < 0) return;
    await mutation.mutateAsync({ id: user.id, point });
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-24 h-8 px-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-500"
          autoFocus
        />
        <button
          onClick={handleSave}
          disabled={mutation.isPending}
          className="h-8 px-3 bg-[#1C2536] text-white text-xs rounded disabled:opacity-60"
        >
          저장
        </button>
        <button
          onClick={() => { setEditing(false); setValue(String(user.point)); }}
          className="h-8 px-2 text-gray-400 text-xs"
        >
          취소
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm">{user.point.toLocaleString()}</span>
      <button
        onClick={() => setEditing(true)}
        className="h-7 px-3 border border-gray-300 rounded text-xs text-gray-600 hover:bg-gray-50"
      >
        수정
      </button>
    </div>
  );
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [inputSearch, setInputSearch] = useState('');

  const { data, isLoading } = useAdminUsers(page, limit, search);
  const users = data?.data?.users ?? [];
  const total = data?.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const handleSearch = () => {
    setSearch(inputSearch);
    setPage(1);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-8">회원관리</h1>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* 테이블 헤더 */}
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-16">No.</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">이름</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">휴대폰번호</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">
                참여응모수 ↓
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">보유포인트</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">가입일</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">로그인수단</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-100 animate-pulse">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-4 py-4">
                      <div className="h-4 bg-gray-100 rounded" />
                    </td>
                  ))}
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">
                  회원이 없습니다.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/admin/users/${user.id}`)}
                >
                  <td className="px-4 py-4 text-gray-500">{user.id}</td>
                  <td className="px-4 py-4 font-medium text-gray-800">{user.name}</td>
                  <td className="px-4 py-4 text-gray-600 font-mono">{user.phone ?? '-'}</td>
                  <td className="px-4 py-4 text-gray-600">{user.entryCount}</td>
                  <td
                    className="px-4 py-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <InlinePointEdit user={user} />
                  </td>
                  <td className="px-4 py-4 text-gray-500">{fmtDate(user.createdAt)}</td>
                  <td className="px-4 py-4 text-gray-500">{user.loginType}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 하단 바 */}
      <div className="flex items-center justify-between mt-4">
        {/* 검색 */}
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <span className="px-3 py-2 text-xs text-gray-500 bg-gray-50 border-r border-gray-200">
              이름
            </span>
            <input
              type="text"
              value={inputSearch}
              onChange={(e) => setInputSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="검색어를 입력하세요"
              className="px-3 py-2 text-sm focus:outline-none w-48"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-[#1C2536] text-white text-sm rounded-lg"
          >
            검색
          </button>
        </div>

        {/* 페이지네이션 */}
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                p === page
                  ? 'bg-[#1C2536] text-white'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* 페이지당 개수 */}
        <select
          value={limit}
          onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
          className="h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none"
        >
          <option value={20}>20개씩 보기</option>
          <option value={50}>50개씩 보기</option>
          <option value={100}>100개씩 보기</option>
        </select>
      </div>
    </div>
  );
}
