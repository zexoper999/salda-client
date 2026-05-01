'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  useAdminMission, useCreateMission, useUpdateMission, useDeleteMission,
  CATEGORY_LABEL, STATUS_LABEL,
  type MissionCategory, type MissionStatus,
} from '@/hooks/useAdminMissions';
import ImageUploader from '@/components/admin/ImageUploader';

const isNew = (id: string) => id === 'new';

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getFullYear()).slice(2)}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function toDateInput(iso: string | null) {
  if (!iso) return '';
  return new Date(iso).toISOString().split('T')[0];
}

export default function AdminMissionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const creating = isNew(id);
  const missionId = creating ? 0 : Number(id);

  const [participantPage, setParticipantPage] = useState(1);
  const [inputSearch, setInputSearch] = useState('');
  const [participantSearch, setParticipantSearch] = useState('');

  const { data, isLoading } = useAdminMission(missionId, participantPage, participantSearch);
  const createMutation = useCreateMission();
  const updateMutation = useUpdateMission(missionId);
  const deleteMutation = useDeleteMission();

  const [form, setForm] = useState({
    category: 'SNS_SUBSCRIBE' as MissionCategory,
    title: '',
    publisher: '',
    oneLineDesc: '',
    description: '',
    imageUrls: [] as string[],
    missionUrl: '',
    rewardPoint: 0,
    rewardTicket: 0,
    ageRestriction: false,
    isFirstCome: false,
    limitCount: '' as string | number,
    startAt: '',
    endAt: '',
    status: 'INACTIVE' as MissionStatus,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!creating && data?.data?.mission) {
      const m = data.data.mission;
      setForm({
        category: m.category,
        title: m.title,
        publisher: m.publisher ?? '',
        oneLineDesc: m.oneLineDesc ?? '',
        description: m.description ?? '',
        imageUrls: m.imageUrls,
        missionUrl: m.missionUrl ?? '',
        rewardPoint: m.rewardPoint,
        rewardTicket: m.rewardTicket,
        ageRestriction: m.ageRestriction,
        isFirstCome: m.isFirstCome,
        limitCount: m.limitCount ?? '',
        startAt: toDateInput(m.startAt),
        endAt: toDateInput(m.endAt),
        status: m.status,
      });
    }
  }, [data, creating]);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const isClosed = form.status === 'CLOSED';

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError('미션명을 입력하세요.'); return; }
    setError('');
    const payload = {
      category: form.category,
      title: form.title,
      publisher: form.publisher || undefined,
      oneLineDesc: form.oneLineDesc || undefined,
      description: form.description || undefined,
      imageUrls: form.imageUrls,
      missionUrl: form.missionUrl || undefined,
      rewardPoint: form.rewardPoint,
      rewardTicket: form.rewardTicket,
      ageRestriction: form.ageRestriction,
      isFirstCome: form.isFirstCome,
      limitCount: form.limitCount !== '' ? Number(form.limitCount) : null,
      startAt: form.startAt || null,
      endAt: form.endAt || null,
      status: form.status,
    };
    try {
      if (creating) {
        await createMutation.mutateAsync(payload);
      } else {
        await updateMutation.mutateAsync(payload);
      }
      router.push('/admin/missions');
    } catch {
      setError('처리 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async () => {
    if (!confirm('미션을 삭제하시겠습니까?')) return;
    try {
      await deleteMutation.mutateAsync(missionId);
      router.push('/admin/missions');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '';
      setError(msg.includes('참여자') ? '참여자가 있는 미션은 삭제할 수 없습니다.' : '삭제 중 오류가 발생했습니다.');
    }
  };

  const participants = data?.data?.participants ?? [];
  const participantTotal = data?.data?.participantTotal ?? 0;
  const successTotalFmt = data?.data?.successTotalFmt ?? '0';
  const totalPages = Math.max(1, Math.ceil(participantTotal / 10));

  if (!creating && isLoading) {
    return (
      <div className="max-w-3xl space-y-4 animate-pulse">
        <div className="h-8 w-40 bg-gray-100 rounded" />
        <div className="h-64 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">{creating ? '미션등록' : '미션수정'}</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-6">
        {/* 이미지 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">사진등록</label>
          <ImageUploader
            folder="missions"
            images={form.imageUrls}
            maxCount={10}
            onChange={(urls) => set('imageUrls', urls)}
          />
        </div>

        <hr className="border-gray-100" />

        {/* 기본 정보 */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">제목</label>
            <input
              type="text"
              value={form.title}
              disabled={isClosed}
              onChange={(e) => set('title', e.target.value)}
              className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">카테고리</label>
              <select
                value={form.category}
                disabled={isClosed}
                onChange={(e) => set('category', e.target.value as MissionCategory)}
                className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none disabled:bg-gray-50 disabled:text-gray-400"
              >
                {(Object.entries(CATEGORY_LABEL) as [MissionCategory, string][]).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">발주처</label>
              <input
                type="text"
                value={form.publisher}
                disabled={isClosed}
                onChange={(e) => set('publisher', e.target.value)}
                placeholder="예: 배달의민족"
                className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">한줄설명</label>
            <input
              type="text"
              value={form.oneLineDesc}
              disabled={isClosed}
              onChange={(e) => set('oneLineDesc', e.target.value)}
              className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">상세설명</label>
            <textarea
              value={form.description}
              disabled={isClosed}
              onChange={(e) => set('description', e.target.value)}
              rows={5}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:border-gray-400 disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">미션 URL</label>
            <input
              type="text"
              value={form.missionUrl}
              disabled={isClosed}
              onChange={(e) => set('missionUrl', e.target.value)}
              placeholder="https://"
              className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* 기간 / 보상 / 상태 */}
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">진행기간</label>
            <div className="space-y-1.5">
              <input
                type="date"
                value={form.startAt}
                disabled={isClosed}
                onChange={(e) => set('startAt', e.target.value)}
                className="w-full h-9 px-2 border border-gray-200 rounded-lg text-xs focus:outline-none disabled:bg-gray-50 disabled:text-gray-300"
              />
              <div className="flex items-center gap-1">
                <span className="text-gray-400 text-xs flex-shrink-0">~</span>
                <input
                  type="date"
                  value={form.endAt}
                  disabled={isClosed}
                  onChange={(e) => set('endAt', e.target.value)}
                  className="flex-1 h-9 px-2 border border-gray-200 rounded-lg text-xs focus:outline-none disabled:bg-gray-50 disabled:text-gray-300"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">지급 보상</label>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-12 flex-shrink-0">포인트</span>
                <input
                  type="number" min={0}
                  value={form.rewardPoint}
                  disabled={isClosed}
                  onChange={(e) => set('rewardPoint', Number(e.target.value))}
                  className="flex-1 h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-12 flex-shrink-0">응모권</span>
                <input
                  type="number" min={0}
                  value={form.rewardTicket}
                  disabled={isClosed}
                  onChange={(e) => set('rewardTicket', Number(e.target.value))}
                  className="flex-1 h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">상태변경</label>
            <div className="space-y-2">
              {(['ACTIVE', 'INACTIVE', 'CLOSED'] as MissionStatus[]).map((s) => (
                <label key={s} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio" name="status" value={s}
                    checked={form.status === s}
                    disabled={s === 'CLOSED' && !isClosed}
                    onChange={() => set('status', s)}
                    className="accent-gray-800"
                  />
                  <span className={`text-sm ${s === 'CLOSED' ? 'text-red-400' : 'text-gray-700'}`}>
                    {STATUS_LABEL[s]}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* 옵션 */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">선착순 설정</label>
            <label className="flex items-center gap-2 cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={form.isFirstCome}
                disabled={isClosed}
                onChange={(e) => set('isFirstCome', e.target.checked)}
                className="w-4 h-4 accent-gray-600"
              />
              <span className="text-sm text-gray-700">선착순 미션</span>
            </label>
            {form.isFirstCome && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 flex-shrink-0">제한인원</span>
                <input
                  type="number" min={1}
                  value={form.limitCount}
                  disabled={isClosed}
                  onChange={(e) => set('limitCount', e.target.value)}
                  placeholder="1000000"
                  className="flex-1 h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">기타 설정</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.ageRestriction}
                disabled={isClosed}
                onChange={(e) => set('ageRestriction', e.target.checked)}
                className="w-4 h-4 accent-gray-600"
              />
              <span className="text-sm text-gray-700">만 19세 미만 참여 제한</span>
            </label>
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      {/* 참여자 목록 (수정 모드만) */}
      {!creating && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-800">미션 참여</h2>
            <span className="text-sm text-gray-500">
              성공 횟수 <strong className="text-gray-800">{successTotalFmt}</strong>
            </span>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  {['이름', '휴대폰번호', '보유포인트', '참여응모수', '가입일', '로그인수단', '성공여부'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {participants.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-400">참여 내역이 없습니다.</td></tr>
                ) : (
                  participants.map((p) => (
                    <tr key={p.id} className="border-b border-gray-100">
                      <td className="px-4 py-3 text-gray-700">{p.name}</td>
                      <td className="px-4 py-3 text-gray-500">{p.phone ?? '-'}</td>
                      <td className="px-4 py-3 text-gray-500">{p.point.toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-500">{p.entryCount}</td>
                      <td className="px-4 py-3 text-gray-400">{fmtDate(p.joinedAt)}</td>
                      <td className="px-4 py-3 text-gray-500">{p.loginType}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium ${p.success ? 'text-blue-600' : 'text-red-400'}`}>
                          {p.success ? '성공' : '실패'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputSearch}
                onChange={(e) => setInputSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { setParticipantSearch(inputSearch); setParticipantPage(1); } }}
                placeholder="이름으로 검색"
                className="h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none w-36"
              />
              <button
                onClick={() => { setParticipantSearch(inputSearch); setParticipantPage(1); }}
                className="px-4 py-2 bg-[#1C2536] text-white text-sm rounded-lg"
              >
                검색
              </button>
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setParticipantPage(p)}
                  className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${p === participantPage ? 'bg-[#1C2536] text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 액션 버튼 */}
      <div className="flex justify-between mt-6">
        <div>
          {!creating && (
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="px-5 py-2.5 border border-red-200 text-red-500 rounded-lg text-sm hover:bg-red-50 transition-colors"
            >
              삭제
            </button>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/admin/missions')}
            className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={createMutation.isPending || updateMutation.isPending}
            className="px-6 py-2.5 bg-[#1C2536] text-white rounded-lg text-sm font-semibold disabled:opacity-60 hover:bg-[#2a3548] transition-colors"
          >
            {createMutation.isPending || updateMutation.isPending ? '처리 중...' : creating ? '등록하기' : '저장하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
