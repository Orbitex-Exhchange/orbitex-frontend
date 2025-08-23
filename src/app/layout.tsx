import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { QueryClientWrapper } from '@/components/QueryClientWrapper';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Orbitex - Advanced Cryptocurrency Trading Platform',
  description: 'Professional-grade cryptocurrency trading platform with lightning-fast execution, advanced security, and institutional tools.',
  keywords: 'cryptocurrency, trading, bitcoin, ethereum, crypto exchange, digital assets',
  authors: [{ name: 'Orbitex Team' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Orbitex - Advanced Cryptocurrency Trading Platform',
    description: 'Professional-grade cryptocurrency trading platform with lightning-fast execution, advanced security, and institutional tools.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Orbitex - Advanced Cryptocurrency Trading Platform',
    description: 'Professional-grade cryptocurrency trading platform with lightning-fast execution, advanced security, and institutional tools.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <QueryClientWrapper>
          <AuthProvider>
            <ThemeProvider>
              <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--trading-bg))] via-[hsl(var(--trading-bg-secondary))] to-[hsl(var(--trading-bg))]">
                {children}
              </div>
              <Toaster />
            </ThemeProvider>
          </AuthProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientWrapper>
      </body>
    </html>
  );
}
