import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { QueryClientWrapper } from '@/components/QueryClientWrapper';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { env } from '@/lib/env';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export const metadata: Metadata = {
  title: {
    default: 'Orbitex - Advanced Cryptocurrency Trading Platform',
    template: '%s | Orbitex',
  },
  description: 'Professional-grade cryptocurrency trading platform with lightning-fast execution, advanced security, and institutional tools.',
  keywords: [
    'cryptocurrency',
    'trading',
    'bitcoin',
    'ethereum',
    'crypto exchange',
    'digital assets',
    'trading platform',
    'blockchain',
    'defi',
    'web3'
  ],
  authors: [{ name: 'Orbitex Team' }],
  creator: 'Orbitex',
  publisher: 'Orbitex',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: env.NEXT_PUBLIC_FRONTEND_URL,
    title: 'Orbitex - Advanced Cryptocurrency Trading Platform',
    description: 'Professional-grade cryptocurrency trading platform with lightning-fast execution, advanced security, and institutional tools.',
    siteName: 'Orbitex',
    images: [
      {
        url: `${env.NEXT_PUBLIC_FRONTEND_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Orbitex Trading Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Orbitex - Advanced Cryptocurrency Trading Platform',
    description: 'Professional-grade cryptocurrency trading platform with lightning-fast execution, advanced security, and institutional tools.',
    images: [`${env.NEXT_PUBLIC_FRONTEND_URL}/og-image.png`],
    creator: '@orbitex',
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#00ff88' },
    ],
  },
  manifest: '/site.webmanifest',
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#00ff88" />
        <meta name="msapplication-TileColor" content="#00ff88" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className="font-sans antialiased">
        <ErrorBoundary>
          <QueryClientWrapper>
            <AuthProvider>
              <ThemeProvider>
                <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--trading-bg))] via-[hsl(var(--trading-bg-secondary))] to-[hsl(var(--trading-bg))]">
                  {children}
                </div>
                <Toaster />
              </ThemeProvider>
            </AuthProvider>
          </QueryClientWrapper>
        </ErrorBoundary>
      </body>
    </html>
  );
}
