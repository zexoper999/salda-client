'use client';

import { useState } from 'react';
import SubscriptionCard from '@/components/subscription/SubscriptionCard';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import type { SubscriptionType } from '@/types';

type TabType = SubscriptionType | 'ALL';

const TABS: { key: TabType; label: string }[] = [
  { key: 'ALL', label: '전체' },
  { key: 'JEONSE', label: '전세청약' },
  { key: 'VEHICLE', label: '차량청약' },
];

export default function SubscriptionsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('ALL');

  const { data, isLoading } = useSubscriptions(
    activeTab === 'ALL' ? undefined : activeTab,
  );
  const subscriptions = data?.data?.subscriptions ?? [];

  return (
    <div className="min-h-dvh bg-white">
      <div className="px-5 pt-5 pb-4">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] leading-snug">
          내 꿈을 이뤄줄<br />
          <span className="text-[var(--color-primary)]">청약응모</span>를 시작하세요.
        </h1>
      </div>

      {/* 탭 */}
      <div className="sticky top-0 bg-white z-30 px-5 border-b border-[var(--color-border)]">
        <div className="flex gap-5">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                  : 'border-transparent text-[var(--color-text-secondary)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 진행중 청약 카운트 */}
      <div className="px-5 py-3 text-sm text-[var(--color-text-secondary)]">
        진행중 청약{' '}
        <span className="text-[var(--color-primary)] font-semibold">{subscriptions.length}개</span>
      </div>

      {/* 카드 리스트 */}
      <div className="px-5 pb-6 space-y-4">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-[360px] bg-[var(--color-surface)] rounded-2xl animate-pulse" />
            ))
          : subscriptions.map((sub) => (
              <SubscriptionCard key={sub.id} subscription={sub} />
            ))}
        {!isLoading && subscriptions.length === 0 && (
          <div className="py-20 text-center text-[var(--color-text-secondary)] text-sm">
            진행 중인 청약이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
