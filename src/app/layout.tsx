import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { QueryProvider } from '@/providers/QueryProvider';
import { Toaster } from '@/components/ui/toaster';

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
        <QueryProvider>
          <ThemeProvider>
            <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--trading-bg))] via-[hsl(var(--trading-bg-secondary))] to-[hsl(var(--trading-bg))]">
              {children}
            </div>
            <Toaster />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
