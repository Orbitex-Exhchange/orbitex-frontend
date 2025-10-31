'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  // AuthGuard is now non-blocking - always render children
  // Pages handle their own authentication checks
  // This prevents premature redirects before localStorage is set after login
  return <>{children}</>;
}

