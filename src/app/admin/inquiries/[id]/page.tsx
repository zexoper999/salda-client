'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAdminInquiry, useReplyInquiry, useDeleteInquiry } from '@/hooks/useAdminInquiries';

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function LoadingSkeleton() {
  return (
    <div className="max-w-3xl space-y-4 animate-pulse">
      <div className="h-8 w-40 bg-gray-100 rounded" />
      <div className="h-64 bg-gray-100 rounded-xl" />
    </div>
  );
}

export default function AdminInquiryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const inquiryId = Number(id);

  const { data, isLoading } = useAdminInquiry(inquiryId);
  const replyMutation = useReplyInquiry(inquiryId);
  const deleteMutation = useDeleteInquiry();

  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');

  const inquiry = data?.data;
  const hasExistingAnswer = !!inquiry?.answer;

  useEffect(() => {
    if (inquiry?.answer) setAnswer(inquiry.answer);
  }, [inquiry]);

  const handleSubmit = async () => {
    if (!answer.trim()) { setError('답변 내용을 입력하세요.'); return; }
    setError('');
    try {
      await replyMutation.mutateAsync(answer);
      router.push('/admin/inquiries');
    } catch {
      setError('처리 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async () => {
    if (!confirm('이 문의를 삭제하시겠습니까?')) return;
    try {
      await deleteMutation.mutateAsync(inquiryId);
      router.push('/admin/inquiries');
    } catch {
      setError('삭제 중 오류가 발생했습니다.');
    }
  };

  if (isLoading) return <LoadingSkeleton />;
  if (!inquiry) return <p className="text-gray-500">문의를 찾을 수 없습니다.</p>;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">답변하기</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-5">
        {/* 제목 */}
        <div>
          <h2 className="font-bold text-lg text-gray-800">{inquiry.title}</h2>
          <hr className="my-3 border-gray-200" />
        </div>

        {/* 유저 정보 */}
        <div className="flex gap-4 text-sm text-gray-500">
          <span>{inquiry.user.name}</span>
          <span>{inquiry.user.phone ?? '-'}</span>
          <span>{fmtDate(inquiry.createdAt)}</span>
        </div>

        {/* 문의 내용 */}
        <p className="text-sm leading-relaxed whitespace-pre-line text-gray-700">
          {inquiry.content}
        </p>

        {/* 첨부 이미지 */}
        {inquiry.imageUrl && (
          <img
            src={inquiry.imageUrl}
            alt="첨부 이미지"
            className="max-h-48 rounded object-contain border border-gray-200"
          />
        )}

        <hr className="border-gray-200" />

        {/* 답변 */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-2">답변</label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={10}
            placeholder="답변 내용을 입력하세요"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:border-gray-400"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      {/* 액션 버튼 */}
      <div className="flex justify-between mt-6">
        <button
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
          className="px-5 py-2.5 border border-red-200 text-red-500 rounded-lg text-sm hover:bg-red-50 transition-colors"
        >
          문의삭제
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => router.push('/admin/inquiries')}
            className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            등록취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={replyMutation.isPending}
            className="px-6 py-2.5 bg-[#1C2536] text-white rounded-lg text-sm font-semibold disabled:opacity-60 hover:bg-[#2a3548] transition-colors"
          >
            {replyMutation.isPending ? '처리 중...' : hasExistingAnswer ? '답변수정' : '답변등록'}
          </button>
        </div>
      </div>
    </div>
  );
}
