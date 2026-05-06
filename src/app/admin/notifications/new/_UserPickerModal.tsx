'use client';

import { useState } from 'react';
import { useNotificationUsers, type NotificationUser } from '@/hooks/useAdminNotifications';

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getFullYear()).slice(2)}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function loginMethod(u: NotificationUser) {
  if (u.kakaoId) return '카카오';
  if (u.appleId) return '애플';
  return '-';
}

function NotifBadge({ on, label }: { on: boolean; label: string }) {
  return (
    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] mr-0.5 ${on ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
      {label}
    </span>
  );
}

interface Props {
  selected: NotificationUser[];
  onConfirm: (users: NotificationUser[]) => void;
  onClose: () => void;
}

export default function UserPickerModal({ selected, onConfirm, onClose }: Props) {
  const [inputSearch, setInputSearch] = useState('');
  const [search, setSearch] = useState('');
  const [picks, setPicks] = useState<Set<number>>(new Set(selected.map((u) => u.id)));

  const { data, isLoading } = useNotificationUsers(search, true);
  const users = data?.data ?? [];

  const handleSearch = () => setSearch(inputSearch);

  const togglePick = (id: number) => {
    setPicks((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleConfirm = () => {
    const pickedUsers = users.filter((u) => picks.has(u.id));
    // preserve previously selected users not in current search results
    const fromPrev = selected.filter((u) => picks.has(u.id) && !users.find((x) => x.id === u.id));
    onConfirm([...pickedUsers, ...fromPrev]);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-bold text-gray-800">발신대상 추가하기</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 w-10" />
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">이름</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">휴대폰번호</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">보유포인트</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">응모수</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">가입일</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">로그인</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">알림수신</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-100 animate-pulse">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-4"><div className="h-4 bg-gray-100 rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400">검색 결과가 없습니다.</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u.id}
                    className={`border-b border-gray-100 cursor-pointer transition-colors ${picks.has(u.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                    onClick={() => togglePick(u.id)}
                  >
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={picks.has(u.id)}
                        onChange={() => togglePick(u.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="accent-[#1C2536]"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">{u.name}</td>
                    <td className="px-4 py-3 text-gray-600">{u.phone ?? '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{u.point.toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-600">{u._count.subscriptionEntries}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{fmtDate(u.createdAt)}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{loginMethod(u)}</td>
                    <td className="px-4 py-3">
                      <NotifBadge on={u.notifAll} label="전체" />
                      <NotifBadge on={u.notifSubscription} label="청약" />
                      <NotifBadge on={u.notifMarketing} label="마케팅" />
                      <NotifBadge on={u.notifInfo} label="안내" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center gap-2 px-6 py-4 border-t border-gray-200">
          <input
            type="text"
            value={inputSearch}
            onChange={(e) => setInputSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="이름으로 검색"
            className="h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none flex-1"
          />
          <button
            onClick={handleSearch}
            className="px-4 h-9 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200"
          >
            검색
          </button>
          <div className="flex-1" />
          <button onClick={onClose} className="px-5 h-9 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            취소
          </button>
          <button
            onClick={handleConfirm}
            className="px-5 h-9 bg-[#1C2536] text-white text-sm font-semibold rounded-lg hover:bg-[#2a3548]"
          >
            추가완료 {picks.size > 0 && `(${picks.size}명)`}
          </button>
        </div>
      </div>
    </div>
  );
}
