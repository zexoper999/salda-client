'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { label: '컨텐츠관리', href: '/admin/contents' },
  { label: '회원관리',   href: '/admin/users' },
  { label: '청약관리',   href: '/admin/subscriptions' },
  { label: '쇼핑관리',   href: '/admin/shop' },
  { label: '미션관리',   href: '/admin/missions' },
  { label: '공지사항',   href: '/admin/notices' },
  { label: '문의관리',   href: '/admin/inquiries' },
  { label: 'FAQ관리',    href: '/admin/faq' },
  { label: '알림관리',   href: '/admin/notifications' },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[210px] flex-shrink-0 flex flex-col bg-[#1C2536] min-h-screen">
      {/* 로고 */}
      <div className="h-16 flex items-center px-6">
        <span className="text-white font-bold tracking-widest text-base">
          SALDA <span className="text-xs font-normal text-white/40">살다</span>
        </span>
      </div>

      {/* 구분선 */}
      <div className="border-t border-white/10 mx-4" />

      {/* 메뉴 */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ label, href }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors
                ${active
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'}`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
