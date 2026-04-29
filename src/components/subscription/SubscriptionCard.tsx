import Link from 'next/link';
import type { Subscription } from '@/types';

interface SubscriptionCardProps {
  subscription: Subscription;
  missionCount?: number;
  compact?: boolean;
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

function ProgressCircle({ pct }: { pct: number }) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(pct, 100) / 100);
  return (
    <svg width="44" height="44" viewBox="0 0 44 44">
      <circle cx="22" cy="22" r={r} fill="rgba(0,0,0,0.35)" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
      <circle
        cx="22" cy="22" r={r}
        fill="none"
        stroke="white"
        strokeWidth="3"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 22 22)"
      />
      <text x="22" y="26" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">
        {pct}%
      </text>
    </svg>
  );
}

export default function SubscriptionCard({
  subscription: sub,
  missionCount = 0,
  compact = false,
}: SubscriptionCardProps) {
  const imageUrl = sub.imageUrls?.[0];
  const progress = sub.entryProgress;
  const hasProgress = sub.maxEntries > 0;

  if (compact) {
    return (
      <Link href={`/subscriptions/${sub.id}`} className="block w-[300px] flex-shrink-0">
        <div className="rounded-3xl overflow-hidden shadow-md bg-white">
          {/* 이미지 영역 */}
          <div className="relative h-[170px] bg-gray-200">
            {imageUrl ? (
              <img src={imageUrl} alt={sub.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-300 to-blue-500" />
            )}
            {hasProgress && (
              <>
                <div className="absolute top-3 left-3">
                  <ProgressCircle pct={Math.round(progress)} />
                </div>
                <div className="absolute top-3 right-3 bg-black/55 text-white text-[10px] font-medium px-2.5 py-1 rounded-full">
                  마감까지 {Math.round(progress)}% 진행되었습니다.
                </div>
              </>
            )}
          </div>

          {/* 컨텐츠 */}
          <div className="px-4 pt-3 pb-2">
            <span className="text-[11px] text-[var(--color-primary)] font-semibold">
              {TYPE_LABEL[sub.type]}
            </span>
            <h3 className="mt-0.5 text-sm font-bold text-[var(--color-text-primary)] leading-snug line-clamp-2">
              {sub.title}
            </h3>

            <div className="mt-1.5 flex items-center gap-2">
              <span className="text-xs text-[var(--color-text-secondary)]">내 참여율</span>
              <span className="text-xs font-semibold text-[var(--color-text-primary)]">
                {(sub as { myEntryRate?: number }).myEntryRate?.toFixed(4) ?? '0.0000'}%
              </span>
              {(sub.myEntryCount ?? 0) > 0 && (
                <span
                  className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full"
                  style={{ background: 'var(--color-primary)' }}
                >
                  {sub.myEntryCount}회
                </span>
              )}
            </div>

            {sub.oneLineDesc && (
              <p className="mt-1.5 text-xs text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed">
                {sub.oneLineDesc}
              </p>
            )}

            <div className="mt-2 pb-2">
              <span className="text-xs text-[var(--color-primary)] font-medium">자세히 보기 →</span>
            </div>
          </div>

          {/* 하단 버튼 */}
          <div
            className="mx-3 mb-3 h-11 rounded-full flex items-center px-4 gap-2"
            style={{ background: 'var(--color-primary)' }}
          >
            <span className="flex-1 text-left text-xs font-bold text-white">내 청약 설정중</span>
            <div className="flex items-center justify-center h-6 px-2.5 bg-white/20 rounded-full">
              <span className="text-[11px] font-bold text-white">{missionCount}/10</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm border border-[var(--color-border)] bg-white">
      <div className="relative h-[200px] bg-gray-200">
        {imageUrl ? (
          <img src={imageUrl} alt={sub.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-200 to-blue-400" />
        )}
        {hasProgress && (
          <>
            <div className="absolute top-3 left-3">
              <ProgressCircle pct={Math.round(progress)} />
            </div>
            <div className="absolute top-3 right-3 bg-black/60 text-white text-[10px] px-2.5 py-1 rounded-full">
              마감까지 {Math.round(progress)}% 달성
            </div>
          </>
        )}
      </div>

      <div className="p-4">
        <span className="text-xs text-[var(--color-primary)] font-semibold">
          {TYPE_LABEL[sub.type]}
        </span>
        <h3 className="mt-1 text-base font-bold text-[var(--color-text-primary)] leading-snug">
          {sub.title}
        </h3>

        {sub.oneLineDesc && (
          <p className="mt-1 text-sm text-[var(--color-text-secondary)] line-clamp-2">
            {sub.oneLineDesc}
          </p>
        )}

        {hasProgress && (
          <div className="mt-2 flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)]">
            <span>응모현황</span>
            <span className="font-semibold text-[var(--color-text-primary)]">
              {sub.totalEntryCount.toLocaleString()} / {sub.maxEntries.toLocaleString()}
            </span>
          </div>
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

        <div className="mt-3 pt-3 border-t border-[var(--color-border)] flex items-center justify-between">
          <Link
            href={`/subscriptions/${sub.id}`}
            className="flex-1 mr-3 h-10 rounded-full font-semibold text-sm flex items-center justify-center"
            style={{ background: 'var(--color-surface)', color: 'var(--color-text-secondary)' }}
          >
            내 청약 설정중
          </Link>
          <span className="text-sm font-semibold text-[var(--color-text-secondary)] whitespace-nowrap">
            {missionCount}/10
          </span>
        </div>
      </div>
    </div>
  );
}
