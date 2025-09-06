"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Eye, 
  EyeOff,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle,
  Loader2,
  Shield,
  Smartphone,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

interface SignInFormData {
  email: string;
  password: string;
  otpCode: string;
}

export default function SignInPage() {
  const router = useRouter();
  const { login, refreshAuthState, isAuthenticated, user } = useAuth();
  const [formData, setFormData] = useState<SignInFormData>({
    email: '',
    password: '',
    otpCode: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<string>('');
  const [rememberMe, setRememberMe] = useState(false);

  // Debug auth state changes
  useEffect(() => {
    console.log('Auth state changed:', { isAuthenticated, user });
  }, [isAuthenticated, user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (showOtp && !formData.otpCode) {
      newErrors.otpCode = 'OTP code is required';
    } else if (showOtp && formData.otpCode.length !== 6) {
      newErrors.otpCode = 'OTP code must be 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});
    setSuccess('');
    
    try {
      let loginSuccess = false;
      
      // Check if this is a development login
      const isDevelopment = process.env.NODE_ENV === 'development' || 
                           (typeof window !== 'undefined' && window.location.hostname === 'localhost');
      
      if (isDevelopment && formData.email === 'demo@orbitex.com' && formData.password === 'demo123') {
        // Development login - create mock user
        const mockUser = {
          id: 'demo_user_123',
          email: 'demo@orbitex.com',
          role: 'member',
          kyc_level: 2,
          email_verified: true,
          phone_verified: true,
          two_factor_enabled: false,
        };
        
        const mockToken = `demo_token_${Date.now()}`;
        
        // Store in localStorage
        localStorage.setItem('access_token', mockToken);
        localStorage.setItem('refresh_token', mockToken);
        
        // Update auth context and wait for it to complete
        await refreshAuthState();
        loginSuccess = true;
        
        console.log('Development login successful with demo user');
      } else if (showOtp && formData.otpCode) {
        // Handle 2FA login with authService directly
        const { authService } = await import('@/lib/auth');
        const result = await authService.login(formData.email, formData.password, formData.otpCode);
        
        if (result.success) {
          // Update AuthContext state manually
          localStorage.setItem('access_token', result.token);
          refreshAuthState(); // Refresh the auth context state
          loginSuccess = true;
        } else {
          setErrors({ general: 'Invalid 2FA code. Please try again.' });
        }
      } else {
        // Use the login function from AuthContext for initial login
        loginSuccess = await login(formData.email, formData.password);
      }
      
      if (loginSuccess) {
        setSuccess('Login successful! Redirecting...');
        
        console.log('Login successful, about to redirect...');
        console.log('Current auth state:', { isAuthenticated, user });
        
        // Redirect to dashboard immediately after successful login
        console.log('Executing redirect to dashboard...');
        router.push('/dashboard');
      } else {
        setErrors({ general: 'Login failed. Please check your credentials and try again.' });
      }
      
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.message?.toLowerCase().includes('2fa') || error.message?.toLowerCase().includes('otp')) {
        setShowOtp(true);
        setErrors({ general: 'Please enter your 2FA code' });
      } else if (error.message?.includes('Invalid credentials')) {
        setErrors({ general: 'Invalid email or password' });
      } else if (error.message?.includes('Account locked')) {
        setErrors({ general: 'Account is temporarily locked. Please try again later.' });
      } else {
        setErrors({ general: error.message || 'Login failed. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--trading-bg))] via-[hsl(var(--trading-bg-secondary))] to-[hsl(var(--trading-bg))] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center text-[hsl(var(--trading-text-secondary))] hover:text-[hsl(var(--trading-text))] transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <div className="h-12 w-12 bg-gradient-to-r from-[hsl(var(--trading-accent))] to-[hsl(var(--trading-accent-secondary))] rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">O</span>
            </div>
            <span className="text-3xl font-bold text-gradient-primary">Orbitex</span>
          </div>
          <p className="text-[hsl(var(--trading-text-secondary))]">Sign in to your account</p>
        </div>

        <Card className="border-[hsl(var(--trading-border))] bg-[hsl(var(--trading-bg-secondary))] shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-white text-center">Welcome back</CardTitle>
            <CardDescription className="text-[hsl(var(--trading-text-secondary))] text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Alert */}
              {errors.general && (
                <Alert variant="destructive" className="border-red-500 bg-red-900/20">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-300">{errors.general}</AlertDescription>
                </Alert>
              )}

              {/* Success Alert */}
              {success && (
                <Alert className="border-green-500 bg-green-900/20">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <AlertDescription className="text-green-300">{success}</AlertDescription>
                </Alert>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[hsl(var(--trading-text))]">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[hsl(var(--trading-text-muted))]" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`pl-10 bg-[hsl(var(--trading-bg-tertiary))] border-[hsl(var(--trading-border))] text-[hsl(var(--trading-text))] placeholder-[hsl(var(--trading-text-muted))] focus:ring-2 focus:ring-[hsl(var(--trading-accent))] focus:border-transparent ${
                      errors.email ? 'border-red-500' : ''
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-400">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[hsl(var(--trading-text))]">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[hsl(var(--trading-text-muted))]" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`pl-10 pr-10 bg-[hsl(var(--trading-bg-tertiary))] border-[hsl(var(--trading-border))] text-[hsl(var(--trading-text))] placeholder-[hsl(var(--trading-text-muted))] focus:ring-2 focus:ring-[hsl(var(--trading-accent))] focus:border-transparent ${
                      errors.password ? 'border-red-500' : ''
                    }`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-[hsl(var(--trading-text-muted))] hover:text-[hsl(var(--trading-text))]"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-400">{errors.password}</p>
                )}
                
                {/* Development Login Hint */}
                {(process.env.NODE_ENV === 'development' || (typeof window !== 'undefined' && window.location.hostname === 'localhost')) && (
                  <div className="mt-2 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                    <p className="text-xs text-blue-300">
                      <strong>Development Mode:</strong> Use <code className="bg-blue-800/50 px-1 rounded">demo@orbitex.com</code> / <code className="bg-blue-800/50 px-1 rounded">demo123</code> for quick login
                    </p>
                  </div>
                )}
              </div>

              {/* 2FA Code Field */}
              {showOtp && (
                <div className="space-y-2">
                  <Label htmlFor="otpCode" className="text-[hsl(var(--trading-text))]">2FA Code</Label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[hsl(var(--trading-text-muted))]" />
                    <Input
                      id="otpCode"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={formData.otpCode}
                      onChange={(e) => handleInputChange('otpCode', e.target.value)}
                      maxLength={6}
                      className={`pl-10 bg-[hsl(var(--trading-bg-tertiary))] border-[hsl(var(--trading-border))] text-[hsl(var(--trading-text))] placeholder-[hsl(var(--trading-text-muted))] focus:ring-2 focus:ring-[hsl(var(--trading-accent))] focus:border-transparent ${
                        errors.otpCode ? 'border-red-500' : ''
                      }`}
                    />
                  </div>
                  {errors.otpCode && (
                    <p className="text-sm text-red-400">{errors.otpCode}</p>
                  )}
                </div>
              )}

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="remember" 
                    checked={rememberMe}
                    onChange={setRememberMe}
                    className="border-[hsl(var(--trading-border))] data-[state=checked]:bg-[hsl(var(--trading-accent))] data-[state=checked]:border-[hsl(var(--trading-accent))]" 
                  />
                  <Label htmlFor="remember" className="text-sm text-[hsl(var(--trading-text-secondary))]">Remember me</Label>
                </div>
                <Link 
                  href="/auth/forgot-password" 
                  className="text-sm text-[hsl(var(--trading-accent))] hover:text-[hsl(var(--trading-accent-secondary))] transition-colors duration-200"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full btn-gradient-primary h-12 text-lg font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            <Separator className="bg-[hsl(var(--trading-border))]" />

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-[hsl(var(--trading-text-secondary))]">
                Don't have an account?{' '}
                <Link 
                  href="/auth/signup" 
                  className="text-[hsl(var(--trading-accent))] hover:text-[hsl(var(--trading-accent-secondary))] font-medium transition-colors duration-200"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center space-x-2 text-[hsl(var(--trading-text-muted))] text-sm">
            <Shield className="h-4 w-4" />
            <span>Your data is protected with bank-level security</span>
          </div>
        </div>

        {/* Demo Credentials (for testing) */}
        <div className="mt-4 p-4 border border-[hsl(var(--trading-border))] rounded-lg bg-[hsl(var(--trading-bg-tertiary))]">
          <h3 className="text-sm font-medium text-[hsl(var(--trading-text))] mb-2">Demo Credentials (for testing):</h3>
          <div className="space-y-1 text-xs text-[hsl(var(--trading-text-secondary))]">
            <p><strong>Email:</strong> user@orbitex.com</p>
            <p><strong>Password:</strong> DemoUser123!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
