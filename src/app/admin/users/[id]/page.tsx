'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAdminUser, useUpdateUserPoint, useDeleteUser } from '@/hooks/useAdminUsers';

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function InfoRow({ label, value, red }: { label: string; value: React.ReactNode; red?: boolean }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`text-base font-medium ${red ? 'text-red-500' : 'text-gray-800'}`}>{value}</p>
    </div>
  );
}

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const userId = Number(id);
  const router = useRouter();

  const { data, isLoading } = useAdminUser(userId);
  const updatePoint = useUpdateUserPoint();
  const deleteUser = useDeleteUser();

  const [pointInput, setPointInput] = useState('');
  const [saved, setSaved] = useState(false);

  const user = data?.data;

  useEffect(() => {
    if (user) setPointInput(String(user.point));
  }, [user]);

  const handleSave = async () => {
    const point = Number(pointInput);
    if (isNaN(point) || point < 0) return;
    await updatePoint.mutateAsync({ id: userId, point });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDelete = async () => {
    if (!confirm('강제로 회원 탈퇴 시 기록은 전부 삭제되며, 되돌릴 수 없습니다.\n정말 탈퇴 처리하시겠습니까?')) return;
    await deleteUser.mutateAsync(userId);
    router.push('/admin/users');
  };

  if (isLoading || !user) {
    return (
      <div className="max-w-3xl animate-pulse space-y-4">
        <div className="h-8 bg-gray-100 rounded w-1/3" />
        <div className="h-64 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">회원정보</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-8">
        {/* 기본 정보 */}
        <div className="grid grid-cols-2 gap-6 pb-6 border-b border-gray-100">
          <InfoRow label="이름" value={user.name} />
          <InfoRow label="휴대폰번호" value={user.phone ?? '-'} />
          <InfoRow label="가입일" value={fmtDate(user.createdAt)} />
          <InfoRow label="로그인수단" value={user.loginType} />
        </div>

        {/* 포인트 정보 */}
        <div className="grid grid-cols-2 gap-6 pb-6 border-b border-gray-100">
          <InfoRow label="총 획득 포인트" value={user.totalEarnedPoint.toLocaleString()} />
          <InfoRow label="사용 포인트" value={user.usedPoint.toLocaleString()} red />
          <InfoRow label="추가조정포인트" value={user.adjustedPoint.toLocaleString()} />
          {/* 보유포인트 — 수정 가능 */}
          <div>
            <p className="text-xs text-gray-400 mb-1">보유포인트</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={pointInput}
                onChange={(e) => setPointInput(e.target.value)}
                className="w-36 h-9 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-500"
              />
              <button
                onClick={handleSave}
                disabled={updatePoint.isPending}
                className="h-9 px-4 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-60"
              >
                {saved ? '저장됨 ✓' : '수정'}
              </button>
            </div>
          </div>
        </div>

        {/* 활동 통계 */}
        <div className="grid grid-cols-2 gap-6">
          <InfoRow label="미션 성공 횟수" value={user.missionCount.toLocaleString()} />
          <InfoRow label="참여 응모수" value={user.entryCount.toLocaleString()} />
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={handleDelete}
          disabled={deleteUser.isPending}
          className="px-5 py-2.5 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-60"
        >
          회원탈퇴
        </button>
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={updatePoint.isPending}
            className="px-6 py-2.5 bg-[#1C2536] text-white rounded-lg text-sm font-semibold disabled:opacity-60 hover:bg-[#2a3548] transition-colors"
          >
            {updatePoint.isPending ? '저장 중...' : saved ? '저장됨 ✓' : '저장하기'}
          </button>
          <button
            onClick={() => router.push('/admin/users')}
            className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            목록으로
          </button>
        </div>
      </div>
    </div>
  );
}
