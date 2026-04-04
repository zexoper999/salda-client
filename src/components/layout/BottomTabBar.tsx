'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  {
    href: '/home',
    label: '홈',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z"
          fill={active ? 'var(--color-primary)' : 'none'}
          stroke={active ? 'var(--color-primary)' : '#9CA3AF'}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: '/subscriptions',
    label: '청약',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect
          x="3" y="3" width="18" height="18" rx="3"
          fill={active ? 'var(--color-primary)' : 'none'}
          stroke={active ? 'var(--color-primary)' : '#9CA3AF'}
          strokeWidth="1.8"
        />
        <path
          d="M7 8H17M7 12H13M7 16H11"
          stroke={active ? '#ffffff' : '#9CA3AF'}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    href: '/shop',
    label: '쇼핑',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M6 2L3 6V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V6L18 2H6Z"
          fill={active ? 'var(--color-primary)' : 'none'}
          stroke={active ? 'var(--color-primary)' : '#9CA3AF'}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M3 6H21M16 10C16 12.21 14.21 14 12 14C9.79 14 8 12.21 8 10"
          stroke={active ? '#ffffff' : '#9CA3AF'}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    href: '/missions',
    label: '미션',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
          fill={active ? 'var(--color-primary)' : 'none'}
          stroke={active ? 'var(--color-primary)' : '#9CA3AF'}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: '/my',
    label: '더보기',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="5" cy="6" r="2" fill={active ? 'var(--color-primary)' : '#9CA3AF'} />
        <circle cx="12" cy="6" r="2" fill={active ? 'var(--color-primary)' : '#9CA3AF'} />
        <circle cx="19" cy="6" r="2" fill={active ? 'var(--color-primary)' : '#9CA3AF'} />
        <circle cx="5" cy="12" r="2" fill={active ? 'var(--color-primary)' : '#9CA3AF'} />
        <circle cx="12" cy="12" r="2" fill={active ? 'var(--color-primary)' : '#9CA3AF'} />
        <circle cx="19" cy="12" r="2" fill={active ? 'var(--color-primary)' : '#9CA3AF'} />
        <circle cx="5" cy="18" r="2" fill={active ? 'var(--color-primary)' : '#9CA3AF'} />
        <circle cx="12" cy="18" r="2" fill={active ? 'var(--color-primary)' : '#9CA3AF'} />
        <circle cx="19" cy="18" r="2" fill={active ? 'var(--color-primary)' : '#9CA3AF'} />
      </svg>
    ),
  },
];

export default function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-[var(--color-border)] z-50">
      <ul className="flex items-center justify-around h-[60px] pb-safe">
        {tabs.map((tab) => {
          const active = pathname === tab.href || pathname.startsWith(tab.href + '/');
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                className="flex flex-col items-center gap-0.5 py-2"
              >
                {tab.icon(active)}
                <span
                  className="text-[10px] font-medium"
                  style={{ color: active ? 'var(--color-primary)' : '#9CA3AF' }}
                >
                  {tab.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
