'use client';

import { useToastStore } from '@/store/useToastStore';

const ICON = {
  success: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="9" fill="rgba(255,255,255,0.25)" />
      <path d="M6 10.5L8.5 13L14 7.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  error: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="9" fill="rgba(255,255,255,0.25)" />
      <path d="M7 7L13 13M13 7L7 13" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  info: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="9" fill="rgba(255,255,255,0.25)" />
      <path d="M10 9V14" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="10" cy="6.5" r="1" fill="white" />
    </svg>
  ),
};

const BG: Record<string, string> = {
  success: '#22C55E',
  error:   '#EF4444',
  info:    '#4590F9',
};

export default function Toast() {
  const { visible, type, message, hide } = useToastStore();

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-[200] w-[calc(100%-40px)] max-w-[390px]
        transition-all duration-300 ease-out
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none'}`}
    >
      <div
        className="flex items-center gap-3 px-4 py-3.5 rounded-2xl shadow-xl cursor-pointer"
        style={{ background: BG[type] }}
        onClick={hide}
      >
        {ICON[type]}
        <p className="flex-1 text-sm font-semibold text-white leading-snug">{message}</p>
      </div>
    </div>
  );
}
