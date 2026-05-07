'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminSubscriptions, useSetDefaultSubscription, STATUS_LABEL, type AdminSubscription } from '@/hooks/useAdminSubscriptions';

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getFullYear()).slice(2)}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function StatusBadge({ status }: { status: AdminSubscription['status'] }) {
  const colors: Record<string, string> = {
    ONGOING: 'text-gray-600',
    CLOSING_SOON: 'text-red-500 font-semibold',
    CLOSED: 'text-gray-400',
  };
  return <span className={colors[status]}>{STATUS_LABEL[status]}</span>;
}

export default function AdminSubscriptionsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [inputSearch, setInputSearch] = useState('');
  const [search, setSearch] = useState('');
  const LIMIT = 10;

  const { data, isLoading } = useAdminSubscriptions(page, LIMIT, search);
  const setDefaultMutation = useSetDefaultSubscription();
  const subs = data?.data?.subscriptions ?? [];
  const total = data?.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const handleSearch = () => { setSearch(inputSearch); setPage(1); };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-8">청약관리</h1>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-16">No.</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">청약내용</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-36">응모기간</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-24">응모현황</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-20">작성일</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-24">상태</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-24">Default</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-100 animate-pulse">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-4 py-5">
                      <div className="h-4 bg-gray-100 rounded" />
                    </td>
                  ))}
                </tr>
              ))
            ) : subs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">
                  등록된 청약이 없습니다.
                </td>
              </tr>
            ) : (
              subs.map((sub) => (
                <tr
                  key={sub.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/admin/subscriptions/${sub.id}`)}
                >
                  <td className="px-4 py-4 text-gray-500">{sub.id}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {sub.imageUrls[0] ? (
                        <img src={sub.imageUrls[0]} alt="" className="w-16 h-12 object-cover rounded-lg flex-shrink-0" />
                      ) : (
                        <div className="w-16 h-12 bg-gray-100 rounded-lg flex-shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="text-xs text-gray-400 mb-0.5">
                          {sub.type === 'JEONSE' ? '전세청약' : '차량청약'}
                        </p>
                        <p className="font-semibold text-gray-800 truncate">{sub.title}</p>
                        {sub.oneLineDesc && (
                          <p className="text-xs text-gray-500 truncate mt-0.5 max-w-xs">
                            {sub.oneLineDesc}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-gray-500 text-xs">
                    {fmtDate(sub.startAt)}~{fmtDate(sub.endAt)}
                  </td>
                  <td className="px-4 py-4 font-medium text-gray-700">{sub.entryCountFmt}</td>
                  <td className="px-4 py-4 text-gray-500">{fmtDate(sub.createdAt)}</td>
                  <td className="px-4 py-4"><StatusBadge status={sub.status} /></td>
                  <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                    {sub.isDefault ? (
                      <span className="text-xs font-bold text-[#1C2536] px-2.5 py-1 bg-blue-100 rounded-full">
                        Default
                      </span>
                    ) : (
                      <button
                        onClick={() => setDefaultMutation.mutate(sub.id)}
                        disabled={setDefaultMutation.isPending || sub.status === 'CLOSED'}
                        className="text-xs px-2.5 py-1 border border-gray-300 rounded-full text-gray-500 hover:border-[#1C2536] hover:text-[#1C2536] disabled:opacity-40 transition-colors"
                      >
                        지정
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 하단 바 */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputSearch}
            onChange={(e) => setInputSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="타이틀로 검색"
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
          onClick={() => router.push('/admin/subscriptions/new')}
          className="px-5 py-2.5 bg-[#1C2536] text-white text-sm font-semibold rounded-lg hover:bg-[#2a3548] transition-colors"
        >
          청약등록
        </button>
      </div>
    </div>
  );
}
