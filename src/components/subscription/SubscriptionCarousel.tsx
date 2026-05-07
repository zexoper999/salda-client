'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import type { Subscription } from '@/types';
import SubscriptionCard from './SubscriptionCard';

const CARD_W = 280;
const GAP = 12;
const STEP = CARD_W + GAP;

interface Props {
  subscriptions: Subscription[];
}

export default function SubscriptionCarousel({ subscriptions }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const myIdx = subscriptions.findIndex((s) => s.isMySubscription);
  const initialIdx = myIdx >= 0 ? myIdx : 0;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || initialIdx === 0) return;
    el.scrollLeft = initialIdx * STEP;
    setActiveIdx(initialIdx);
  }, [initialIdx]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / STEP);
    setActiveIdx(Math.max(0, Math.min(idx, subscriptions.length - 1)));
  }, [subscriptions.length]);

  return (
    <div
      ref={scrollRef}
      className="flex overflow-x-auto scrollbar-hide"
      onScroll={handleScroll}
      style={{
        scrollSnapType: 'x mandatory',
        WebkitOverflowScrolling: 'touch',
        paddingLeft: `calc((100% - ${CARD_W}px) / 2)`,
        paddingRight: `calc((100% - ${CARD_W}px) / 2)`,
        gap: GAP,
      }}
    >
      {subscriptions.map((sub, i) => (
        <div
          key={sub.id}
          className="flex-shrink-0 transition-all duration-300 ease-out"
          style={{
            width: CARD_W,
            scrollSnapAlign: 'center',
            transform: i === activeIdx ? 'scale(1)' : 'scale(0.88)',
            opacity: i === activeIdx ? 1 : 0.7,
          }}
        >
          <SubscriptionCard subscription={sub} compact />
        </div>
      ))}
    </div>
  );
}
