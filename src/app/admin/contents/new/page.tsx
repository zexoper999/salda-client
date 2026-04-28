'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateBanner } from '@/hooks/useAdminBanners';

export default function AdminContentsNewPage() {
  const router = useRouter();
  const createMutation = useCreateBanner();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    imageUrl: '',
    title: '',
    description: '',
    startAt: '',
    endAt: '',
  });
  const [error, setError] = useState('');

  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm((f) => ({ ...f, imageUrl: ev.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError('제목을 입력하세요.'); return; }
    if (!form.startAt || !form.endAt) { setError('공개기간을 입력하세요.'); return; }
    setError('');
    try {
      await createMutation.mutateAsync({
        imageUrl: form.imageUrl || null,
        title: form.title,
        description: form.description || null,
        startAt: form.startAt,
        endAt: form.endAt,
      });
      router.push('/admin/contents');
    } catch {
      setError('등록 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">컨텐츠 등록</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-6">

        {/* 사진등록 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">사진등록</label>

          {/* 숨긴 파일 입력 */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* 클릭 가능한 미리보기 영역 */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-40 h-28 mb-3 rounded-lg overflow-hidden border-2 border-dashed border-gray-200
              flex flex-col items-center justify-center cursor-pointer
              hover:border-gray-400 hover:bg-gray-50 transition-colors group relative"
          >
            {form.imageUrl ? (
              <>
                <img src={form.imageUrl} alt="preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-xs font-medium">변경</span>
                </div>
              </>
            ) : (
              <>
                <span className="text-2xl text-gray-300 mb-1 group-hover:text-gray-400 transition-colors">+</span>
                <span className="text-xs text-gray-400 group-hover:text-gray-500 transition-colors">사진추가하기</span>
              </>
            )}
          </div>

          {/* URL 직접 입력 (선택) */}
          <p className="text-xs text-gray-400 mb-1.5">또는 이미지 URL 직접 입력</p>
          <input
            type="url"
            value={form.imageUrl.startsWith('data:') ? '' : form.imageUrl}
            onChange={set('imageUrl')}
            placeholder="https://example.com/image.jpg"
            className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
          />
        </div>

        {/* 제목 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">제목</label>
          <input
            type="text"
            value={form.title}
            onChange={set('title')}
            className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
          />
        </div>

        {/* 상세설명 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">상세설명</label>
          <textarea
            value={form.description}
            onChange={set('description')}
            rows={6}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:border-gray-400"
          />
        </div>

        {/* 공개기간 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">공개기간</label>
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={form.startAt}
              onChange={set('startAt')}
              className="h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
            />
            <span className="text-gray-400">~</span>
            <input
              type="date"
              value={form.endAt}
              onChange={set('endAt')}
              className="h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={() => router.push('/admin/contents')}
          className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          등록취소
        </button>
        <button
          onClick={handleSubmit}
          disabled={createMutation.isPending}
          className="px-6 py-2.5 bg-[#1C2536] text-white rounded-lg text-sm font-semibold disabled:opacity-60 hover:bg-[#2a3548] transition-colors"
        >
          {createMutation.isPending ? '처리 중...' : '등록하기'}
        </button>
      </div>

      <p className="mt-4 text-xs text-gray-400">* 등록 시 비공개로 저장됩니다. 상세 페이지에서 공개로 전환하세요.</p>
    </div>
  );
}
