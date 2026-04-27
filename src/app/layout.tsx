import type { Metadata, Viewport } from 'next';
import './globals.css';
import QueryProvider from '@/providers/QueryProvider';
import AuthProvider from '@/providers/AuthProvider';
import Toast from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: 'SALDA 살다',
  description: '미션으로 응모권을 모아 전세·차량 청약에 도전하세요',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <QueryProvider>
          <AuthProvider>
            <div id="app-container">
              {children}
              <Toast />
            </div>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
