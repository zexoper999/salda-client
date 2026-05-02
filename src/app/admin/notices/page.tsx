'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminNotices, type AdminNotice } from '@/hooks/useAdminNotices';

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getFullYear()).slice(2)}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function VisibleBadge({ isVisible }: { isVisible: boolean }) {
  return (
    <span className={`text-sm font-medium ${isVisible ? 'text-blue-600' : 'text-gray-400'}`}>
      {isVisible ? '공개' : '비공개'}
    </span>
  );
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b border-gray-100 animate-pulse">
          {Array.from({ length: 5 }).map((_, j) => (
            <td key={j} className="px-4 py-5">
              <div className="h-4 bg-gray-100 rounded" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function NoticeRow({ notice }: { notice: AdminNotice }) {
  const router = useRouter();
  return (
    <tr
      className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={() => router.push(`/admin/notices/${notice.id}`)}
    >
      <td className="px-4 py-4 text-gray-500">{notice.id}</td>
      <td className="px-4 py-4 font-medium text-gray-800">{notice.title}</td>
      <td className="px-4 py-4 text-gray-500">{notice.viewCount.toLocaleString()}</td>
      <td className="px-4 py-4"><VisibleBadge isVisible={notice.isVisible} /></td>
      <td className="px-4 py-4 text-gray-500">{fmtDate(notice.createdAt)}</td>
    </tr>
  );
}

export default function AdminNoticesPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [inputSearch, setInputSearch] = useState('');
  const [search, setSearch] = useState('');
  const LIMIT = 10;

  const { data, isLoading } = useAdminNotices(page, search);
  const notices = data?.data?.notices ?? [];
  const total = data?.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const handleSearch = () => { setSearch(inputSearch); setPage(1); };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-8">공지사항</h1>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-14">No.</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">제목</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-24">조회수</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-24">공개여부</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-24">등록일</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <SkeletonRows />
            ) : notices.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-400">
                  등록된 공지사항이 없습니다.
                </td>
              </tr>
            ) : (
              notices.map((n) => <NoticeRow key={n.id} notice={n} />)
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputSearch}
            onChange={(e) => setInputSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="제목으로 검색"
            className="h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none w-44"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-[#1C2536] text-white text-sm rounded-lg"
          >
            검색
          </button>
        </div>

        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                p === page ? 'bg-[#1C2536] text-white' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <button
          onClick={() => router.push('/admin/notices/new')}
          className="px-5 py-2.5 bg-[#1C2536] text-white text-sm font-semibold rounded-lg hover:bg-[#2a3548] transition-colors"
        >
          공지사항 등록
        </button>
      </div>
    </div>
  );
}
