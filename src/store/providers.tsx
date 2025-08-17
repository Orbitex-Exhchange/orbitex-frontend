'use client';

import React from 'react';
import { Provider as JotaiProvider } from 'jotai';
import { ThemeProvider } from 'next-themes';

// ===== MODERN STATE MANAGEMENT PROVIDERS =====

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <JotaiProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
        {children}
      </ThemeProvider>
    </JotaiProvider>
  );
}

// ===== LEGACY REDUX COMPATIBILITY =====
// These exports maintain compatibility with existing components during migration

// Mock Redux Provider for compatibility
export const ReduxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

// Export both for compatibility
export { Providers as default };
