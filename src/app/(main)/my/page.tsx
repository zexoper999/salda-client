'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/axios';
import { useQueryClient } from '@tanstack/react-query';

export default function MyPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // 무시
    } finally {
      logout();
      queryClient.clear();
      router.replace('/login');
    }
  };

  return (
    <div className="min-h-dvh bg-[var(--color-surface)]">
      <div className="px-5 pt-5 pb-4 bg-white">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          보다 자세하게
          <br />
          <span className="text-[var(--color-primary)]">모아보기</span>
        </h1>
      </div>

      {/* 프로필 카드 */}
      <div className="mx-4 mt-4 bg-white rounded-2xl p-5">
        {user ? (
          <>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[var(--color-surface)] flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="12" r="6" fill="#9CA3AF" />
                  <path d="M4 26C4 20.48 9.37 16 16 16C22.63 16 28 20.48 28 26" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-base font-bold text-[var(--color-text-primary)]">
                  {user.name}{' '}
                  <span className="text-sm font-normal text-[var(--color-text-secondary)]">님</span>
                </p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">포인트</p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black text-[var(--color-text-primary)]">
                  {(user.point ?? 0).toLocaleString()}
                </span>
                <PointBadge />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
              <span className="text-sm text-[var(--color-text-secondary)]">보유 응모권</span>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold text-[var(--color-primary)]">{user.ticket ?? 0}장</span>
                <span className="text-[var(--color-primary)] text-sm">◆</span>
              </div>
            </div>
          </>
        ) : (
          <button
            onClick={() => router.push('/login')}
            className="w-full flex items-center gap-4"
          >
            <div className="w-16 h-16 rounded-full bg-[var(--color-surface)] flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="12" r="6" fill="#D1D5DB" />
                <path d="M4 26C4 20.48 9.37 16 16 16C22.63 16 28 20.48 28 26" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)]">
              로그인하고 다양한 혜택을 받아보세요
            </p>
          </button>
        )}
      </div>

      {/* 4개 아이콘 메뉴 */}
      <div className="mx-4 mt-4 bg-white rounded-2xl p-5">
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: <MegaphoneIcon />, label: '공지사항', href: '/my/notices' },
            { icon: <MessageIcon />, label: '문의하기', href: '/my/inquiry' },
            { icon: <ReceiptIcon />, label: '사용내역', href: '/my/history' },
            { icon: <QuestionIcon />, label: 'FAQ', href: '/my/faq' },
          ].map(({ icon, label, href }) => (
            <button
              key={label}
              onClick={() => router.push(href)}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-14 h-14 rounded-full bg-[var(--color-surface)] flex items-center justify-center">
                {icon}
              </div>
              <span className="text-xs text-[var(--color-text-secondary)]">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 설정 목록 */}
      <div className="mx-4 mt-4 bg-white rounded-2xl overflow-hidden">
        {[
          { label: '알림설정', href: '/my/notifications' },
          { label: '이용약관', href: '/my/terms' },
          { label: '개인정보처리방침', href: '/my/privacy' },
        ].map(({ label, href }) => (
          <button
            key={label}
            onClick={() => router.push(href)}
            className="w-full flex items-center justify-between px-5 h-14 border-b border-[var(--color-border)] last:border-b-0"
          >
            <span className="text-sm text-[var(--color-text-primary)]">{label}</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4L10 8L6 12" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        ))}
      </div>

      {/* 앱 버전 + 로그아웃 */}
      <div className="mx-4 mt-4 bg-white rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 h-12">
          <span className="text-sm text-[var(--color-text-secondary)]">앱버전</span>
          <span className="text-sm text-[var(--color-text-secondary)]">v 0.01</span>
        </div>
        {user && (
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-5 h-12 border-t border-[var(--color-border)]"
          >
            <span className="text-sm text-red-500 font-medium">로그아웃</span>
          </button>
        )}
      </div>

      {/* 사업자 정보 */}
      <div className="mx-4 mt-4 mb-6 px-1">
        <p className="text-xs text-[var(--color-text-disabled)] leading-relaxed">
          살다 사업자정보
          <br />
          대표이사: 양한울
          <br />
          서울시 강서구 마곡동 123-12 사업자등록번호. 123-12-12345
          <br />
          통신판매업신고번호. 2025-서울강서-0012 호스팅사업자. (주)카페24
        </p>
      </div>
    </div>
  );
}

function PointBadge() {
  return (
    <div className="w-5 h-5 rounded-full flex items-center justify-center font-black text-white text-[10px] bg-amber-400">
      P
    </div>
  );
}
function MegaphoneIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M18 3L4 8V14L18 19V3Z" stroke="#6B7280" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M4 11H2M4 8V14" stroke="#6B7280" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M7 14L8.5 18" stroke="#6B7280" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function MessageIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="2" y="3" width="18" height="13" rx="2" stroke="#6B7280" strokeWidth="1.6" />
      <path d="M2 16L6 13H20" stroke="#6B7280" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M6 8H16M6 11H12" stroke="#6B7280" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function ReceiptIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path
        d="M4 2H18V20L15 18L12 20L9 18L6 20L4 18.5V2Z"
        stroke="#6B7280" strokeWidth="1.6" strokeLinejoin="round"
      />
      <path d="M7 8H15M7 11H15M7 14H11" stroke="#6B7280" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function QuestionIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="8" stroke="#6B7280" strokeWidth="1.6" />
      <path
        d="M8.5 9C8.5 7.62 9.62 6.5 11 6.5C12.38 6.5 13.5 7.62 13.5 9C13.5 10.38 11 11.5 11 13"
        stroke="#6B7280" strokeWidth="1.6" strokeLinecap="round"
      />
      <circle cx="11" cy="15.5" r="0.75" fill="#6B7280" />
    </svg>
  );
}
