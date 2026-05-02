'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminInquiries, type AdminInquiry } from '@/hooks/useAdminInquiries';

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getFullYear()).slice(2)}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function StatusBadge({ status }: { status: 'PENDING' | 'ANSWERED' }) {
  return (
    <span className={`text-sm font-medium ${status === 'PENDING' ? 'text-orange-500' : 'text-gray-400'}`}>
      {status === 'PENDING' ? '답변대기중' : '답변완료'}
    </span>
  );
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b border-gray-100 animate-pulse">
          {Array.from({ length: 6 }).map((_, j) => (
            <td key={j} className="px-4 py-5">
              <div className="h-4 bg-gray-100 rounded" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function InquiryRow({ inquiry }: { inquiry: AdminInquiry }) {
  const router = useRouter();
  const answered = inquiry.status === 'ANSWERED';
  const cls = answered ? 'text-gray-400' : '';
  return (
    <tr
      className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={() => router.push(`/admin/inquiries/${inquiry.id}`)}
    >
      <td className={`px-4 py-4 ${cls || 'text-gray-500'}`}>{inquiry.id}</td>
      <td className={`px-4 py-4 font-medium ${cls || 'text-gray-800'}`}>{inquiry.title}</td>
      <td className="px-4 py-4"><StatusBadge status={inquiry.status} /></td>
      <td className={`px-4 py-4 ${cls || 'text-gray-600'}`}>{inquiry.user.name}</td>
      <td className={`px-4 py-4 ${cls || 'text-gray-500'}`}>{inquiry.user.phone ?? '-'}</td>
      <td className={`px-4 py-4 ${cls || 'text-gray-500'}`}>{fmtDate(inquiry.createdAt)}</td>
    </tr>
  );
}

export default function AdminInquiriesPage() {
  const [page, setPage] = useState(1);
  const [inputSearch, setInputSearch] = useState('');
  const [search, setSearch] = useState('');
  const LIMIT = 10;

  const { data, isLoading } = useAdminInquiries(page, search);
  const inquiries = data?.data?.inquiries ?? [];
  const total = data?.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const handleSearch = () => { setSearch(inputSearch); setPage(1); };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-8">문의관리</h1>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-14">No.</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">질문</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-28">상태</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-24">이름</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-32">휴대폰번호</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-24">등록일</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <SkeletonRows />
            ) : inquiries.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">
                  등록된 문의가 없습니다.
                </td>
              </tr>
            ) : (
              inquiries.map((q) => <InquiryRow key={q.id} inquiry={q} />)
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
            placeholder="이름으로 검색"
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

        {/* 등록 버튼 없음 - 유저만 등록 가능 */}
        <div className="w-28" />
      </div>
    </div>
  );
}
