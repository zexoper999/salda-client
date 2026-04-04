'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

export default function LoginPage() {
  const router = useRouter();
  const { isLoggedIn, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && isLoggedIn) router.replace('/home');
  }, [isLoggedIn, isLoading, router]);

  const handleKakaoLogin = () => {
    window.location.href = 'http://localhost:4000/auth/kakao';
  };

  const handleAppleLogin = () => {
    window.location.href = 'http://localhost:4000/auth/apple';
  };

  return (
    <div
      className="relative flex flex-col min-h-dvh px-6 overflow-hidden"
      style={{
        background: 'linear-gradient(175deg, #3B6CB5 0%, #5878A8 45%, #8B7355 100%)',
      }}
    >
      {/* 로고 */}
      <div className="pt-16 pb-2">
        <p className="text-white/80 text-sm font-medium tracking-widest">
          S A L D A <span className="text-white/60 text-xs">살다</span>
        </p>
      </div>

      {/* 메인 카피 */}
      <div className="mt-4">
        <h1 className="text-white font-bold leading-tight" style={{ fontSize: '2.4rem' }}>
          로그인을
          <br />
          시작합니다.
        </h1>
        <p className="mt-4 text-white/75 text-sm leading-relaxed">
          살다는 새로운 시작을 준비하는
          <br />
          모든 사람들을 응원합니다.
        </p>
      </div>

      {/* 버튼 영역 */}
      <div className="mt-auto pb-10 space-y-3">
        <button
          onClick={handleKakaoLogin}
          className="w-full h-14 rounded-full font-semibold text-base flex items-center justify-center gap-3"
          style={{ background: 'var(--color-kakao)', color: 'var(--color-kakao-text)' }}
        >
          <KakaoIcon />
          카카오로 로그인
        </button>

        <button
          onClick={handleAppleLogin}
          className="w-full h-14 rounded-full font-semibold text-base flex items-center justify-center gap-3 bg-black text-white"
        >
          <AppleIcon />
          애플 계정으로 로그인
        </button>

        {/* REQ-001 해결 전 비활성 */}
        <button
          disabled
          className="w-full h-14 rounded-full font-semibold text-base flex items-center justify-center gap-3 bg-white/20 text-white/50 cursor-not-allowed"
        >
          <OtherLoginIcon />
          다른 방법으로 로그인
        </button>

        <div className="text-center pt-1">
          <button
            onClick={() => router.push('/home')}
            className="text-white/60 text-sm"
          >
            둘러보기
          </button>
        </div>
      </div>
    </div>
  );
}

function KakaoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 2C5.58 2 2 4.9 2 8.5c0 2.26 1.43 4.24 3.6 5.38L4.7 17.3c-.08.3.23.55.5.38l4.1-2.72c.23.02.46.04.7.04 4.42 0 8-2.9 8-6.5S14.42 2 10 2Z"
        fill="#000000"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M14.09 10.55c-.02-2.03 1.66-3.01 1.73-3.05-.94-1.38-2.4-1.57-2.93-1.59-1.25-.13-2.44.74-3.07.74-.63 0-1.6-.72-2.63-.7-1.35.02-2.6.79-3.3 2-1.42 2.45-.36 6.09 1.01 8.08.67.97 1.47 2.06 2.52 2.02 1.01-.04 1.39-.65 2.61-.65 1.22 0 1.56.65 2.63.63 1.09-.02 1.78-.99 2.44-1.97.77-1.13 1.09-2.22 1.1-2.28-.02-.01-2.1-.8-2.12-3.23Z"
        fill="white"
      />
      <path
        d="M12.15 4.63c.56-.68.93-1.62.83-2.56-.8.03-1.77.53-2.34 1.21-.52.6-.97 1.56-.85 2.48.89.07 1.8-.45 2.36-1.13Z"
        fill="white"
      />
    </svg>
  );
}

function OtherLoginIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M17.5 3.5L10 10M17.5 3.5H12.5M17.5 3.5V8.5M8.5 5H4C3.17 5 2.5 5.67 2.5 6.5V16C2.5 16.83 3.17 17.5 4 17.5H13.5C14.33 17.5 15 16.83 15 16V11.5"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
