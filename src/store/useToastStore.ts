import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info';

interface ToastState {
  visible: boolean;
  type: ToastType;
  message: string;
  show: (type: ToastType, message: string) => void;
  hide: () => void;
}

let timer: ReturnType<typeof setTimeout> | null = null;

export const useToastStore = create<ToastState>((set) => ({
  visible: false,
  type: 'info',
  message: '',
  show: (type, message) => {
    if (timer) clearTimeout(timer);
    set({ visible: true, type, message });
    timer = setTimeout(() => set({ visible: false }), 3000);
  },
  hide: () => {
    if (timer) clearTimeout(timer);
    set({ visible: false });
  },
}));
