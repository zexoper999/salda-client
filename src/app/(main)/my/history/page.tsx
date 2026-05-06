'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import { useHistory, type HistoryItem } from '@/hooks/useHistory';
import { useAuthStore } from '@/store/useAuthStore';

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}. ${String(d.getMonth() + 1).padStart(2, '0')}. ${String(d.getDate()).padStart(2, '0')}`;
}

function PointBadge() {
  return (
    <div className="w-5 h-5 rounded-full flex items-center justify-center font-black text-white text-[10px] bg-amber-400">
      P
    </div>
  );
}

function TicketBadge() {
  return <span className="text-sm text-[var(--color-primary)]">◆</span>;
}

function SkeletonItem() {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)] animate-pulse">
      <div className="space-y-1.5">
        <div className="h-4 w-24 bg-gray-100 rounded" />
        <div className="h-3 w-32 bg-gray-100 rounded" />
      </div>
      <div className="h-4 w-16 bg-gray-100 rounded" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
        <span className="text-3xl text-gray-300 font-bold">!</span>
      </div>
      <p className="text-sm text-[var(--color-text-secondary)]">사용내역이 없습니다</p>
    </div>
  );
}

function HistoryRow({ item }: { item: HistoryItem }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
      <div>
        <p className="text-sm font-bold text-[var(--color-text-primary)]">{item.title}</p>
        <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{item.subtitle}</p>
      </div>
      <div className="flex flex-col items-end gap-0.5">
        <div className="flex items-center gap-1">
          <span
            className={`text-sm font-bold ${
              item.sign === '+' ? 'text-blue-600' : 'text-red-500'
            }`}
          >
            {item.sign}{item.amount.toLocaleString()}
          </span>
          {item.currency === 'POINT' ? <PointBadge /> : <TicketBadge />}
        </div>
        <span className="text-[11px] text-gray-400">{fmtDate(item.date)}</span>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data, isLoading } = useHistory();
  const items = data?.data ?? [];

  useEffect(() => {
    if (!user) router.replace('/login');
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="min-h-dvh bg-white">
      <PageHeader title="사용내역" />
      {isLoading ? (
        Array.from({ length: 4 }).map((_, i) => <SkeletonItem key={i} />)
      ) : items.length === 0 ? (
        <EmptyState />
      ) : (
        <div>
          {items.map((item) => (
            <HistoryRow key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
