'use client';

import { useRouter } from 'next/navigation';

interface PageHeaderProps {
  title?: string;
  showBack?: boolean;
  rightSlot?: React.ReactNode;
}

export default function PageHeader({ title, showBack = true, rightSlot }: PageHeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 flex items-center h-14 px-4 bg-white border-b border-[var(--color-border)]">
      {showBack && (
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center w-9 h-9 -ml-1 mr-2"
          aria-label="뒤로가기"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18L9 12L15 6"
              stroke="#111827"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
      {title && (
        <h1 className="flex-1 text-base font-semibold text-[var(--color-text-primary)] truncate">
          {title}
        </h1>
      )}
      {rightSlot && <div className="ml-auto">{rightSlot}</div>}
    </header>
  );
}
