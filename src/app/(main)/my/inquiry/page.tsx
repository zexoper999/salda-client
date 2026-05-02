'use client';

import { useRouter } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import { useMyInquiries, type MyInquiry } from '@/hooks/useInquiries';

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
      <div className="w-16 h-5 bg-gray-100 rounded ml-3" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-14 h-14 rounded-full border-2 border-gray-200 flex items-center justify-center">
        <span className="text-2xl text-gray-300 font-bold">!</span>
      </div>
      <p className="text-sm text-[var(--color-text-secondary)]">문의내역이 없습니다.</p>
    </div>
  );
}

function InquiryItem({ inquiry }: { inquiry: MyInquiry }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(`/my/inquiry/${inquiry.id}`)}
      className="w-full flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)] last:border-b-0 hover:bg-gray-50 transition-colors text-left"
    >
      <div className="flex-1 min-w-0 pr-3">
        <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
          {inquiry.title}
        </p>
        <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
          {fmtDate(inquiry.createdAt)}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={`text-xs font-medium ${inquiry.status === 'PENDING' ? 'text-orange-500' : 'text-blue-600'}`}>
          {inquiry.status === 'PENDING' ? '답변대기' : '답변완료'}
        </span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 4L10 8L6 12" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    </button>
  );
}

export default function MyInquiryPage() {
  const router = useRouter();
  const { data, isLoading } = useMyInquiries();
  const inquiries = data?.data ?? [];

  return (
    <div className="min-h-dvh bg-[var(--color-surface)] pb-24">
      <PageHeader title="문의하기" showBack />

      <div className="mx-4 mt-4 bg-white rounded-2xl overflow-hidden">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonItem key={i} />)
        ) : inquiries.length === 0 ? (
          <EmptyState />
        ) : (
          inquiries.map((q) => <InquiryItem key={q.id} inquiry={q} />)
        )}
      </div>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 px-5 py-4 bg-white border-t border-[var(--color-border)]">
        <button
          onClick={() => router.push('/my/inquiry/new')}
          className="w-full h-12 bg-[var(--color-primary)] text-white text-sm font-semibold rounded-full"
        >
          새 문의하기
        </button>
      </div>
    </div>
  );
}
