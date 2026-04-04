'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import { useSubscriptionDetail, useEnterSubscription } from '@/hooks/useSubscriptions';
import { useAuthStore } from '@/store/useAuthStore';

export default function SubscriptionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const subscriptionId = Number(id);
  const { user } = useAuthStore();

  const { data, isLoading } = useSubscriptionDetail(subscriptionId);
  const enterMutation = useEnterSubscription(subscriptionId);

  const [ticketInput, setTicketInput] = useState(1);
  const [showModal, setShowModal] = useState(false);

  const sub = data?.data;

  if (isLoading || !sub) {
    return (
      <div className="min-h-dvh bg-white">
        <PageHeader title="청약 상세" />
        <div className="p-5 space-y-4">
          <div className="h-[220px] bg-[var(--color-surface)] rounded-2xl animate-pulse" />
          <div className="h-6 bg-[var(--color-surface)] rounded animate-pulse w-3/4" />
          <div className="h-4 bg-[var(--color-surface)] rounded animate-pulse w-1/2" />
        </div>
      </div>
    );
  }

  const isClosed = sub.status === 'CLOSED';

  const handleEnter = async () => {
    if (ticketInput < 1 || ticketInput > (user?.ticket ?? 0)) return;
    try {
      await enterMutation.mutateAsync(ticketInput);
      setShowModal(false);
      alert(`응모 완료! 응모권 ${ticketInput}장을 사용했습니다.`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      alert(msg ?? '응모 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-dvh bg-white">
      <PageHeader title="청약 상세" />

      {/* 이미지 */}
      <div className="relative h-[220px] bg-gray-200">
        {sub.imageUrl ? (
          <img src={sub.imageUrl} alt={sub.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-200 to-blue-400" />
        )}
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute bottom-4 left-4">
          <span className="bg-white/90 text-[var(--color-primary)] text-xs font-bold px-2.5 py-1 rounded-full">
            {sub.type === 'JEONSE' ? '전세청약' : '차량청약'}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* 제목 + 상태 */}
        <div>
          <div className="flex items-center gap-2 mb-1">
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

        {/* 내 점유율 (polling) */}
        <div className="bg-[var(--color-primary-light)] rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[var(--color-primary)]">내 참여율</span>
            <span className="text-xl font-black text-[var(--color-primary)]">
              {sub.myEntryRate.toFixed(4)}%
            </span>
          </div>
          <div className="w-full h-2 bg-white rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(sub.myEntryRate, 100)}%`,
                background: 'var(--color-primary)',
              }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
            <span>내 응모권: {sub.myTickets}장</span>
            <span>전체 응모권: {sub.totalTickets.toLocaleString()}장</span>
          </div>
        </div>

        {/* 청약 정보 */}
        <div className="space-y-2">
          <InfoRow label="보증금" value={`${sub.deposit.toLocaleString()}원`} />
          <InfoRow label="응모 기간" value={`${fmtDate(sub.startAt)} ~ ${fmtDate(sub.endAt)}`} />
        </div>

        {/* 상세 설명 */}
        {sub.description && (
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-2">상세 설명</h2>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-line">
              {sub.description}
            </p>
          </div>
        )}
      </div>

      {/* 응모 버튼 */}
      {!isClosed && (
        <div className="fixed bottom-[60px] left-1/2 -translate-x-1/2 w-full max-w-[430px] px-5 pb-4 bg-white border-t border-[var(--color-border)]">
          <button
            onClick={() => setShowModal(true)}
            className="w-full h-14 rounded-full font-bold text-base text-white mt-3"
            style={{ background: 'var(--color-primary)' }}
          >
            응모하기
          </button>
        </div>
      )}

      {/* 응모 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="w-full max-w-[430px] bg-white rounded-t-3xl p-6">
            <h2 className="text-lg font-bold mb-1">응모권 사용</h2>
            <p className="text-sm text-[var(--color-text-secondary)] mb-5">
              보유 응모권: <strong>{user?.ticket ?? 0}장</strong>
            </p>
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setTicketInput((v) => Math.max(1, v - 1))}
                className="w-10 h-10 rounded-full border border-[var(--color-border)] text-xl font-bold flex items-center justify-center"
              >
                −
              </button>
              <input
                type="number"
                min={1}
                max={user?.ticket ?? 1}
                value={ticketInput}
                onChange={(e) => setTicketInput(Number(e.target.value))}
                className="flex-1 h-10 text-center text-lg font-bold border border-[var(--color-border)] rounded-xl"
              />
              <button
                onClick={() => setTicketInput((v) => Math.min(user?.ticket ?? 1, v + 1))}
                className="w-10 h-10 rounded-full border border-[var(--color-border)] text-xl font-bold flex items-center justify-center"
              >
                ＋
              </button>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 h-12 rounded-full border border-[var(--color-border)] text-sm font-medium"
              >
                취소
              </button>
              <button
                onClick={handleEnter}
                disabled={enterMutation.isPending}
                className="flex-1 h-12 rounded-full text-white font-bold text-sm"
                style={{ background: 'var(--color-primary)' }}
              >
                {enterMutation.isPending ? '처리 중...' : `${ticketInput}장으로 응모`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; style: string }> = {
    ONGOING: { label: '응모진행중', style: 'bg-green-100 text-green-700' },
    CLOSING_SOON: { label: '마감임박', style: 'bg-red-100 text-red-700' },
    CLOSED: { label: '응모마감', style: 'bg-gray-100 text-gray-500' },
  };
  const { label, style } = map[status] ?? map.ONGOING;
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${style}`}>
      {label}
    </span>
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
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}
