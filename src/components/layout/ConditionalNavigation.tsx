"use client";

import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation } from './Navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ConditionalNavigationProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export function ConditionalNavigation({ user }: ConditionalNavigationProps) {
  const pathname = usePathname();
  const { user: authUser, isAuthenticated } = useAuth();
  
  // Define pages that should show navigation
  const authenticatedPages = [
    '/trade',
    '/wallets', 
    '/dashboard',
    '/profile',
    '/settings',
    '/security',
    '/api-keys',
    '/withdraw',
    '/deposit',
    '/portfolio',
    '/analytics',
    '/alerts',
    '/history',
    '/support',
    '/institutional'
  ];
  
  // Define pages that should never show navigation
  const excludedPages = [
    '/',
    '/auth/signin',
    '/auth/signup',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/verify-email',
    '/test-navigation'
  ];
  
  // Check if current page should show navigation
  const shouldShowNavigation = authenticatedPages.some(page => 
    pathname.startsWith(page)
  );
  
  // Check if current page is excluded
  const isExcludedPage = excludedPages.some(page => 
    pathname === page || pathname.startsWith(page)
  );
  
  // Don't show navigation on excluded pages
  if (isExcludedPage) {
    return null;
  }
  
  // Use auth user if available, otherwise use prop user
  const currentUser = authUser || user;
  
  // Show navigation with smooth animation for authenticated pages
  return (
    <AnimatePresence>
      {shouldShowNavigation && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <Navigation user={currentUser} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
