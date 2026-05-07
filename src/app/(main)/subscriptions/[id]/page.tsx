'use client';

import { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSubscriptionDetail, useSetSubscription } from '@/hooks/useSubscriptions';
import { useToastStore } from '@/store/useToastStore';

export default function SubscriptionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const subscriptionId = Number(id);
  const router = useRouter();
  const { show } = useToastStore();

  const { data, isLoading } = useSubscriptionDetail(subscriptionId);
  const setMutation = useSetSubscription();

  const [currentImage, setCurrentImage] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const sub = data?.data;

  if (isLoading || !sub) {
    return (
      <div className="min-h-dvh bg-white">
        <div className="h-[320px] bg-[var(--color-surface)] animate-pulse" />
        <div className="p-5 space-y-4">
          <div className="h-6 bg-[var(--color-surface)] rounded animate-pulse w-3/4" />
          <div className="h-4 bg-[var(--color-surface)] rounded animate-pulse w-1/2" />
        </div>
      </div>
    );
  }

  const isClosed = sub.status === 'CLOSED';
  const isMine = sub.isMySubscription;
  const images = sub.imageUrls?.length ? sub.imageUrls : [];
  const currentPieces = sub.myProgress?.currentPieces ?? 0;

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const idx = Math.round(scrollRef.current.scrollLeft / scrollRef.current.clientWidth);
    setCurrentImage(idx);
  };

  const handleSetSubscription = async () => {
    try {
      await setMutation.mutateAsync(subscriptionId);
      show('success', '청약이 설정되었습니다.');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      show('error', msg ?? '청약 설정 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-dvh bg-white">
      {/* 이미지 캐러셀 */}
      <div className="relative h-[320px] bg-gray-200 overflow-hidden">
        {images.length > 0 ? (
          <div
            ref={scrollRef}
            className="flex h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide"
            onScroll={handleScroll}
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {images.map((url, i) => (
              <div key={i} className="snap-start shrink-0 w-full h-full">
                <img src={url} alt={`${sub.title} ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-200 to-blue-400" />
        )}

        {/* 뒤로가기 */}
        <button
          onClick={() => router.back()}
          className="absolute top-12 left-4 w-9 h-9 rounded-full bg-black/40 flex items-center justify-center"
          aria-label="뒤로가기"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M11 4L6 9L11 14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* 이미지 dot indicator */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-200"
                style={{
                  width: i === currentImage ? 16 : 6,
                  height: 6,
                  background: i === currentImage ? 'white' : 'rgba(255,255,255,0.5)',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* 컨텐츠 */}
      <div className="p-5 space-y-5 pb-28">
        {/* 타입 + 제목 */}
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs text-[var(--color-primary)] font-semibold">
              {sub.type === 'JEONSE' ? '전세청약' : '차량청약'}
            </span>
            <StatusBadge status={sub.status} />
            {sub.bonusIncluded && (
              <span className="text-[11px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                보너스 응모 포함
              </span>
            )}
          </div>
          <h1 className="text-xl font-bold text-[var(--color-text-primary)]">{sub.title}</h1>
          {sub.oneLineDesc && (
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{sub.oneLineDesc}</p>
          )}
        </div>

        {/* 내 참여 점유율 */}
        <div className="bg-[var(--color-primary-light)] rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[var(--color-primary)]">내 참여 점유율</span>
            <span className="text-xl font-black text-[var(--color-primary)]">
              {sub.myEntryRate.toFixed(4)}%
            </span>
          </div>
          <div className="w-full h-2 bg-white rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(sub.myEntryRate, 100)}%`, background: 'var(--color-primary)' }}
            />
          </div>
          <div className="flex justify-between text-xs text-[var(--color-text-secondary)]">
            <span>내 응모권: {sub.myTickets}개</span>
            <span>전체 응모권: {sub.totalTickets.toLocaleString()}개</span>
          </div>
        </div>

        {/* 내 미션 진행 현황 */}
        {isMine && (
          <div className="bg-[var(--color-surface)] rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--color-text-secondary)]">조각 진행 (내 청약)</span>
              <span className="font-bold text-[var(--color-text-primary)]">
                {currentPieces}
                <span className="text-[var(--color-text-secondary)] font-normal">/10</span>
              </span>
            </div>
            <div className="w-full h-2.5 bg-white rounded-full overflow-hidden border border-[var(--color-border)]">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${(currentPieces / 10) * 100}%`, background: 'var(--color-primary)' }}
              />
            </div>
            <p className="text-xs text-[var(--color-text-secondary)]">
              미션 <strong className="text-[var(--color-text-primary)]">{sub.myProgress?.missionCount ?? 0}회</strong> 완료 ·
              누적 응모권 <strong className="text-[var(--color-text-primary)]">{sub.myProgress?.totalTickets ?? 0}개</strong>
            </p>
          </div>
        )}

        {/* 청약 정보 */}
        <div className="space-y-2">
          <InfoRow label="보증금" value={`${sub.deposit.toLocaleString()}원`} />
          <InfoRow label="응모 기간" value={`${fmtDate(sub.startAt)} ~ ${fmtDate(sub.endAt)}`} />
        </div>

        {sub.description && (
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-2">상세 설명</h2>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-line">
              {sub.description}
            </p>
          </div>
        )}
      </div>

      {/* 플로팅 버튼 */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-40px)] max-w-[390px] z-40">
        {isClosed ? (
          <button
            disabled
            className="w-full h-14 rounded-full flex items-center justify-center bg-gray-200"
          >
            <span className="text-sm font-bold text-gray-500">청약마감 · 당첨자 추첨중</span>
          </button>
        ) : isMine ? (
          <button
            disabled
            className="w-full h-14 rounded-full flex items-center px-5 gap-3 shadow-lg opacity-100"
            style={{ background: 'var(--color-primary)' }}
          >
            <span className="flex-1 text-left text-sm font-bold text-white">내 청약 설정중</span>
            <div className="flex items-center justify-center h-7 px-3 bg-white/20 rounded-full">
              <span className="text-xs font-bold text-white">{currentPieces}/10</span>
            </div>
          </button>
        ) : (
          <button
            onClick={handleSetSubscription}
            disabled={setMutation.isPending}
            className="w-full h-14 rounded-full flex items-center justify-center shadow-lg disabled:opacity-50"
            style={{ background: 'var(--color-primary)' }}
          >
            <span className="text-sm font-bold text-white">
              {setMutation.isPending ? '설정 중...' : '이 청약 설정하기'}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; style: string }> = {
    ONGOING:      { label: '응모진행중', style: 'bg-green-100 text-green-700' },
    CLOSING_SOON: { label: '마감임박',   style: 'bg-red-100 text-red-700' },
    CLOSED:       { label: '응모마감',   style: 'bg-gray-100 text-gray-500' },
  };
  const { label, style } = map[status] ?? map.ONGOING;
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${style}`}>{label}</span>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[var(--color-border)]">
      <span className="text-sm text-[var(--color-text-secondary)]">{label}</span>
      <span className="text-sm font-semibold text-[var(--color-text-primary)]">{value}</span>
    </div>
  );
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
}
