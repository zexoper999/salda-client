'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import { useProductDetail, usePurchaseProduct } from '@/hooks/useShop';
import { useAuthStore } from '@/store/useAuthStore';

export default function ShopDetailPage() {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);

  const { user } = useAuthStore();
  const { data, isLoading } = useProductDetail(productId);
  const purchaseMutation = usePurchaseProduct(productId);

  const [showModal, setShowModal] = useState(false);
  const [phone, setPhone] = useState(user?.phone ?? '');

  const product = data?.data;

  if (isLoading || !product) {
    return (
      <div className="min-h-dvh bg-white">
        <PageHeader title="상품 상세" />
        <div className="p-5 space-y-4 animate-pulse">
          <div className="h-[240px] bg-[var(--color-surface)] rounded-2xl" />
          <div className="h-6 bg-[var(--color-surface)] rounded w-2/3" />
        </div>
      </div>
    );
  }

  const canBuy = (user?.point ?? 0) >= product.price;

  const handlePurchase = async () => {
    if (!phone || phone.length < 10) {
      alert('올바른 휴대폰 번호를 입력해주세요.');
      return;
    }
    try {
      await purchaseMutation.mutateAsync(phone);
      setShowModal(false);
      alert('구매 완료! 기프티콘이 발송됩니다.');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      alert(msg ?? '구매 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-dvh bg-white">
      <PageHeader title="상품 상세" />

      {/* 상품 이미지 */}
      <div className="h-[240px] bg-amber-50 flex items-center justify-center">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-100 to-amber-200" />
        )}
      </div>

      <div className="p-5 space-y-5">
        {/* 상품 정보 */}
        <div>
          <p className="text-sm text-[var(--color-text-secondary)]">{CATEGORY_KO[product.category]}</p>
          <h1 className="text-xl font-bold text-[var(--color-text-primary)] mt-0.5">{product.name}</h1>
          <div className="flex items-center gap-1.5 mt-2">
            <PointBadge />
            <span className="text-2xl font-black text-[var(--color-text-primary)]">
              {product.price.toLocaleString()}
            </span>
          </div>
        </div>

        {/* 보유 포인트 */}
        <div className="bg-[var(--color-surface)] rounded-xl p-4 flex items-center justify-between">
          <span className="text-sm text-[var(--color-text-secondary)]">내 보유 포인트</span>
          <div className="flex items-center gap-1.5">
            <span className="text-base font-bold text-[var(--color-text-primary)]">
              {(user?.point ?? 0).toLocaleString()}
            </span>
            <PointBadge />
          </div>
        </div>

        {!canBuy && (
          <p className="text-sm text-red-500 font-medium text-center">
            포인트가 부족합니다. (필요: {product.price}P / 보유: {user?.point ?? 0}P)
          </p>
        )}

        {/* 상품 설명 */}
        {product.description && (
          <div>
            <h2 className="text-sm font-semibold mb-2">상품 설명</h2>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              {product.description}
            </p>
          </div>
        )}

        {/* 안내 문구 */}
        <div className="bg-[var(--color-surface)] rounded-xl p-4 text-xs text-[var(--color-text-secondary)] space-y-1">
          <p>• 구매 후 환불이 불가합니다.</p>
          <p>• 기프티콘은 구매 시 입력한 휴대폰 번호로 발송됩니다.</p>
          <p>• 발송까지 최대 24시간이 소요될 수 있습니다.</p>
        </div>
      </div>

      {/* 구매 버튼 */}
      <div className="fixed bottom-[60px] left-1/2 -translate-x-1/2 w-full max-w-[430px] px-5 pb-4 bg-white border-t border-[var(--color-border)]">
        <button
          onClick={() => setShowModal(true)}
          disabled={!canBuy}
          className="w-full h-14 rounded-full font-bold text-base text-white mt-3 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: 'var(--color-primary)' }}
        >
          {canBuy ? `${product.price.toLocaleString()}P로 구매하기` : '포인트 부족'}
        </button>
      </div>

      {/* 구매 확인 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="w-full max-w-[430px] bg-white rounded-t-3xl p-6 space-y-4">
            <h2 className="text-lg font-bold">구매 확인</h2>
            <div className="bg-[var(--color-surface)] rounded-xl p-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">상품</span>
                <span className="font-semibold">{product.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">사용 포인트</span>
                <span className="font-bold text-[var(--color-primary)]">{product.price}P</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">잔여 포인트</span>
                <span className="font-semibold">{((user?.point ?? 0) - product.price)}P</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">기프티콘 수신 번호</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010-0000-0000"
                className="w-full h-11 border border-[var(--color-border)] rounded-xl px-3 text-sm"
              />
            </div>

            <p className="text-xs text-red-500">⚠️ 구매 후 환불이 불가합니다.</p>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 h-12 rounded-full border border-[var(--color-border)] text-sm font-medium"
              >
                취소
              </button>
              <button
                onClick={handlePurchase}
                disabled={purchaseMutation.isPending}
                className="flex-1 h-12 rounded-full text-white font-bold text-sm"
                style={{ background: 'var(--color-primary)' }}
              >
                {purchaseMutation.isPending ? '처리 중...' : '구매 확인'}
              </button>
            </div>
          </div>
        </div>
      )}
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
    <div className="w-5 h-5 rounded-full flex items-center justify-center font-black text-white text-[10px] bg-amber-400">
      P
    </div>
  );
}
