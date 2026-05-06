'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  useAdminNotifications,
  useDeleteNotification,
  type AdminNotification,
} from '@/hooks/useAdminNotifications';
import { useToastStore } from '@/store/useToastStore';

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getFullYear()).slice(2)}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function StatusBadge({ status }: { status: AdminNotification['status'] }) {
  const map = {
    PENDING: { label: '발신대기중', cls: 'bg-yellow-100 text-yellow-700' },
    SENT:    { label: '발신완료',   cls: 'bg-green-100 text-green-700' },
    FAILED:  { label: '발신실패',   cls: 'bg-red-100 text-red-600' },
  };
  const { label, cls } = map[status];
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{label}</span>;
}

function TargetLabel({ n }: { n: AdminNotification }) {
  if (n.targetType === 'ALL') return <span className="text-gray-700">회원전체</span>;
  if (!n.targets.length) return <span className="text-gray-400">-</span>;
  const first = n.targets[0].user.name;
  return (
    <span className="text-gray-700">
      {first}{n.targets.length > 1 ? ` 외 ${n.targets.length - 1}명` : ''}
    </span>
  );
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b border-gray-100 animate-pulse">
          {Array.from({ length: 6 }).map((_, j) => (
            <td key={j} className="px-4 py-5"><div className="h-4 bg-gray-100 rounded" /></td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default function AdminNotificationsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [inputSearch, setInputSearch] = useState('');
  const [search, setSearch] = useState('');
  const { show: showToast } = useToastStore();
  const LIMIT = 10;

  const { data, isLoading } = useAdminNotifications(page, search);
  const deleteMutation = useDeleteNotification();

  const notifications = data?.data?.notifications ?? [];
  const total = data?.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const handleSearch = () => { setSearch(inputSearch); setPage(1); };

  const handleDelete = async (id: number) => {
    if (!confirm('알림을 삭제하시겠습니까?')) return;
    try {
      await deleteMutation.mutateAsync(id);
      showToast('success', '삭제되었습니다.');
    } catch {
      showToast('error', '삭제에 실패했습니다.');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-8">알림관리</h1>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-14">No.</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">알림내용</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-32">발신대상</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-36">발신시간</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-24">등록일</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-24">발신상태</th>
              <th className="px-4 py-3 w-12" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <SkeletonRows />
            ) : notifications.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">
                  발송된 알림이 없습니다.
                </td>
              </tr>
            ) : (
              notifications.map((n) => (
                <tr key={n.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 text-gray-500">{n.id}</td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-gray-800 truncate max-w-xs">{n.title}</p>
                    <p className="text-xs text-gray-400 truncate max-w-xs mt-0.5">{n.body}</p>
                  </td>
                  <td className="px-4 py-4 text-sm"><TargetLabel n={n} /></td>
                  <td className="px-4 py-4 text-xs text-gray-500">
                    {n.sentAt ? fmtDate(n.sentAt) : n.sendAt ? fmtDate(n.sendAt) : '-'}
                  </td>
                  <td className="px-4 py-4 text-xs text-gray-500">{fmtDate(n.createdAt)}</td>
                  <td className="px-4 py-4"><StatusBadge status={n.status} /></td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => handleDelete(n.id)}
                      className="text-xs text-red-400 hover:text-red-600"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))
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
            placeholder="내용으로 검색"
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
          onClick={() => router.push('/admin/notifications/new')}
          className="px-5 py-2.5 bg-[#1C2536] text-white text-sm font-semibold rounded-lg hover:bg-[#2a3548] transition-colors"
        >
          알림등록
        </button>
      </div>
    </div>
  );
}
