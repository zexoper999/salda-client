'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAdminBanners, useDeleteBanner } from '@/hooks/useAdminBanners';

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' }).replace(/\. /g, '.').replace('.', '');
}

export default function AdminContentsPage() {
  const [search, setSearch] = useState('');
  const [inputVal, setInputVal] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading } = useAdminBanners(search || undefined, page, limit);
  const deleteMutation = useDeleteBanner();

  const items = data?.data?.items ?? [];
  const total = data?.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const handleSearch = () => {
    setSearch(inputVal);
    setPage(1);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('삭제하시겠습니까?')) return;
    await deleteMutation.mutateAsync(id);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">컨텐츠관리</h1>
        <Link
          href="/admin/contents/new"
          className="px-4 py-2 bg-[#1C2536] text-white text-sm font-medium rounded-lg hover:bg-[#2a3548] transition-colors"
        >
          + 신규등록
        </Link>
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-center py-3 px-4 font-semibold text-gray-600 w-16">No.</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-600">컨텐츠 배너</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-600 w-48">공개기간</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-600 w-28">작성일</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-600 w-20">상태</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td colSpan={5} className="py-4 px-4">
                    <div className="h-4 bg-gray-100 rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-16 text-gray-400">등록된 배너가 없습니다.</td>
              </tr>
            ) : (
              items.map((item, idx) => (
                <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="text-center py-4 px-4 text-gray-500">
                    {total - (page - 1) * limit - idx}
                  </td>
                  <td className="py-4 px-4">
                    <Link href={`/admin/contents/${item.id}`} className="flex items-start gap-4">
                      <div className="w-24 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 mb-1 hover:text-blue-600 transition-colors">
                          {item.title}
                        </p>
                        {item.description && (
                          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </Link>
                  </td>
                  <td className="text-center py-4 px-4 text-gray-500 text-xs">
                    {fmtDate(item.startAt)} ~ {fmtDate(item.endAt)}
                  </td>
                  <td className="text-center py-4 px-4 text-gray-500 text-xs">
                    {fmtDate(item.createdAt)}
                  </td>
                  <td className="text-center py-4 px-4">
                    <span className={`inline-block text-xs font-medium px-2 py-1 rounded-full
                      ${item.isPublic ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {item.isPublic ? '공개' : '비공개'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 하단: 검색 + 페이지네이션 */}
      <div className="flex items-center justify-between mt-4">
        {/* 검색 */}
        <div className="flex items-center gap-2">
          <select className="h-9 px-3 border border-gray-200 rounded-lg text-sm text-gray-600 bg-white">
            <option value="content">내용</option>
          </select>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="검색어를 입력하세요"
            className="h-9 px-3 border border-gray-200 rounded-lg text-sm w-48 focus:outline-none focus:border-gray-400"
          />
          <button
            onClick={handleSearch}
            className="h-9 px-4 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
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
              className={`w-8 h-8 rounded-full text-sm font-medium transition-colors
                ${p === page ? 'bg-[#1C2536] text-white' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              {p}
            </button>
          ))}
        </div>

        <select className="h-9 px-3 border border-gray-200 rounded-lg text-sm text-gray-600 bg-white">
          <option>20개씩 보기</option>
        </select>
      </div>

      {/* 총 건수 */}
      <p className="mt-3 text-xs text-gray-400">총 {total}건</p>
    </div>
  );
}
