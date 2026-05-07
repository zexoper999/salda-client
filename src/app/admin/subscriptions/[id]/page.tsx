'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  useAdminSubscription,
  useUpdateSubscription,
  useCloseSubscription,
  useDeleteSubscription,
  STATUS_LABEL,
} from '@/hooks/useAdminSubscriptions';
import ImageUploader from '@/components/admin/ImageUploader';

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function fmtDateInput(iso: string) {
  return iso ? new Date(iso).toISOString().split('T')[0] : '';
}

export default function AdminSubscriptionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const subId = Number(id);
  const router = useRouter();

  const { data, isLoading } = useAdminSubscription(subId);
  const updateMutation = useUpdateSubscription(subId);
  const closeMutation = useCloseSubscription();
  const deleteMutation = useDeleteSubscription();

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  const sub = data?.data;

  useEffect(() => {
    if (sub) setImageUrls(sub.imageUrls);
  }, [sub]);

  const handleSave = async () => {
    await updateMutation.mutateAsync({ imageUrls });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClose = async () => {
    if (!confirm('마감시 자동으로 추첨이 진행되며, 되돌릴 수 없습니다.\n정말 마감 처리하시겠습니까?')) return;
    await closeMutation.mutateAsync(subId);
    router.push('/admin/subscriptions');
  };

  const handleDelete = async () => {
    if (!confirm('이 청약을 삭제하시겠습니까? 되돌릴 수 없습니다.')) return;
    try {
      await deleteMutation.mutateAsync(subId);
      router.push('/admin/subscriptions');
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      alert(msg ?? '삭제에 실패했습니다.');
    }
  };

  if (isLoading || !sub) {
    return (
      <div className="max-w-3xl animate-pulse space-y-4">
        <div className="h-8 bg-gray-100 rounded w-1/2" />
        <div className="h-64 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">{sub.title}</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-6">
        {/* 사진 */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">사진등록</p>
          <ImageUploader
            folder="subscriptions"
            images={imageUrls}
            maxCount={10}
            onChange={setImageUrls}
          />
        </div>

        {/* 기본 정보 */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-gray-400 mb-1">간략한 한줄설명</p>
            <p className="text-gray-700">{sub.oneLineDesc ?? '-'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">청약 종류</p>
            <p className="text-gray-700">{sub.type === 'JEONSE' ? '전세청약' : '차량청약'}</p>
          </div>
        </div>

        {/* 상세설명 */}
        {sub.description && (
          <div>
            <p className="text-xs text-gray-400 mb-1">상세설명</p>
            <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
              {sub.description}
            </p>
          </div>
        )}

        {/* 응모기간 / 응모제한 */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-gray-400 mb-1">응모기간</p>
            <p className="text-gray-700">
              {fmtDate(sub.startAt)} ~ {fmtDate(sub.endAt)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">응모제한</p>
            <p className="text-gray-700">{sub.maxEntries.toLocaleString()}</p>
          </div>
        </div>

        {/* 현재 응모자 수 / 상태변경 */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-400 mb-1">현재 응모자 수</p>
            <p className="text-xl font-bold text-gray-800">{sub.entryCount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">현재 상태</p>
            <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${
              sub.status === 'ONGOING' ? 'bg-blue-100 text-blue-700' :
              sub.status === 'CLOSING_SOON' ? 'bg-orange-100 text-orange-700' :
              'bg-gray-100 text-gray-500'
            }`}>
              {STATUS_LABEL[sub.status] ?? sub.status}
            </span>
            <p className="text-[11px] text-gray-400 mt-1">마감은 아래 '청약마감' 버튼으로만 처리</p>
          </div>
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex items-center justify-between mt-6">
        <div className="flex gap-2">
          <button
            onClick={handleClose}
            disabled={sub.status === 'CLOSED' || closeMutation.isPending}
            className="px-5 py-2.5 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-40"
          >
            청약마감
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="px-5 py-2.5 border border-red-300 text-red-500 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-40"
          >
            청약삭제
          </button>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="px-6 py-2.5 bg-[#1C2536] text-white rounded-lg text-sm font-semibold disabled:opacity-60 hover:bg-[#2a3548] transition-colors"
          >
            {updateMutation.isPending ? '저장 중...' : saved ? '저장됨 ✓' : '저장하기'}
          </button>
          <button
            onClick={() => router.push('/admin/subscriptions')}
            className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            목록으로
          </button>
        </div>
      </div>
    </div>
  );
}
