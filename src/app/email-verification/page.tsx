"use client";

import { useState, useEffect, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Mail, 
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function EmailVerificationContent() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Get email from URL params or localStorage
    const emailFromParams = searchParams.get('email');
    const emailFromStorage = localStorage.getItem('verificationEmail');
    const emailToUse = emailFromParams || emailFromStorage || 'your email';
    setEmail(emailToUse);
  }, [searchParams]);

  const handleResendEmail = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock success response
      setIsSuccess(true);
    } catch (err) {
      setError('Failed to resend verification email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-[#1a1a1a] rounded-lg p-8 text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-[#00ff88] rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-black" />
          </div>
          
          {/* Title */}
          <h1 className="text-2xl font-bold text-white mb-4">Verify Your Email</h1>
          
          {/* Description */}
          <p className="text-[#888] mb-6">
            We've sent a verification link to <span className="text-white font-medium">{email}</span>
          </p>
          
          {/* Instructions */}
          <div className="bg-[#0a0a0a] rounded-lg p-4 mb-6">
            <p className="text-sm text-[#888] mb-3">
              To complete your registration, please click the verification link in the email we just sent you.
            </p>
            <p className="text-sm text-[#888]">
              The link will expire in 24 hours for security reasons.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-[#ff4444]/10 border border-[#ff4444] rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-[#ff4444]" />
                <p className="text-[#ff4444] text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {isSuccess && (
            <div className="bg-[#00ff88]/10 border border-[#00ff88] rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-[#00ff88]" />
                <p className="text-[#00ff88] text-sm">Verification email sent successfully!</p>
              </div>
            </div>
          )}
          
          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={handleResendEmail}
              disabled={isLoading}
              className="w-full bg-[#00ff88] text-black hover:bg-[#00cc6a] disabled:bg-[#333] disabled:text-[#888]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Resend Verification Email
                </>
              )}
            </Button>
            
            <Link href="/auth/signin">
              <Button variant="outline" className="w-full border-[#333] text-white hover:bg-[#333]">
                Back to Sign In
              </Button>
            </Link>
          </div>

          {/* Help Text */}
          <div className="mt-6 space-y-2">
            <p className="text-sm text-[#888]">
              Didn't receive the email? Check your spam folder.
            </p>
            <p className="text-sm text-[#888]">
              Need help?{' '}
              <Link href="/support" className="text-[#00ff88] hover:underline">
                Contact support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EmailVerificationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-[#1a1a1a] rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-[#00ff88] rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-8 h-8 text-black animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">Loading...</h1>
          </div>
        </div>
      </div>
    }>
      <EmailVerificationContent />
    </Suspense>
  );
}
