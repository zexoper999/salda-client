'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAdminBanner, useUpdateBanner, useDeleteBanner } from '@/hooks/useAdminBanners';

function fmtDateInput(iso: string) {
  return iso ? new Date(iso).toISOString().split('T')[0] : '';
}

export default function AdminContentsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const bannerId = Number(id);
  const router = useRouter();

  const { data, isLoading } = useAdminBanner(bannerId);
  const updateMutation = useUpdateBanner(bannerId);
  const deleteMutation = useDeleteBanner();

  const [isPublic, setIsPublic] = useState(false);
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [saved, setSaved] = useState(false);

  const banner = data?.data;

  useEffect(() => {
    if (banner) {
      setIsPublic(banner.isPublic);
      setStartAt(fmtDateInput(banner.startAt));
      setEndAt(fmtDateInput(banner.endAt));
    }
  }, [banner]);

  const handleSave = async () => {
    await updateMutation.mutateAsync({ isPublic, startAt, endAt });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    await deleteMutation.mutateAsync(bannerId);
    router.push('/admin/contents');
  };

  if (isLoading || !banner) {
    return (
      <div className="max-w-2xl space-y-4 animate-pulse">
        <div className="h-8 bg-gray-100 rounded w-1/2" />
        <div className="h-40 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">{banner.title}</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-6">
        {/* 사진 */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">사진등록</p>
          {banner.imageUrl ? (
            <img
              src={banner.imageUrl}
              alt={banner.title}
              className="w-48 h-32 object-cover rounded-lg border border-gray-200"
            />
          ) : (
            <div className="w-48 h-32 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">
              이미지 없음
            </div>
          )}
        </div>

        {/* 상세설명 */}
        {banner.description && (
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">상세설명</p>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {banner.description}
            </p>
          </div>
        )}

        {/* 공개기간 */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">공개기간</p>
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              className="h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
            />
            <span className="text-gray-400">~</span>
            <input
              type="date"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
              className="h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
            />
          </div>
        </div>

        {/* 상태변경 */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">상태변경</p>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="isPublic"
                checked={isPublic}
                onChange={() => setIsPublic(true)}
                className="w-4 h-4 accent-gray-800"
              />
              <span className="text-sm text-gray-700">공개</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="isPublic"
                checked={!isPublic}
                onChange={() => setIsPublic(false)}
                className="w-4 h-4 accent-gray-800"
              />
              <span className="text-sm text-gray-700">비공개</span>
            </label>
          </div>
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
          className="px-5 py-2.5 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-60"
        >
          게시글삭제
        </button>
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="px-6 py-2.5 bg-[#1C2536] text-white rounded-lg text-sm font-semibold disabled:opacity-60 hover:bg-[#2a3548] transition-colors"
          >
            {updateMutation.isPending ? '저장 중...' : saved ? '저장됨 ✓' : '저장하기'}
          </button>
          <button
            onClick={() => router.push('/admin/contents')}
            className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            목록으로
          </button>
        </div>
      </div>
    </div>
  );
}
