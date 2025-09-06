"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

export default function TestAuthPage() {
  const { user, isAuthenticated, authToken } = useAuth();
  const [localStorageToken, setLocalStorageToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLocalStorageToken(localStorage.getItem('access_token'));
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Auth State Debug</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Auth Context State</h2>
          <pre className="text-sm">
            {JSON.stringify({ isAuthenticated, user, authToken }, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">LocalStorage Token</h2>
          <pre className="text-sm">
            {JSON.stringify({ localStorageToken }, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Environment</h2>
          <pre className="text-sm">
            {JSON.stringify({ 
              NODE_ENV: process.env.NODE_ENV,
              hostname: typeof window !== 'undefined' ? window.location.hostname : 'server'
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
