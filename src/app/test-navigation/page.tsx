"use client";

import { Navigation } from '@/components/layout/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestNavigationPage() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--trading-bg))] via-[hsl(var(--trading-bg-secondary))] to-[hsl(var(--trading-bg))]">
      <Navigation user={user} />
      
      <div className="container mx-auto p-6">
        <Card className="border-[hsl(var(--trading-border))] bg-[hsl(var(--trading-bg-secondary))]">
          <CardHeader>
            <CardTitle className="text-white">Navigation Test Page</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-white font-medium mb-2">Authentication Status:</h3>
                <p className="text-[hsl(var(--trading-text-secondary))]">
                  {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
                </p>
              </div>
              
              {user && (
                <div>
                  <h3 className="text-white font-medium mb-2">User Info:</h3>
                  <p className="text-[hsl(var(--trading-text-secondary))]">Email: {user.email}</p>
                  <p className="text-[hsl(var(--trading-text-secondary))]">KYC Level: {user.kyc_level || 0}</p>
                </div>
              )}
              
              <div>
                <h3 className="text-white font-medium mb-2">Test Instructions:</h3>
                <ul className="text-[hsl(var(--trading-text-secondary))] space-y-1">
                  <li>• Click "Trading Tools" to test the dropdown menu</li>
                  <li>• Click the user avatar/email to test the user menu dropdown</li>
                  <li>• Test mobile menu by resizing browser window</li>
                  <li>• Verify all sub-menu items are visible</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
