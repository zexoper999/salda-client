'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import { useCreateInquiry } from '@/hooks/useInquiries';
import { compressImage } from '@/lib/compressImage';
import { uploadInquiryImage } from '@/lib/uploadImage';
import { useToastStore } from '@/store/useToastStore';

export default function NewInquiryPage() {
  const router = useRouter();
  const { show } = useToastStore();
  const createMutation = useCreateInquiry();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
    e.target.value = '';
  };

  const handleSubmit = async () => {
    if (!title.trim()) { show('error', '문의 제목을 입력해주세요.'); return; }
    if (!content.trim()) { show('error', '문의 내용을 입력해주세요.'); return; }

    setSubmitting(true);
    try {
      let imageUrl: string | undefined;
      if (file) {
        const compressed = await compressImage(file);
        imageUrl = await uploadInquiryImage(compressed);
      }
      await createMutation.mutateAsync({ title, content, imageUrl });
      show('success', '문의가 등록되었습니다.');
      router.push('/my/inquiry');
    } catch (err) {
      const msg = err instanceof Error ? err.message : '문의 등록에 실패했습니다.';
      show('error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-dvh bg-[var(--color-surface)] pb-24">
      <PageHeader title="새 문의하기" showBack />

      <div className="mx-4 mt-4 bg-white rounded-2xl p-5 space-y-4">
        {/* 제목 */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">문의 제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="문의 제목을 입력하세요"
            className="w-full h-11 px-3 border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:border-[var(--color-primary)]"
          />
        </div>

        {/* 내용 */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">문의 내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            placeholder="문의 내용을 입력하세요"
            className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-xl text-sm resize-none focus:outline-none focus:border-[var(--color-primary)]"
          />
        </div>

        {/* 첨부 파일 */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">첨부 파일</label>
          <p className="text-xs text-gray-400 mb-2">
            이미지만 첨부 가능합니다 (.jpg, .png, .webp, .gif) / 최대 5MB
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          {file ? (
            <div className="flex items-center justify-between px-3 py-2.5 border border-[var(--color-border)] rounded-xl">
              <span className="text-sm text-gray-700 truncate max-w-[220px]">{file.name}</span>
              <button
                onClick={() => setFile(null)}
                className="text-gray-400 hover:text-gray-600 ml-2 text-lg leading-none"
                aria-label="파일 삭제"
              >
                ×
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-11 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-gray-400 transition-colors"
            >
              + 이미지 선택
            </button>
          )}
        </div>
      </div>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 px-5 py-4 bg-white border-t border-[var(--color-border)]">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full h-12 bg-[var(--color-primary)] text-white text-sm font-semibold rounded-full disabled:opacity-60"
        >
          {submitting ? '등록 중...' : '등록하기'}
        </button>
      </div>
    </div>
  );
}
