'use client';

import { useEffect } from 'react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-end justify-center transition-all duration-300
        ${isOpen ? 'visible' : 'invisible'}`}
    >
      {/* 배경 */}
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* 시트 */}
      <div
        className={`relative w-full max-w-[430px] bg-white rounded-t-3xl
          transition-transform duration-300 ease-out
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        {/* 핸들바 */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-200 rounded-full" />

        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 pt-7 pb-4">
          {title ? (
            <h3 className="text-base font-bold text-[var(--color-text-primary)]">{title}</h3>
          ) : (
            <div />
          )}
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center -mr-1"
            aria-label="닫기"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 5L15 15M15 5L5 15" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="px-5 pb-8">{children}</div>
      </div>
    </div>
  );
}
