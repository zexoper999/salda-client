'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  useAdminMissions, useUpdateMission,
  CATEGORY_LABEL, STATUS_LABEL,
  type AdminMission, type MissionStatus,
} from '@/hooks/useAdminMissions';

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getFullYear()).slice(2)}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function PeriodCell({ startAt, endAt }: { startAt: string | null; endAt: string | null }) {
  if (!startAt && !endAt) return <span className="text-gray-400">기간없음</span>;
  return <span>{startAt ? fmtDate(startAt) : ''}~{endAt ? fmtDate(endAt) : ''}</span>;
}

function StatusBadge({ status }: { status: MissionStatus }) {
  const colors: Record<MissionStatus, string> = {
    ACTIVE: 'text-blue-600',
    INACTIVE: 'text-gray-400',
    CLOSED: 'text-red-400',
  };
  return <span className={`text-sm font-medium ${colors[status]}`}>{STATUS_LABEL[status]}</span>;
}

function ActiveToggle({ mission }: { mission: AdminMission }) {
  const update = useUpdateMission(mission.id);
  const isClosed = mission.status === 'CLOSED';
  const isOn = mission.status === 'ACTIVE';

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        if (isClosed) return;
        update.mutate({ status: isOn ? 'INACTIVE' : 'ACTIVE' });
      }}
      disabled={isClosed || update.isPending}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-40 ${
        isOn ? 'bg-blue-500' : 'bg-gray-200'
      }`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${isOn ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

export default function AdminMissionsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [inputSearch, setInputSearch] = useState('');
  const [search, setSearch] = useState('');
  const LIMIT = 10;

  const { data, isLoading } = useAdminMissions(page, LIMIT, search);
  const missions = data?.data?.missions ?? [];
  const total = data?.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const handleSearch = () => { setSearch(inputSearch); setPage(1); };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-8">미션관리</h1>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-14">No.</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">미션내용</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-36">진행기간</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-20">미션성공</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-20">등록일</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-24">상태</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-20">활성화</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-100 animate-pulse">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-4 py-5"><div className="h-4 bg-gray-100 rounded" /></td>
                  ))}
                </tr>
              ))
            ) : missions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">등록된 미션이 없습니다.</td>
              </tr>
            ) : (
              missions.map((m) => (
                <tr
                  key={m.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/admin/missions/${m.id}`)}
                >
                  <td className="px-4 py-4 text-gray-500">{m.id}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {m.imageUrls[0] ? (
                        <img src={m.imageUrls[0]} alt="" className="w-16 h-12 object-cover rounded-lg flex-shrink-0" />
                      ) : (
                        <div className="w-16 h-12 bg-gray-100 rounded-lg flex-shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="text-xs text-gray-400 mb-0.5">{CATEGORY_LABEL[m.category]}{m.publisher && ` · ${m.publisher}`}</p>
                        <p className="font-semibold text-gray-800 truncate">{m.title}</p>
                        {m.oneLineDesc && <p className="text-xs text-gray-500 line-clamp-2 mt-0.5 max-w-sm">{m.oneLineDesc}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-gray-500 text-xs">
                    <PeriodCell startAt={m.startAt} endAt={m.endAt} />
                  </td>
                  <td className="px-4 py-4 font-medium text-gray-700">{m.successCountFmt}</td>
                  <td className="px-4 py-4 text-gray-500">{fmtDate(m.createdAt)}</td>
                  <td className="px-4 py-4"><StatusBadge status={m.status} /></td>
                  <td className="px-4 py-4"><ActiveToggle mission={m} /></td>
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
            placeholder="타이틀로 검색"
            className="h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none w-44"
          />
          <button onClick={handleSearch} className="px-4 py-2 bg-[#1C2536] text-white text-sm rounded-lg">검색</button>
        </div>

        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${p === page ? 'bg-[#1C2536] text-white' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => router.push('/admin/missions/new')}
            className="px-5 py-2.5 border border-[#1C2536] text-[#1C2536] text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            미션등록
          </button>
          <button
            disabled
            title="외부 API 연동 후 사용 가능합니다"
            className="px-5 py-2.5 bg-[#1C2536] text-white text-sm font-semibold rounded-lg opacity-40 cursor-not-allowed"
          >
            미션호출
          </button>
        </div>
      </div>
    </div>
  );
}
