import { create } from 'zustand';

interface AdminState {
  isLoggedIn: boolean;
  username: string | null;
  login: (username: string) => void;
  logout: () => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  isLoggedIn: false,
  username: null,
  login: (username) => set({ isLoggedIn: true, username }),
  logout: () => set({ isLoggedIn: false, username: null }),
}));
