"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Mail, 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEmailError('');

    // Validate email
    if (!email) {
      setEmailError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock success response
      setIsSuccess(true);
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailError) {
      setEmailError('');
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
            
            <h1 className="text-2xl font-bold text-white mb-4">Check Your Email</h1>
            
            <p className="text-[#888] mb-6">
              We've sent a password reset link to <span className="text-white font-medium">{email}</span>
            </p>
            
            <div className="bg-[#0a0a0a] rounded-lg p-4 mb-6">
              <p className="text-sm text-[#888]">
                Didn't receive the email? Check your spam folder or try again with a different email address.
              </p>
            </div>
            
            <div className="space-y-3">
              <Button
                onClick={() => {
                  setIsSuccess(false);
                  setEmail('');
                }}
                className="w-full bg-[#00ff88] text-black hover:bg-[#00cc6a]"
              >
                Send Another Email
              </Button>
              
              <Link href="/auth/signin">
                <Button variant="outline" className="w-full border-[#333] text-white hover:bg-[#333]">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Button>
              </Link>
            </div>
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
            <h1 className="text-2xl font-bold text-white mb-2">Forgot Password?</h1>
            <p className="text-[#888]">
              Enter your email address and we'll send you a link to reset your password.
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
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#888] w-5 h-5" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className={`pl-10 bg-[#0a0a0a] border-[#333] text-white ${
                    emailError ? 'border-[#ff4444]' : ''
                  }`}
                  disabled={isLoading}
                />
              </div>
              {emailError && (
                <p className="text-[#ff4444] text-sm mt-1">{emailError}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading || !email}
              className="w-full bg-[#00ff88] text-black hover:bg-[#00cc6a] disabled:bg-[#333] disabled:text-[#888]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Reset Link'
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
              Remember your password?{' '}
              <Link href="/auth/signin" className="text-[#00ff88] hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
