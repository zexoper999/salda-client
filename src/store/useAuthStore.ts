import { create } from "zustand";

interface User {
  id: number;
  kakaoId: string;
  name: string;
  phone: string | null;
  point: number;
}

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  login: (user: User) => void; // login func set user info
  logout: () => void; // logout func reset user info
}

// 스토어 생성
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoggedIn: false,

  // 로그인 성공 시 상태 업데이트
  login: (user) => set({ user, isLoggedIn: true }),

  // 로그아웃 시 상태 초기화
  logout: () => set({ user: null, isLoggedIn: false }),
}));
