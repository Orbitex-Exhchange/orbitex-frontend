import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import "@radix-ui/themes/styles.css";
import { Theme } from '@radix-ui/themes'
import { Providers } from '@/store/providers'
import Navigation from '@/components/layout/Navigation'
import { ConditionalNavigation } from '@/components/layout/ConditionalNavigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Orbitex - High-Frequency Trading Platform',
  description: 'Advanced cryptocurrency trading platform with real-time data and professional tools',
  keywords: 'cryptocurrency, trading, bitcoin, ethereum, high-frequency trading, HFT',
  authors: [{ name: 'Orbitex Team' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Orbitex - High-Frequency Trading Platform',
    description: 'Advanced cryptocurrency trading platform with real-time data and professional tools',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Orbitex - High-Frequency Trading Platform',
    description: 'Advanced cryptocurrency trading platform with real-time data and professional tools',
  },
  manifest: '/manifest.json',
}

// Mock user data - in real app this would come from authentication
const mockUser = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatar: undefined
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#2563eb" />
      </head>
      <body className={inter.className}>
        <Theme appearance="dark" accentColor="green" radius="medium" scaling="95%">
          <Providers>
            <div className="min-h-screen trading-layout">
              {/* Conditional Navigation - only show on authenticated pages */}
              <ConditionalNavigation user={mockUser} />
              
              {/* Main Content */}
              <main className="flex-1">
                {children}
              </main>
            </div>
          </Providers>
        </Theme>
      </body>
    </html>
  )
}
