import type React from 'react';
import type { Metadata } from 'next';
import Script from 'next/script';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Analytics } from '@vercel/analytics/next';
import { ThemeProvider } from '@/contexts/theme-context';
import { Toaster } from 'react-hot-toast';
import { Suspense } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Lifetracker',
  description: 'Lifetracker app',
  generator: 'lautaroblasco.com',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
    >
      <head>
        <Script src="/env-config.js" strategy="beforeInteractive" />
      </head>
      <body>
        <Suspense fallback={null}>
          <ThemeProvider>
            {children}
            <Toaster position="bottom-center" />
          </ThemeProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  );
}
