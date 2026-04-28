'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateBanner } from '@/hooks/useAdminBanners';

export default function AdminContentsNewPage() {
  const router = useRouter();
  const createMutation = useCreateBanner();

  const [form, setForm] = useState({
    imageUrl: '',
    title: '',
    description: '',
    startAt: '',
    endAt: '',
  });
  const [error, setError] = useState('');

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

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
        {/* 사진 URL */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">사진등록</label>
          {form.imageUrl && (
            <div className="w-40 h-28 mb-3 rounded-lg overflow-hidden border border-gray-200">
              <img src={form.imageUrl} alt="preview" className="w-full h-full object-cover" />
            </div>
          )}
          {!form.imageUrl && (
            <div className="w-40 h-28 mb-3 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-gray-300 transition-colors">
              <span className="text-2xl mb-1">+</span>
              <span className="text-xs">사진추가하기</span>
            </div>
          )}
          <input
            type="url"
            value={form.imageUrl}
            onChange={set('imageUrl')}
            placeholder="이미지 URL을 입력하세요"
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
