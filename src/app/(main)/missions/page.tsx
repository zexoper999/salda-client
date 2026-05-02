'use client';

import Link from 'next/link';
import PageHeader from '@/components/layout/PageHeader';
import { useMissions, useFirstComeMissions } from '@/hooks/useMissions';

const CATEGORY_LABEL: Record<string, string> = {
  SNS_SUBSCRIBE: 'SNS 구독하면',
  PAGE_VISIT: '페이지 방문 시',
  TAG_FIND: '관련 태그 찾기',
};

function RewardText({ point, ticket }: { point: number; ticket: number }) {
  const parts = [];
  if (ticket > 0) parts.push('응모권조각');
  if (point > 0) parts.push(`+${point}P`);
  return <span>{parts.join(' ')}</span>;
}

export default function MissionsPage() {
  const { data: allData, isLoading: allLoading } = useMissions();
  const { data: firstData } = useFirstComeMissions();

  const allMissions = allData?.data ?? [];
  const firstComeMissions = firstData?.data ?? [];

  return (
    <div className="min-h-dvh bg-white">
      <PageHeader showBack={false} />

      <div className="px-5 pt-5 pb-4">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] leading-snug">
          생활에 혜택을 더하는
          <br />
          <span className="text-[var(--color-primary)]">미션</span> 진행하기
        </h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          총{' '}
          <span className="text-[var(--color-primary)] font-semibold">{allMissions.length}개</span>의
          미션이 있습니다.
        </p>
      </div>

      {/* 오늘의 선착순 미션 */}
      {firstComeMissions.length > 0 && (
        <section className="mb-6">
          <h2 className="px-5 text-base font-bold text-[var(--color-text-primary)] mb-3">
            오늘의 선착순 미션
          </h2>
          <div className="flex gap-3 px-5 overflow-x-auto scrollbar-hide pb-1">
            {firstComeMissions.map((m) => (
              <Link key={m.id} href={`/missions/${m.id}`} className="flex-shrink-0 w-[100px]">
                <div className="h-[100px] bg-[var(--color-surface)] rounded-xl overflow-hidden mb-2">
                  {m.imageUrls?.[0] ? (
                    <img src={m.imageUrls[0]} alt={m.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200" />
                  )}
                </div>
                <p className="text-[10px] text-[var(--color-text-secondary)]">
                  {CATEGORY_LABEL[m.category]}
                </p>
                <p className="text-xs font-semibold text-[var(--color-text-primary)] line-clamp-2">
                  <RewardText point={m.rewardPoint} ticket={m.rewardTicket} />
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 미션 모아보기 */}
      <section className="px-5 pb-6">
        <h2 className="text-base font-bold text-[var(--color-text-primary)] mb-3">미션 모아보기</h2>

        {allLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-[var(--color-surface)] rounded-xl animate-pulse mb-3" />
            ))
          : allMissions.map((m) => (
              <Link key={m.id} href={`/missions/${m.id}`}>
                <div className="flex items-center gap-3 py-3.5 border-b border-[var(--color-border)]">
                  {/* 썸네일 */}
                  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-[var(--color-surface)]">
                    {m.imageUrls?.[0] ? (
                      <img src={m.imageUrls[0]} alt={m.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
                    )}
                  </div>
                  {/* 정보 */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      {CATEGORY_LABEL[m.category]}
                    </p>
                    <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                      <RewardText point={m.rewardPoint} ticket={m.rewardTicket} /> 획득
                    </p>
                    {m.completedToday && (
                      <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                        오늘 완료
                      </span>
                    )}
                  </div>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M6 4L10 8L6 12"
                      stroke="#9CA3AF"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </Link>
            ))}

        {!allLoading && allMissions.length === 0 && (
          <div className="py-20 text-center text-[var(--color-text-secondary)] text-sm">
            현재 진행 중인 미션이 없습니다.
          </div>
        )}
      </section>
    </div>
  );
}
