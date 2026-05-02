'use client';

import { useRouter } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import { useNotices, type Notice } from '@/hooks/useNotices';

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}. ${String(d.getMonth() + 1).padStart(2, '0')}. ${String(d.getDate()).padStart(2, '0')}`;
}

function SkeletonItem() {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)] animate-pulse">
      <div className="flex-1">
        <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
        <div className="h-3 bg-gray-100 rounded w-1/4" />
      </div>
      <div className="w-4 h-4 bg-gray-100 rounded ml-3" />
    </div>
  );
}

function NoticeItem({ notice }: { notice: Notice }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(`/my/notices/${notice.id}`)}
      className="w-full flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)] last:border-b-0 hover:bg-gray-50 transition-colors text-left"
    >
      <div className="flex-1 min-w-0 pr-3">
        <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
          {notice.title}
        </p>
        <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
          {fmtDate(notice.createdAt)}
        </p>
      </div>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
        <path d="M6 4L10 8L6 12" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </button>
  );
}

export default function MyNoticesPage() {
  const { data, isLoading } = useNotices();
  const notices = data?.data ?? [];

  return (
    <div className="min-h-dvh bg-[var(--color-surface)]">
      <PageHeader title="공지사항" showBack />

      <div className="mx-4 mt-4 bg-white rounded-2xl overflow-hidden">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonItem key={i} />)
        ) : notices.length === 0 ? (
          <div className="py-16 text-center text-sm text-[var(--color-text-secondary)]">
            등록된 공지사항이 없습니다.
          </div>
        ) : (
          notices.map((n) => <NoticeItem key={n.id} notice={n} />)
        )}
      </div>
    </div>
  );
}
