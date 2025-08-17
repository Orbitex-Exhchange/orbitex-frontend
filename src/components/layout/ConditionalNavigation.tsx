"use client";

import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from './Navigation';

interface ConditionalNavigationProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export function ConditionalNavigation({ user }: ConditionalNavigationProps) {
  const pathname = usePathname();
  
  // Define pages that should show navigation
  const authenticatedPages = [
    '/trade',
    '/wallets', 
    '/earn',
    '/learn',
    '/profile',
    '/settings',
    '/security',
    '/support',
    '/institutional'
  ];
  
  // Check if current page should show navigation
  const shouldShowNavigation = authenticatedPages.some(page => 
    pathname.startsWith(page)
  );
  
  // Don't show navigation on the home page (landing page) or auth pages
  const isHomePage = pathname === '/';
  const isAuthPage = pathname.startsWith('/auth');
  
  if (isHomePage || isAuthPage) {
    return null;
  }
  
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
          <Navigation user={user} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
