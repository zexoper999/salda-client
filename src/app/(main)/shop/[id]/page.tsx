'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import { useProductDetail, usePurchaseProduct } from '@/hooks/useShop';
import { useAuthStore } from '@/store/useAuthStore';

type View = 'detail' | 'checkout' | 'success';

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
    <div className="w-5 h-5 rounded-full flex items-center justify-center font-black text-white text-[10px] bg-amber-400">
      P
    </div>
  );
}

// 전화번호에서 숫자만 추출
function normalizePhone(value: string) {
  return value.replace(/\D/g, '');
}

export default function ShopDetailPage() {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const router = useRouter();

  const { user } = useAuthStore();
  const { data, isLoading } = useProductDetail(productId);
  const purchaseMutation = usePurchaseProduct(productId);

  const [view, setView] = useState<View>('detail');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [phoneError, setPhoneError] = useState('');

  const product = data?.data;

  if (isLoading || !product) {
    return (
      <div className="min-h-dvh bg-white">
        <PageHeader title="상품 상세" />
        <div className="p-5 space-y-4 animate-pulse">
          <div className="h-[240px] bg-[var(--color-surface)] rounded-2xl" />
          <div className="h-6 bg-[var(--color-surface)] rounded w-2/3" />
          <div className="h-4 bg-[var(--color-surface)] rounded w-1/3" />
        </div>
      </div>
    );
  }

  const myPoint = user?.point ?? 0;
  const canBuy = myPoint >= product.price && !product.isSoldOut;
  const afterPoint = myPoint - product.price;

  // ── 결제정보 입력 → 구매 처리 ──────────────────────────────
  const handlePurchase = async () => {
    const normalized = normalizePhone(phone);
    if (!/^01[0-9]{8,9}$/.test(normalized)) {
      setPhoneError('올바른 휴대폰 번호를 입력해주세요. (예: 01012345678)');
      return;
    }
    setPhoneError('');
    try {
      await purchaseMutation.mutateAsync(normalized);
      setView('success');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setPhoneError(msg ?? '구매 중 오류가 발생했습니다.');
    }
  };

  // ── 구매 완료 화면 ─────────────────────────────────────────
  if (view === 'success') {
    return (
      <div className="min-h-dvh bg-white flex flex-col items-center justify-center px-8 text-center">
        <div className="w-20 h-20 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mb-6">
          <span className="text-4xl">🎁</span>
        </div>
        <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">구매 완료!</h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-1">
          {product.name}
        </p>
        <p className="text-sm text-[var(--color-text-secondary)] mb-8">
          <span className="font-semibold text-[var(--color-text-primary)]">{phone}</span>으로
          기프티콘이 발송됩니다.
        </p>
        <div className="bg-[var(--color-surface)] rounded-xl p-4 w-full mb-8 text-sm">
          <div className="flex justify-between mb-2">
            <span className="text-[var(--color-text-secondary)]">사용 포인트</span>
            <span className="font-bold text-[var(--color-primary)]">-{product.price.toLocaleString()}P</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--color-text-secondary)]">잔여 포인트</span>
            <span className="font-bold">{afterPoint.toLocaleString()}P</span>
          </div>
        </div>
        <button
          onClick={() => router.push('/shop')}
          className="w-full h-14 rounded-full font-bold text-base text-white"
          style={{ background: 'var(--color-primary)' }}
        >
          쇼핑 계속하기
        </button>
      </div>
    );
  }

  // ── 결제정보 입력 화면 ─────────────────────────────────────
  if (view === 'checkout') {
    return (
      <div className="min-h-dvh bg-white">
        <PageHeader title="" onBack={() => setView('detail')} />

        <div className="px-5 pt-4 pb-32">
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] leading-snug mb-6">
            {product.name}을<br />구매합니다.
          </h1>

          {/* 상품 요약 */}
          <div className="flex items-center gap-3 p-3 border border-[var(--color-border)] rounded-xl mb-6">
            <div className="w-16 h-16 rounded-lg bg-amber-50 overflow-hidden flex-shrink-0">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-amber-100 to-amber-200" />
              )}
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-secondary)]">{CATEGORY_KO[product.category]}</p>
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">{product.name}</p>
              <div className="flex items-center gap-1 mt-1">
                <PointBadge />
                <span className="text-sm font-bold">{product.price.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* 휴대폰 번호 입력 */}
          <div className="mb-4">
            <label className="text-sm font-semibold block mb-2">
              기프티콘을 받으실 휴대폰 번호
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setPhoneError('');
              }}
              placeholder="01012345678"
              className="w-full h-12 border border-[var(--color-border)] rounded-xl px-4 text-sm focus:outline-none focus:border-[var(--color-primary)]"
            />
            {phoneError && (
              <p className="text-xs text-red-500 mt-1.5">{phoneError}</p>
            )}
          </div>

          {/* 포인트 정보 */}
          <div className="space-y-2.5 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--color-text-secondary)]">결제 예정 포인트</span>
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-[var(--color-primary)]">
                  {product.price.toLocaleString()}
                </span>
                <PointBadge />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--color-text-secondary)]">결제 후 잔여 포인트</span>
              <div className="flex items-center gap-1">
                <span className={`text-sm font-bold ${afterPoint < 0 ? 'text-red-500' : ''}`}>
                  {afterPoint.toLocaleString()}
                </span>
                <PointBadge />
              </div>
            </div>
          </div>

          {/* 환불 불가 안내 */}
          <p className="text-xs text-red-500 text-center leading-relaxed">
            기프티콘을 발송한 후에는 포인트 환불이 불가하니,
            <br />
            휴대폰번호를 꼭 확인하신 후 발송하세요
          </p>
        </div>

        {/* 구매하기 버튼 */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-5 pb-8 pt-4 bg-white">
          <button
            onClick={handlePurchase}
            disabled={purchaseMutation.isPending || !canBuy}
            className="w-full h-14 rounded-full font-bold text-base text-white disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'var(--color-primary)' }}
          >
            {purchaseMutation.isPending ? '처리 중...' : canBuy ? '구매하기' : '구매가능 포인트가 부족합니다'}
          </button>
        </div>
      </div>
    );
  }

  // ── 상품 상세 화면 ─────────────────────────────────────────
  return (
    <div className="min-h-dvh bg-white">
      <PageHeader title="상품 상세" />

      {/* 상품 이미지 */}
      <div className="relative h-[240px] bg-amber-50 flex items-center justify-center">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-100 to-amber-200" />
        )}
        {product.isSoldOut && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-base font-bold bg-black/60 px-4 py-2 rounded-full">
              품절
            </span>
          </div>
        )}
      </div>

      <div className="p-5 pb-32 space-y-5">
        {/* 상품 정보 */}
        <div>
          <p className="text-sm text-[var(--color-text-secondary)]">{CATEGORY_KO[product.category]}</p>
          <h1 className="text-xl font-bold text-[var(--color-text-primary)] mt-0.5">{product.name}</h1>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-sm text-[var(--color-text-secondary)]">포인트</span>
            <div className="flex items-center gap-1 ml-auto">
              <span className="text-2xl font-black text-[var(--color-text-primary)]">
                {product.price.toLocaleString()}
              </span>
              <PointBadge />
            </div>
          </div>
        </div>

        {/* 상품 설명 */}
        {product.description && (
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            {product.description}
          </p>
        )}

        {/* 포인트 부족 안내 */}
        {!canBuy && !product.isSoldOut && (
          <div className="bg-red-50 rounded-xl p-4 text-sm text-red-500 text-center">
            포인트가 부족합니다.
            <br />
            보유 {myPoint.toLocaleString()}P · 필요 {product.price.toLocaleString()}P
          </div>
        )}

        {/* 유의사항 */}
        <div className="bg-[var(--color-surface)] rounded-xl p-4 text-xs text-[var(--color-text-secondary)] space-y-1.5">
          <p>• 구매 후 환불이 불가합니다.</p>
          <p>• 기프티콘은 구매 시 입력한 휴대폰 번호로 발송됩니다.</p>
          <p>• 발송까지 최대 24시간이 소요될 수 있습니다.</p>
        </div>
      </div>

      {/* 결제정보입력 버튼 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-5 pb-8 pt-4 bg-white">
        <button
          onClick={() => setView('checkout')}
          disabled={!canBuy}
          className="w-full h-14 rounded-full font-bold text-base text-white disabled:bg-[var(--color-text-secondary)] disabled:cursor-not-allowed"
          style={canBuy ? { background: 'var(--color-primary)' } : {}}
        >
          {product.isSoldOut ? '품절' : canBuy ? '결제정보입력' : '구매가능 포인트가 부족합니다'}
        </button>
      </div>
    </div>
  );
}
