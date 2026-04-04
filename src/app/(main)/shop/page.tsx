'use client';

import { useState } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/layout/PageHeader';
import { useProducts } from '@/hooks/useShop';
import { useAuthStore } from '@/store/useAuthStore';
import type { ProductCategory } from '@/types';

type TabKey = 'ALL' | ProductCategory;

const TABS: { key: TabKey; label: string }[] = [
  { key: 'ALL', label: '전체' },
  { key: 'GIFT_CARD', label: '상품권' },
  { key: 'CONVENIENCE', label: '편의점' },
  { key: 'CAFE', label: '카페' },
  { key: 'BURGER_PIZZA', label: '햄버거/피자' },
  { key: 'GAS', label: '주유권' },
  { key: 'DINING', label: '외식' },
];

export default function ShopPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('ALL');
  const { user } = useAuthStore();

  const { data, isLoading } = useProducts(activeTab === 'ALL' ? undefined : activeTab);
  const products = data?.data ?? [];

  return (
    <div className="min-h-dvh bg-white">
      <PageHeader showBack={false} />

      <div className="px-5 pt-5 pb-4">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] leading-snug">
          포인트로 시작하는
          <br />
          알뜰한 <span className="text-[var(--color-primary)]">쇼핑</span>
        </h1>
      </div>

      {/* 카테고리 탭 */}
      <div className="sticky top-0 bg-white z-30 border-b border-[var(--color-border)]">
        <div className="flex items-end justify-between px-5">
          <div className="flex gap-4 overflow-x-auto scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`pb-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors flex-shrink-0 ${
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
      </div>

      {/* 상품 수 + 보유 포인트 */}
      <div className="flex items-center justify-between px-5 py-3">
        <p className="text-sm text-[var(--color-text-secondary)]">
          총{' '}
          <span className="text-[var(--color-primary)] font-semibold">{products.length}개</span>의
          상품이 있습니다.
        </p>
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold text-[var(--color-text-primary)]">
            {(user?.point ?? 0).toLocaleString()}
          </span>
          <PointBadge />
        </div>
      </div>

      {/* 상품 그리드 */}
      <div className="px-5 pb-6">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-[190px] bg-[var(--color-surface)] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center text-[var(--color-text-secondary)] text-sm">
            상품을 준비 중입니다.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {products.map((product) => (
              <Link key={product.id} href={`/shop/${product.id}`}>
                <div className="rounded-xl overflow-hidden border border-[var(--color-border)]">
                  <div className="h-[120px] bg-amber-50">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-amber-100 to-amber-200" />
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-[var(--color-text-secondary)] truncate">
                      {CATEGORY_KO[product.category]}
                    </p>
                    <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate mt-0.5">
                      {product.name}
                    </p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <PointBadge />
                      <span className="text-sm font-bold">{product.price.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const CATEGORY_KO: Record<string, string> = {
  GIFT_CARD: '상품권',
  CAFE: '카페',
  CONVENIENCE: '편의점',
  BURGER_PIZZA: '햄버거/피자',
  GAS: '주유권',
  DINING: '외식',
};

function PointBadge() {
  return (
    <div className="w-4 h-4 rounded-full flex items-center justify-center font-black text-white text-[9px] bg-amber-400">
      P
    </div>
  );
}
