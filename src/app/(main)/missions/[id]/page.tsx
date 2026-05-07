'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import MissionResultSheet from '@/components/ui/MissionResultSheet';
import { useMissionDetail, useCompleteMission } from '@/hooks/useMissions';
import { useToastStore } from '@/store/useToastStore';

const CATEGORY_LABEL: Record<string, string> = {
  SNS_SUBSCRIBE: 'SNS 구독',
  PAGE_VISIT: '페이지 방문',
  TAG_FIND: '관련 태그 찾기',
};

export default function MissionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const missionId = Number(id);

  const { data, isLoading } = useMissionDetail(missionId);
  const completeMutation = useCompleteMission(missionId);
  const { show } = useToastStore();

  const [resultSheet, setResultSheet] = useState<{
    pointEarned: number;
    piecesEarned: number;
    currentPieces: number;
    totalTickets: number;
    newTicketsEarned: number;
  } | null>(null);

  const mission = data?.data;

  if (isLoading || !mission) {
    return (
      <div className="min-h-dvh bg-white">
        <PageHeader title="미션 상세" />
        <div className="p-5 space-y-4 animate-pulse">
          <div className="h-[180px] bg-[var(--color-surface)] rounded-2xl" />
          <div className="h-6 bg-[var(--color-surface)] rounded w-3/4" />
          <div className="h-4 bg-[var(--color-surface)] rounded w-1/2" />
        </div>
      </div>
    );
  }

  const isClosed = mission.status === 'CLOSED' || mission.status === 'INACTIVE';

  const handleComplete = async () => {
    if (mission.missionUrl) window.open(mission.missionUrl, '_blank');
    try {
      const res = await completeMutation.mutateAsync();
      const d = res.data;
      setResultSheet({
        pointEarned: d.pointEarned,
        piecesEarned: d.piecesEarned,
        currentPieces: d.currentPieces,
        totalTickets: d.totalTickets,
        newTicketsEarned: d.newTicketsEarned,
      });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      show('error', msg ?? '미션 처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-dvh bg-white">
      <PageHeader title="미션 상세" />

      {/* 이미지 */}
      <div className="relative h-[180px] bg-gray-100">
        {mission.imageUrls?.[0] ? (
          <img src={mission.imageUrls[0]} alt={mission.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-200" />
        )}
      </div>

      <div className="p-5 space-y-5 pb-20">
        {/* 카테고리 + 제목 */}
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs bg-[var(--color-primary-light)] text-[var(--color-primary)] font-semibold px-2.5 py-0.5 rounded-full">
              {CATEGORY_LABEL[mission.category]}
            </span>
            {mission.ageRestriction && (
              <span className="text-xs bg-red-50 text-red-600 font-semibold px-2.5 py-0.5 rounded-full">
                만 19세 이상
              </span>
            )}
            {mission.isFirstCome && (
              <span className="text-xs bg-amber-50 text-amber-700 font-semibold px-2.5 py-0.5 rounded-full">
                선착순 {mission.remainCount !== null ? `잔여 ${mission.remainCount}` : ''}
              </span>
            )}
            {mission.completedToday && (
              <span className="text-xs bg-green-50 text-green-700 font-semibold px-2.5 py-0.5 rounded-full">
                오늘 완료
              </span>
            )}
          </div>
          <h1 className="text-xl font-bold text-[var(--color-text-primary)]">{mission.title}</h1>
          {mission.publisher && (
            <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">by {mission.publisher}</p>
          )}
        </div>

        {/* 리워드 */}
        <div className="flex gap-3">
          {mission.rewardTicket > 0 && (
            <div className="flex-1 bg-[var(--color-primary-light)] rounded-xl p-3 text-center">
              <p className="text-xs text-[var(--color-primary)] mb-1">응모권 조각</p>
              <p className="text-xl font-black text-[var(--color-primary)]">+{mission.rewardTicket}장</p>
            </div>
          )}
          {mission.rewardPoint > 0 && (
            <div className="flex-1 bg-amber-50 rounded-xl p-3 text-center">
              <p className="text-xs text-amber-700 mb-1">포인트</p>
              <p className="text-xl font-black text-amber-600">+{mission.rewardPoint}P</p>
            </div>
          )}
        </div>

        {/* 상세 설명 */}
        {mission.description && (
          <div>
            <h2 className="text-sm font-semibold mb-2">미션 설명</h2>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-line">
              {mission.description}
            </p>
          </div>
        )}

        {/* 기간 */}
        {(mission as unknown as { endAt?: string }).endAt && (
          <div className="text-xs text-[var(--color-text-secondary)] border-t border-[var(--color-border)] pt-3">
            미션 기간:{' '}
            {(mission as unknown as { startAt?: string }).startAt &&
              `${fmtDate((mission as unknown as { startAt: string }).startAt)} ~ `}
            {fmtDate((mission as unknown as { endAt: string }).endAt)}
          </div>
        )}
      </div>

      {/* 미션 수행 버튼 */}
      <div className="fixed bottom-[60px] left-1/2 -translate-x-1/2 w-full max-w-[430px] px-5 pb-4 bg-white border-t border-[var(--color-border)]">
        <button
          onClick={handleComplete}
          disabled={isClosed || mission.completedToday || completeMutation.isPending}
          className="w-full h-14 rounded-full font-bold text-base text-white mt-3 disabled:opacity-50"
          style={{ background: 'var(--color-primary)' }}
        >
          {completeMutation.isPending
            ? '처리 중...'
            : mission.completedToday
              ? '오늘 이미 완료한 미션입니다'
              : isClosed
                ? '종료된 미션입니다'
                : '미션 수행하기'}
        </button>
      </div>

      {/* 미션 결과 바텀시트 */}
      <MissionResultSheet
        isOpen={resultSheet !== null}
        onClose={() => setResultSheet(null)}
        result={resultSheet}
      />
    </div>
  );
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}
