"use client";

import { useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Shield, 
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function ConfirmContent() {
  const searchParams = useSearchParams();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [codeError, setCodeError] = useState('');

  const email = searchParams.get('email') || 'your email';
  const type = searchParams.get('type') || 'verification';

  const validateCode = (code: string) => {
    if (!code) {
      return 'Verification code is required';
    }
    if (code.length < 6) {
      return 'Verification code must be at least 6 characters';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCodeError('');

    // Validate code
    const codeValidation = validateCode(code);
    if (codeValidation) {
      setCodeError(codeValidation);
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock success response
      setIsSuccess(true);
    } catch (err) {
      setError('Invalid verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (value: string) => {
    setCode(value);
    if (codeError) {
      setCodeError('');
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'email':
        return 'Email Verification';
      case 'phone':
        return 'Phone Verification';
      case '2fa':
        return 'Two-Factor Authentication';
      default:
        return 'Verification Required';
    }
  };

  const getDescription = () => {
    switch (type) {
      case 'email':
        return `We've sent a verification code to ${email}. Please enter it below to verify your email address.`;
      case 'phone':
        return `We've sent a verification code to your phone number. Please enter it below to verify your phone.`;
      case '2fa':
        return 'Please enter your two-factor authentication code to continue.';
      default:
        return 'Please enter the verification code to continue.';
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-[#1a1a1a] rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-[#00ff88] rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-black" />
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-4">Verification Successful</h1>
            
            <p className="text-[#888] mb-6">
              Your {type === 'email' ? 'email' : type === 'phone' ? 'phone' : 'account'} has been successfully verified.
            </p>
            
            <Link href="/trade">
              <Button className="w-full bg-[#00ff88] text-black hover:bg-[#00cc6a]">
                Continue to Trading
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-[#1a1a1a] rounded-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#00ff88] rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-black" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">{getTitle()}</h1>
            <p className="text-[#888]">
              {getDescription()}
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-white mb-2">
                Verification Code
              </label>
              <Input
                id="code"
                type="text"
                placeholder="Enter verification code"
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                className={`bg-[#0a0a0a] border-[#333] text-white text-center text-lg tracking-widest ${
                  codeError ? 'border-[#ff4444]' : ''
                }`}
                disabled={isLoading}
                maxLength={6}
              />
              {codeError && (
                <p className="text-[#ff4444] text-sm mt-1">{codeError}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading || !code}
              className="w-full bg-[#00ff88] text-black hover:bg-[#00cc6a] disabled:bg-[#333] disabled:text-[#888]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Code'
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <Link href="/auth/signin">
              <Button variant="outline" className="w-full border-[#333] text-white hover:bg-[#333]">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sign In
              </Button>
            </Link>
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-[#888]">
              Didn't receive the code?{' '}
              <button className="text-[#00ff88] hover:underline">
                Resend code
              </button>
            </p>
            <p className="text-sm text-[#888] mt-2">
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

export default function ConfirmPage() {
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
      <ConfirmContent />
    </Suspense>
  );
}
