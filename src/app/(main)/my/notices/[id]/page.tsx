'use client';

import { useParams } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import { useNotice } from '@/hooks/useNotices';

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}. ${String(d.getMonth() + 1).padStart(2, '0')}. ${String(d.getDate()).padStart(2, '0')}`;
}

function LoadingSkeleton() {
  return (
    <div className="px-5 pt-6 space-y-3 animate-pulse">
      <div className="h-5 bg-gray-100 rounded w-3/4" />
      <div className="h-3 bg-gray-100 rounded w-1/4" />
      <hr className="border-gray-100 my-4" />
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-3 bg-gray-100 rounded" />
        ))}
      </div>
    </div>
  );
}

export default function MyNoticeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const noticeId = Number(id);

  const { data, isLoading } = useNotice(noticeId);
  const notice = data?.data;

  return (
    <div className="min-h-dvh bg-[var(--color-surface)]">
      <PageHeader title="공지사항" showBack />

      <div className="mx-4 mt-4 bg-white rounded-2xl p-5">
        {isLoading ? (
          <LoadingSkeleton />
        ) : notice ? (
          <>
            <h2 className="text-lg font-bold text-[var(--color-text-primary)]">{notice.title}</h2>
            <p className="text-xs text-gray-400 mt-1">{fmtDate(notice.createdAt)}</p>
            <hr className="my-4 border-[var(--color-border)]" />
            <p className="text-sm leading-relaxed whitespace-pre-line text-[var(--color-text-primary)]">
              {notice.content}
            </p>
          </>
        ) : (
          <p className="py-12 text-center text-sm text-[var(--color-text-secondary)]">
            공지사항을 찾을 수 없습니다.
          </p>
        )}
      </div>
    </div>
  );
}
