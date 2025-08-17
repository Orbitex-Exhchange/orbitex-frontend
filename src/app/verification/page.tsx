"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Mail,
  Smartphone
} from 'lucide-react';
import Link from 'next/link';

export default function VerificationPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<'email' | 'phone'>('email');

  const handleVerification = async (method: 'email' | 'phone') => {
    setIsLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock success response
      setIsSuccess(true);
    } catch (err) {
      setError(`Failed to send ${method} verification. Please try again.`);
    } finally {
      setIsLoading(false);
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
            
            <h1 className="text-2xl font-bold text-white mb-4">Verification Sent</h1>
            
            <p className="text-[#888] mb-6">
              We've sent a verification {selectedMethod === 'email' ? 'email' : 'SMS'} to your {selectedMethod}.
              Please check your {selectedMethod === 'email' ? 'inbox' : 'messages'} and follow the instructions.
            </p>
            
            <Link href="/confirm">
              <Button className="w-full bg-[#00ff88] text-black hover:bg-[#00cc6a]">
                Continue to Verification
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
            <h1 className="text-2xl font-bold text-white mb-2">Account Verification</h1>
            <p className="text-[#888]">
              Please verify your account to continue. Choose your preferred verification method.
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

          {/* Verification Methods */}
          <div className="space-y-4 mb-6">
            <button
              onClick={() => setSelectedMethod('email')}
              className={`w-full p-4 rounded-lg border-2 transition-colors ${
                selectedMethod === 'email'
                  ? 'border-[#00ff88] bg-[#00ff88]/10'
                  : 'border-[#333] hover:border-[#555]'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  selectedMethod === 'email' ? 'bg-[#00ff88]' : 'bg-[#333]'
                }`}>
                  <Mail className={`w-5 h-5 ${selectedMethod === 'email' ? 'text-black' : 'text-white'}`} />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-white">Email Verification</h3>
                  <p className="text-sm text-[#888]">Receive a verification code via email</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setSelectedMethod('phone')}
              className={`w-full p-4 rounded-lg border-2 transition-colors ${
                selectedMethod === 'phone'
                  ? 'border-[#00ff88] bg-[#00ff88]/10'
                  : 'border-[#333] hover:border-[#555]'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  selectedMethod === 'phone' ? 'bg-[#00ff88]' : 'bg-[#333]'
                }`}>
                  <Smartphone className={`w-5 h-5 ${selectedMethod === 'phone' ? 'text-black' : 'text-white'}`} />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-white">SMS Verification</h3>
                  <p className="text-sm text-[#888]">Receive a verification code via SMS</p>
                </div>
              </div>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => handleVerification(selectedMethod)}
              disabled={isLoading}
              className="w-full bg-[#00ff88] text-black hover:bg-[#00cc6a] disabled:bg-[#333] disabled:text-[#888]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending Verification...
                </>
              ) : (
                `Send ${selectedMethod === 'email' ? 'Email' : 'SMS'} Verification`
              )}
            </Button>
            
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
