'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateNotification, type NotificationUser } from '@/hooks/useAdminNotifications';
import { useToastStore } from '@/store/useToastStore';
import UserPickerModal from './_UserPickerModal';

function loginMethod(u: NotificationUser) {
  if (u.kakaoId) return '카카오';
  if (u.appleId) return '애플';
  return '-';
}

function NotifBadge({ on, label }: { on: boolean; label: string }) {
  return (
    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] mr-0.5 ${on ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
      {label}
    </span>
  );
}

export default function NewNotificationPage() {
  const router = useRouter();
  const { show: showToast } = useToastStore();
  const createMutation = useCreateNotification();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [targetType, setTargetType] = useState<'ALL' | 'SPECIFIC'>('ALL');
  const [selectedUsers, setSelectedUsers] = useState<NotificationUser[]>([]);
  const [sendMode, setSendMode] = useState<'immediate' | 'scheduled'>('immediate');
  const [sendAt, setSendAt] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  const handleRemoveUser = (id: number) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const handleSubmit = async () => {
    if (!title.trim()) { showToast('error', '제목을 입력해주세요.'); return; }
    if (!body.trim()) { showToast('error', '내용을 입력해주세요.'); return; }
    if (targetType === 'SPECIFIC' && selectedUsers.length === 0) {
      showToast('error', '발신대상을 추가해주세요.'); return;
    }
    if (sendMode === 'scheduled' && !sendAt) {
      showToast('error', '발송 예약 시간을 입력해주세요.'); return;
    }

    try {
      await createMutation.mutateAsync({
        title: title.trim(),
        body: body.trim(),
        targetType,
        targetUserIds: targetType === 'SPECIFIC' ? selectedUsers.map((u) => u.id) : undefined,
        sendAt: sendMode === 'scheduled' ? new Date(sendAt).toISOString() : undefined,
      });
      showToast('success', sendMode === 'scheduled' ? '알림이 예약되었습니다.' : '알림이 발송되었습니다.');
      router.push('/admin/notifications');
    } catch {
      showToast('error', '등록에 실패했습니다.');
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">별도알림등록</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        {/* 제목 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">푸시 제목 *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="알림 제목"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#1C2536]"
          />
        </div>

        {/* 내용 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">푸시 내용 *</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="알림 내용을 입력해주세요"
            rows={4}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#1C2536] resize-none"
          />
        </div>

        {/* 발신대상 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">발신대상</label>
          <div className="flex gap-3 mb-3">
            <button
              onClick={() => setTargetType('ALL')}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                targetType === 'ALL'
                  ? 'bg-[#1C2536] text-white border-[#1C2536]'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              회원 전체
            </button>
            <button
              onClick={() => setTargetType('SPECIFIC')}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                targetType === 'SPECIFIC'
                  ? 'bg-[#1C2536] text-white border-[#1C2536]'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              개별 선택
            </button>
          </div>

          {targetType === 'SPECIFIC' && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">이름</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">휴대폰번호</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">로그인수단</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">알림수신</th>
                    <th className="px-4 py-2.5 w-10" />
                  </tr>
                </thead>
                <tbody>
                  {selectedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-400">
                        발신대상을 추가해주세요.
                      </td>
                    </tr>
                  ) : (
                    selectedUsers.map((u) => (
                      <tr key={u.id} className="border-b border-gray-100 last:border-b-0">
                        <td className="px-4 py-3 font-medium text-gray-800">{u.name}</td>
                        <td className="px-4 py-3 text-gray-600">{u.phone ?? '-'}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{loginMethod(u)}</td>
                        <td className="px-4 py-3">
                          <NotifBadge on={u.notifAll} label="전체" />
                          <NotifBadge on={u.notifSubscription} label="청약" />
                          <NotifBadge on={u.notifMarketing} label="마케팅" />
                          <NotifBadge on={u.notifInfo} label="안내" />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleRemoveUser(u.id)}
                            className="text-gray-400 hover:text-red-500 text-lg leading-none"
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <button
                onClick={() => setShowPicker(true)}
                className="w-full py-3 flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-gray-700 border-t border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <span className="text-base">+</span> 추가하기
              </button>
            </div>
          )}
        </div>

        {/* 발송 시간 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">발송 시간</label>
          <div className="flex gap-3 mb-3">
            <button
              onClick={() => setSendMode('immediate')}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                sendMode === 'immediate'
                  ? 'bg-[#1C2536] text-white border-[#1C2536]'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              즉시발송
            </button>
            <button
              onClick={() => setSendMode('scheduled')}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                sendMode === 'scheduled'
                  ? 'bg-[#1C2536] text-white border-[#1C2536]'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              예약발송
            </button>
          </div>
          {sendMode === 'scheduled' && (
            <input
              type="datetime-local"
              value={sendAt}
              onChange={(e) => setSendAt(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#1C2536]"
            />
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-5">
        <button
          onClick={() => router.push('/admin/notifications')}
          className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
        >
          등록취소
        </button>
        <button
          onClick={handleSubmit}
          disabled={createMutation.isPending}
          className="px-6 py-2.5 bg-[#1C2536] text-white text-sm font-semibold rounded-lg hover:bg-[#2a3548] disabled:opacity-50"
        >
          {createMutation.isPending ? '처리 중...' : '등록하기'}
        </button>
      </div>

      {showPicker && (
        <UserPickerModal
          selected={selectedUsers}
          onConfirm={(users) => { setSelectedUsers(users); setShowPicker(false); }}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}
