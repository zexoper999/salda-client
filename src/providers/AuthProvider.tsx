"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/lib/axios";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Zustand 스토어에서 함수 가져오기
  const { login, logout } = useAuthStore();

  // React Query로 백엔드 /auth/me 호출
  const { data, isError, isLoading } = useQuery({
    queryKey: ["auth-me"],
    queryFn: async () => {
      const response = await api.get("/auth/me");
      return response.data;
    },
    retry: false, // 실패해도 다시 시도하지 않음 (401 에러면 그냥 비로그인 상태인 것)
  });

  // 데이터(내 정보)가 성공적으로 오면 로그인 상태로 저장
  // 에러가 나면(쿠키 없음, 만료 등) 로그아웃 처리
  useEffect(() => {
    if (data) {
      login(data);
    } else if (isError) {
      logout();
    }
  }, [data, isError, login, logout]);

  return <>{children}</>;
}
