'use client';

import { useParams } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import { useInquiry } from '@/hooks/useInquiries';

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
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-3 bg-gray-100 rounded" />
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: 'PENDING' | 'ANSWERED' }) {
  return (
    <span
      className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
        status === 'PENDING'
          ? 'bg-orange-50 text-orange-500'
          : 'bg-blue-50 text-blue-600'
      }`}
    >
      {status === 'PENDING' ? '답변대기' : '답변완료'}
    </span>
  );
}

export default function MyInquiryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const inquiryId = Number(id);

  const { data, isLoading } = useInquiry(inquiryId);
  const inquiry = data?.data;

  return (
    <div className="min-h-dvh bg-[var(--color-surface)]">
      <PageHeader title="문의하기" showBack />

      <div className="mx-4 mt-4 bg-white rounded-2xl p-5">
        {isLoading ? (
          <LoadingSkeleton />
        ) : inquiry ? (
          <div className="space-y-3">
            {/* 제목 + 날짜 + 상태 */}
            <h2 className="font-bold text-[var(--color-text-primary)]">{inquiry.title}</h2>
            <p className="text-xs text-gray-400">{fmtDate(inquiry.createdAt)}</p>
            <StatusBadge status={inquiry.status} />

            {/* 첨부 이미지 */}
            {inquiry.imageUrl && (
              <img
                src={inquiry.imageUrl}
                alt="첨부 이미지"
                className="rounded-xl w-full object-contain"
              />
            )}

            <hr className="border-[var(--color-border)]" />

            {/* 문의 내용 */}
            <p className="text-sm leading-relaxed whitespace-pre-line text-[var(--color-text-primary)]">
              {inquiry.content}
            </p>

            {/* 답변 */}
            {inquiry.answer && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-500 mb-2">답변안내</p>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm leading-relaxed whitespace-pre-line text-gray-700">
                    {inquiry.answer}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="py-12 text-center text-sm text-[var(--color-text-secondary)]">
            문의를 찾을 수 없습니다.
          </p>
        )}
      </div>
    </div>
  );
}
