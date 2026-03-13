"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/lib/axios";

export default function Home() {
  // Zustand에서 유저 정보와 로그인 여부 꺼내오기
  const { user, isLoggedIn, logout } = useAuthStore();

  const loginClick = () => {
    // 백엔드의 카카오 로그인 URL로 바로 이동 (이전 테스트 방식과 동일)
    window.location.href = "http://localhost:4000/auth/kakao";
  };

  const logoutClick = async () => {
    // TODO: 백엔드에 로그아웃 API 호출 (쿠키삭제)
    logout();
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <div className="bg-white p-10 rounded-xl shadow-lg text-center w-[400px]">
        <h1 className="text-4xl font-bold text-blue-600 mb-8">SALDA 🚀</h1>

        {isLoggedIn ? (
          // 로그인 한 유저에게 보여줄 화면
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg text-blue-900">
              <p className="font-bold text-xl">{user?.name} 님</p>
              <p className="text-sm">보유 포인트: {user?.point} P</p>
            </div>
            <button
              onClick={logoutClick}
              className="w-full py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
            >
              로그아웃
            </button>
          </div>
        ) : (
          // 비로그인 유저에게 보여줄 화면
          <button
            onClick={loginClick}
            className="w-full py-3 bg-[#FEE500] text-[#000000] rounded-lg font-semibold hover:bg-[#FADA0A] flex items-center justify-center gap-2"
          >
            <span className="text-xl">💬</span> 카카오로 시작하기
          </button>
        )}
      </div>
    </main>
  );
}
