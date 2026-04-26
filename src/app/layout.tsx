import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { Providers } from './providers';

const pretendard = localFont({
  src: './pretendard.woff2',
  variable: '--font-sans',
  display: 'swap',
  weight: '45 920',
});

export const metadata: Metadata = {
  title: 'NCS · 직무과제 채용 플랫폼',
  description:
    '국가직무능력표준 기반의 직무 우주를 탐색하세요. 1,083개 직무, 한 화면에.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={`${pretendard.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-[color:var(--color-neutral-800)]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
