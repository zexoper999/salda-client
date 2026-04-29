'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateSubscription } from '@/hooks/useAdminSubscriptions';
import ImageUploader from '@/components/admin/ImageUploader';

export default function AdminSubscriptionsNewPage() {
  const router = useRouter();
  const createMutation = useCreateSubscription();

  const [form, setForm] = useState({
    type: 'JEONSE' as 'JEONSE' | 'VEHICLE',
    title: '',
    oneLineDesc: '',
    description: '',
    imageUrls: [] as string[],
    deposit: 0,
    maxEntries: 1000000,
    bonusIncluded: false,
    startAt: '',
    endAt: '',
  });
  const [error, setError] = useState('');

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError('제목을 입력하세요.'); return; }
    if (!form.startAt || !form.endAt) { setError('응모기간을 입력하세요.'); return; }
    setError('');
    try {
      await createMutation.mutateAsync(form);
      router.push('/admin/subscriptions');
    } catch {
      setError('등록 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">청약등록</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-6">
        {/* 사진등록 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">사진등록</label>
          <ImageUploader
            folder="subscriptions"
            images={form.imageUrls}
            maxCount={10}
            onChange={(urls) => set('imageUrls', urls)}
          />
        </div>

        {/* 청약 종류 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">청약 종류</label>
          <select
            value={form.type}
            onChange={(e) => set('type', e.target.value as 'JEONSE' | 'VEHICLE')}
            className="h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
          >
            <option value="JEONSE">전세청약</option>
            <option value="VEHICLE">차량청약</option>
          </select>
        </div>

        {/* 제목 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">제목</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
          />
        </div>

        {/* 간략한 한줄설명 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">간략한 한줄설명</label>
          <input
            type="text"
            value={form.oneLineDesc}
            onChange={(e) => set('oneLineDesc', e.target.value)}
            className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
          />
        </div>

        {/* 상세설명 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">상세설명</label>
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={6}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:border-gray-400"
          />
        </div>

        {/* 응모기간 + 응모제한 */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">응모기간</label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={form.startAt}
                onChange={(e) => set('startAt', e.target.value)}
                className="h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
              />
              <span className="text-gray-400">~</span>
              <input
                type="date"
                value={form.endAt}
                onChange={(e) => set('endAt', e.target.value)}
                className="h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">응모제한</label>
            <input
              type="number"
              value={form.maxEntries}
              onChange={(e) => set('maxEntries', Number(e.target.value))}
              className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
            />
          </div>
        </div>

        {/* 보너스 응모 */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.bonusIncluded}
            onChange={(e) => set('bonusIncluded', e.target.checked)}
            className="w-4 h-4 accent-gray-800"
          />
          <span className="text-sm text-gray-700">보너스 응모 포함</span>
        </label>

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={() => router.push('/admin/subscriptions')}
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
    </div>
  );
}
