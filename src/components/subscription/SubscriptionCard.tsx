'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import type { Subscription } from '@/types';

interface SubscriptionCardProps {
  subscription: Subscription;
  compact?: boolean;
}

const TYPE_LABEL: Record<string, string> = {
  JEONSE: '전세청약',
  VEHICLE: '차량청약',
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

export default function SubscriptionCard({ subscription: sub, compact = false }: SubscriptionCardProps) {
  const images = sub.imageUrls?.length ? sub.imageUrls : [];
  const progress = sub.entryProgress;
  const hasProgress = sub.maxEntries > 0;
  const isMine = sub.isMySubscription ?? false;
  const currentPieces = sub.myProgress?.currentPieces ?? 0;
  const totalTickets = sub.myProgress?.totalTickets ?? 0;
  const myEntryRate = sub.myEntryRate ?? 0;

  if (compact) {
    return <CompactCard sub={sub} images={images} progress={progress} hasProgress={hasProgress}
      isMine={isMine} currentPieces={currentPieces} totalTickets={totalTickets} myEntryRate={myEntryRate} />;
  }

  return <FullCard sub={sub} images={images} progress={progress} hasProgress={hasProgress}
    isMine={isMine} currentPieces={currentPieces} totalTickets={totalTickets} myEntryRate={myEntryRate} />;
}

interface CardSharedProps {
  sub: Subscription;
  images: string[];
  progress: number;
  hasProgress: boolean;
  isMine: boolean;
  currentPieces: number;
  totalTickets: number;
  myEntryRate: number;
}

function CompactCard({ sub, images, progress, hasProgress, isMine, currentPieces, totalTickets, myEntryRate }: CardSharedProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const idx = Math.round(scrollRef.current.scrollLeft / scrollRef.current.clientWidth);
    setCurrentImage(idx);
  };

  return (
    <Link href={`/subscriptions/${sub.id}`} className="block w-full">
      <div className="rounded-3xl overflow-hidden shadow-md bg-white">
        {/* 이미지 캐러셀 */}
        <div className="relative h-[170px] bg-gray-200 overflow-hidden">
          {images.length > 1 ? (
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
          ) : images.length === 1 ? (
            <img src={images[0]} alt={sub.title} className="w-full h-full object-cover" />
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

          {images.length > 1 && (
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all duration-200"
                  style={{
                    width: i === currentImage ? 12 : 4,
                    height: 4,
                    background: i === currentImage ? 'white' : 'rgba(255,255,255,0.5)',
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* 본문 */}
        <div className="px-4 pt-3 pb-0">
          <span className="text-[11px] text-[var(--color-primary)] font-semibold">
            {TYPE_LABEL[sub.type]}
          </span>
          <h3 className="mt-0.5 text-sm font-bold text-[var(--color-text-primary)] leading-snug line-clamp-2">
            {sub.title}
          </h3>

          {/* 내 참여율 행 */}
          <div className="mt-1.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-[var(--color-text-secondary)]">내 참여율</span>
              {totalTickets > 0 && (
                <span
                  className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full"
                  style={{ background: 'var(--color-primary)' }}
                >
                  {totalTickets}회
                </span>
              )}
            </div>
            <span className="text-[11px] font-bold text-[var(--color-text-primary)]">
              {myEntryRate.toFixed(4)}%
            </span>
          </div>

          {/* 상세설명 2줄 */}
          {(sub.description || sub.oneLineDesc) && (
            <p className="mt-1.5 text-[11px] text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed">
              {sub.description || sub.oneLineDesc}
            </p>
          )}
        </div>

        {/* 하단 */}
        {isMine ? (
          <div
            className="mt-3 flex items-center justify-between px-4 h-11"
            style={{ background: 'var(--color-primary)' }}
          >
            <span className="text-xs font-bold text-white">내 청약 설정중</span>
            <div className="flex items-center justify-center h-6 px-2.5 bg-white/25 rounded-full">
              <span className="text-[11px] font-bold text-white">{currentPieces}/10</span>
            </div>
          </div>
        ) : (
          <div className="h-3" />
        )}
      </div>
    </Link>
  );
}

function FullCard({ sub, images, progress, hasProgress, isMine, currentPieces, totalTickets, myEntryRate }: CardSharedProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const idx = Math.round(scrollRef.current.scrollLeft / scrollRef.current.clientWidth);
    setCurrentImage(idx);
  };

  return (
    <Link href={`/subscriptions/${sub.id}`} className="block">
      <div className="rounded-2xl overflow-hidden shadow-sm border border-[var(--color-border)] bg-white">

        {/* 이미지 캐러셀 */}
        <div className="relative h-[200px] bg-gray-200 overflow-hidden">
          {images.length > 1 ? (
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
          ) : images.length === 1 ? (
            <img src={images[0]} alt={sub.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-200 to-blue-400" />
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

          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all duration-200"
                  style={{
                    width: i === currentImage ? 14 : 5,
                    height: 5,
                    background: i === currentImage ? 'white' : 'rgba(255,255,255,0.5)',
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* 본문 */}
        <div className="px-4 pt-3 pb-0">
          <span className="text-[11px] text-[var(--color-primary)] font-semibold">
            {TYPE_LABEL[sub.type]}
          </span>
          <h3 className="mt-0.5 text-[15px] font-bold text-[var(--color-text-primary)] leading-snug">
            {sub.title}
          </h3>

          {/* 내 참여율 행 */}
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--color-text-secondary)]">내 참여율</span>
              {totalTickets > 0 && (
                <span
                  className="text-[11px] font-bold text-white px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--color-primary)' }}
                >
                  {totalTickets}회
                </span>
              )}
            </div>
            <span className="text-xs font-bold text-[var(--color-text-primary)]">
              {myEntryRate.toFixed(4)}%
            </span>
          </div>

          {/* 상세설명 2줄 */}
          {(sub.description || sub.oneLineDesc) && (
            <p className="mt-2 text-sm text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed">
              {sub.description || sub.oneLineDesc}
            </p>
          )}
        </div>

        {/* 하단 — 내 청약 설정중 or 여백 */}
        {isMine ? (
          <div
            className="mt-3 flex items-center justify-between px-5 h-12"
            style={{ background: 'var(--color-primary)' }}
          >
            <span className="text-sm font-bold text-white">내 청약 설정중</span>
            <div className="flex items-center justify-center h-7 px-3 bg-white/25 rounded-full">
              <span className="text-xs font-bold text-white">{currentPieces}/10</span>
            </div>
          </div>
        ) : (
          <div className="h-4" />
        )}
      </div>
    </Link>
  );
}
