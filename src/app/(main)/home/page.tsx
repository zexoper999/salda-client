'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { useProducts } from '@/hooks/useShop';
import SubscriptionCard from '@/components/subscription/SubscriptionCard';

export default function HomePage() {
  const { user } = useAuthStore();
  const { data: subData } = useSubscriptions();
  const { data: productData } = useProducts();

  const subscriptions = subData?.data?.slice(0, 5) ?? [];
  const products = productData?.data?.slice(0, 4) ?? [];

  return (
    <div className="min-h-dvh bg-white">
      {/* 헤더 */}
      <header className="flex items-center justify-between px-5 h-14 bg-white border-b border-[var(--color-border)]">
        <p className="text-base font-bold tracking-widest text-[var(--color-text-primary)]">
          SALDA <span className="text-xs font-medium text-[var(--color-text-secondary)]">살다</span>
        </p>
        <button aria-label="알림">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.37 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.64 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z"
              fill="#6B7280"
            />
          </svg>
        </button>
      </header>

      {/* 광고주 배너 (REQ-004) */}
      <div
        className="mx-4 mt-4 rounded-2xl overflow-hidden h-[120px] flex items-end p-4"
        style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)' }}
      >
        <div>
          <p className="text-white/70 text-xs mb-1">파트너십 문의</p>
          <p className="text-white text-xl font-bold">광고주를 모집합니다.</p>
        </div>
      </div>

      {/* 청약 응모하기 섹션 */}
      <section className="mt-6">
        <div className="flex items-center justify-between px-5 mb-3">
          <h2 className="text-base font-bold text-[var(--color-text-primary)]">청약 응모하기</h2>
          <Link href="/subscriptions" className="text-xs text-[var(--color-primary)]">
            전체보기
          </Link>
        </div>
        {subscriptions.length === 0 ? (
          <div className="px-5">
            <div className="h-[200px] bg-[var(--color-surface)] rounded-2xl flex items-center justify-center">
              <p className="text-sm text-[var(--color-text-secondary)]">진행 중인 청약이 없습니다</p>
            </div>
          </div>
        ) : (
          <div className="flex gap-3 px-5 overflow-x-auto scrollbar-hide pb-1">
            {subscriptions.map((sub) => (
              <SubscriptionCard
                key={sub.id}
                subscription={sub}
                myTickets={0}
                userTotalTickets={user?.ticket ?? 0}
                compact
              />
            ))}
          </div>
        )}
      </section>

      {/* 미션 바로가기 배너 */}
      <Link href="/missions" className="block mx-4 mt-5">
        <div
          className="rounded-2xl flex items-center justify-between px-5 h-[80px]"
          style={{ background: '#1C2536' }}
        >
          <div>
            <p className="text-white/60 text-xs">차곡차곡 포인트 모으기</p>
            <p className="text-white font-bold text-base mt-0.5">미션 바로가기 →</p>
          </div>
          <div className="flex gap-1">
            <PointCoin />
            <PointCoin size={32} />
          </div>
        </div>
      </Link>

      {/* 쇼핑하기 섹션 */}
      <section className="mt-6 pb-6">
        <div className="flex items-center justify-between px-5 mb-3">
          <h2 className="text-base font-bold text-[var(--color-text-primary)]">쇼핑하기</h2>
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold text-[var(--color-text-primary)]">
              {(user?.point ?? 0).toLocaleString()}
            </span>
            <PointBadge />
          </div>
        </div>
        {products.length === 0 ? (
          <div className="mx-5 h-[160px] bg-[var(--color-surface)] rounded-2xl flex items-center justify-center">
            <p className="text-sm text-[var(--color-text-secondary)]">상품을 준비 중입니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 px-5">
            {products.map((product) => (
              <Link key={product.id} href={`/shop/${product.id}`}>
                <div className="rounded-xl overflow-hidden border border-[var(--color-border)]">
                  <div className="h-[110px] bg-amber-50 flex items-center justify-center">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-amber-100 to-amber-200" />
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs text-[var(--color-text-secondary)] truncate">
                      {product.category}
                    </p>
                    <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                      {product.name}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <PointBadge small />
                      <span className="text-sm font-bold">{product.price.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        <div className="mt-4 px-5">
          <Link
            href="/shop"
            className="block w-full h-11 rounded-full border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)] flex items-center justify-center"
          >
            더보기
          </Link>
        </div>
      </section>
    </div>
  );
}

function PointCoin({ size = 28 }: { size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center font-black text-white"
      style={{ width: size, height: size, fontSize: size * 0.4, background: '#F59E0B' }}
    >
      P
    </div>
  );
}

function PointBadge({ small = false }: { small?: boolean }) {
  return (
    <div
      className={`rounded-full flex items-center justify-center font-black text-white ${small ? 'w-4 h-4 text-[9px]' : 'w-5 h-5 text-[10px]'}`}
      style={{ background: '#F59E0B' }}
    >
      P
    </div>
  );
}
