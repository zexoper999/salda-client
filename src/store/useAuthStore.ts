import { create } from 'zustand';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean; // 앱 초기 인증 확인 중 여부
  login: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoggedIn: false,
  isLoading: true,

  login: (user) => set({ user, isLoggedIn: true, isLoading: false }),
  logout: () => set({ user: null, isLoggedIn: false, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
