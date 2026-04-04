import Link from 'next/link';
import type { Subscription } from '@/types';

interface SubscriptionCardProps {
  subscription: Subscription;
  myTickets?: number;
  userTotalTickets?: number;
  compact?: boolean; // 홈 화면 가로 스크롤용
}

// 시간 경과율 계산 (REQ-003: 진행률 정의 확정 전 임시 사용)
function getTimeProgress(startAt: string, endAt: string): number {
  const start = new Date(startAt).getTime();
  const end = new Date(endAt).getTime();
  const now = Date.now();
  if (now <= start) return 0;
  if (now >= end) return 100;
  return Math.round(((now - start) / (end - start)) * 100);
}

function progressColor(pct: number): string {
  if (pct < 40) return '#22C55E';
  if (pct < 70) return '#F59E0B';
  return '#EF4444';
}

const TYPE_LABEL: Record<string, string> = {
  JEONSE: '전세청약',
  VEHICLE: '차량청약',
};

const STATUS_LABEL: Record<string, string> = {
  ONGOING: '응모진행중',
  CLOSING_SOON: '마감임박',
  CLOSED: '응모마감',
};

export default function SubscriptionCard({
  subscription: sub,
  myTickets = 0,
  userTotalTickets = 0,
  compact = false,
}: SubscriptionCardProps) {
  const progress = getTimeProgress(sub.startAt, sub.endAt);
  const hasEntered = myTickets > 0;

  if (compact) {
    return (
      <Link href={`/subscriptions/${sub.id}`} className="block w-[280px] flex-shrink-0">
        <div className="rounded-2xl overflow-hidden shadow-sm border border-[var(--color-border)] bg-white">
          <div className="relative h-[160px] bg-gray-200">
            {sub.imageUrl ? (
              <img src={sub.imageUrl} alt={sub.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-200 to-blue-400" />
            )}
            {/* 진행률 배지 */}
            <div
              className="absolute top-3 left-3 w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shadow"
              style={{ background: progressColor(progress) }}
            >
              {progress}%
            </div>
            <div className="absolute top-3 right-3 bg-black/60 text-white text-[10px] px-2 py-1 rounded-full">
              마감까지 {progress}% 진행
            </div>
          </div>
          <div className="p-3">
            <span className="text-[10px] text-[var(--color-primary)] font-semibold">
              {TYPE_LABEL[sub.type]}
            </span>
            <p className="text-sm font-bold text-[var(--color-text-primary)] mt-0.5 line-clamp-2">
              {sub.title}
            </p>
            <div className="mt-2 flex items-center justify-between">
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: hasEntered ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: hasEntered ? 'white' : 'var(--color-text-secondary)',
                }}
              >
                {hasEntered ? '설정중' : '설정하기'}
              </span>
              <span className="text-[10px] text-[var(--color-text-secondary)]">
                {myTickets}/{userTotalTickets}
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm border border-[var(--color-border)] bg-white">
      {/* 이미지 */}
      <div className="relative h-[200px] bg-gray-200">
        {sub.imageUrl ? (
          <img src={sub.imageUrl} alt={sub.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-200 to-blue-400" />
        )}
        <div
          className="absolute top-3 left-3 w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shadow"
          style={{ background: progressColor(progress) }}
        >
          {progress}%
        </div>
        <div className="absolute top-3 right-3 bg-black/60 text-white text-[10px] px-2.5 py-1 rounded-full">
          마감까지 {progress}% 진행되었습니다.
        </div>
      </div>

      {/* 카드 본문 */}
      <div className="p-4">
        <span className="text-xs text-[var(--color-primary)] font-semibold">
          {TYPE_LABEL[sub.type]}
        </span>
        <h3 className="mt-1 text-base font-bold text-[var(--color-text-primary)] leading-snug">
          {sub.title}
        </h3>

        {/* 참여율 행 */}
        <div className="mt-2 flex items-center gap-2">
          <span className="text-sm text-[var(--color-text-secondary)]">
            내 참여율{' '}
            <span className="font-semibold text-[var(--color-text-primary)]">
              {/* 참여율은 상세 페이지에서만 표시, 목록에선 응모 여부만 */}
              {hasEntered ? '응모 중' : '0.0000 %'}
            </span>
          </span>
          {hasEntered && (
            <span className="text-[11px] bg-[var(--color-primary-light)] text-[var(--color-primary)] font-semibold px-2 py-0.5 rounded-full">
              {myTickets}회
            </span>
          )}
        </div>

        {sub.oneLineDesc && (
          <p className="mt-2 text-sm text-[var(--color-text-secondary)] line-clamp-2">
            {sub.oneLineDesc}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between">
          <Link
            href={`/subscriptions/${sub.id}`}
            className="text-sm text-[var(--color-primary)] font-medium"
          >
            자세히 보기
          </Link>
          <span className="text-xs text-[var(--color-text-secondary)]">
            {STATUS_LABEL[sub.status]}
          </span>
        </div>

        {/* 하단 버튼 */}
        <div className="mt-3 pt-3 border-t border-[var(--color-border)] flex items-center justify-between">
          <Link
            href={`/subscriptions/${sub.id}`}
            className="flex-1 mr-3 h-10 rounded-full font-semibold text-sm flex items-center justify-center"
            style={{
              background: hasEntered ? 'var(--color-primary)' : 'var(--color-surface)',
              color: hasEntered ? 'white' : 'var(--color-text-secondary)',
            }}
          >
            {hasEntered ? '내 청약 설정중' : '내 청약 설정하기'}
          </Link>
          <span className="text-sm font-semibold text-[var(--color-text-secondary)] whitespace-nowrap">
            {myTickets}/{userTotalTickets}
          </span>
        </div>
      </div>
    </div>
  );
}
