'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Navigation } from '@/components/layout/Navigation';
import { 
  Shield,
  Lock,
  Smartphone,
  Mail,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Clock,
  Key,
  UserCheck,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function SecurityPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { authToken, isAuthenticated, user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    emailNotifications: true,
    smsNotifications: false,
    loginAlerts: true,
    withdrawalAlerts: true,
    suspiciousActivityAlerts: true
  });

  // Mock security events
  const [securityEvents] = useState([
    {
      id: '1',
      type: 'login',
      description: 'Successful login from New York, NY',
      timestamp: '2024-01-20 14:30:00',
      ip: '192.168.1.1',
      device: 'Chrome on Windows',
      status: 'success'
    },
    {
      id: '2',
      type: 'password_change',
      description: 'Password changed successfully',
      timestamp: '2024-01-19 10:15:00',
      ip: '192.168.1.1',
      device: 'Chrome on Windows',
      status: 'success'
    },
    {
      id: '3',
      type: 'failed_login',
      description: 'Failed login attempt from unknown location',
      timestamp: '2024-01-18 22:45:00',
      ip: '203.0.113.1',
      device: 'Unknown',
      status: 'warning'
    }
  ]);

  // Show authentication required message if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--trading-bg))] via-[hsl(var(--trading-bg-secondary))] to-[hsl(var(--trading-bg))]">
        <Navigation user={user} />
        <div className="container mx-auto p-6">
          <Card className="border-yellow-500 bg-yellow-900/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <Shield className="h-12 w-12 mx-auto text-yellow-400 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Authentication Required</h3>
                <p className="text-yellow-200 mb-4">
                  Please sign in to access security settings.
                </p>
                <Button variant="outline" onClick={() => router.push('/auth/signin')}>
                  Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirm password do not match.",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 8 characters long.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Password Changed",
        description: "Your password has been updated successfully.",
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to change password. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnableTwoFactor = async () => {
    setIsLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSecuritySettings(prev => ({ ...prev, twoFactorAuth: true }));
      toast({
        title: "Two-Factor Authentication Enabled",
        description: "Your account is now protected with 2FA.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to enable two-factor authentication.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPhone = async () => {
    if (!phoneNumber) {
      toast({
        title: "Phone Number Required",
        description: "Please enter your phone number.",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Verification Code Sent",
        description: "A verification code has been sent to your phone.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send verification code.",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login':
        return <UserCheck className="h-4 w-4" />;
      case 'password_change':
        return <Key className="h-4 w-4" />;
      case 'failed_login':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getEventColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--trading-bg))] via-[hsl(var(--trading-bg-secondary))] to-[hsl(var(--trading-bg))]">
      <Navigation user={user} />
      
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Security</h1>
            <p className="text-gray-300">Manage your account security settings</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Security Settings */}
          <div className="space-y-6">
            {/* Two-Factor Authentication */}
            <Card className="border-[hsl(var(--trading-border))] bg-[hsl(var(--trading-bg-secondary))]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Two-Factor Authentication
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Add an extra layer of security to your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-[hsl(var(--trading-border))] rounded-lg">
                  <div>
                    <h3 className="text-white font-medium">SMS Authentication</h3>
                    <p className="text-gray-400 text-sm">Receive codes via SMS</p>
                  </div>
                  <Switch
                    checked={securitySettings.twoFactorAuth}
                    onCheckedChange={handleEnableTwoFactor}
                    disabled={isLoading}
                  />
                </div>
                
                {!securitySettings.twoFactorAuth && (
                  <div className="space-y-3">
                    <Label htmlFor="phone" className="text-white">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="bg-[hsl(var(--trading-bg-tertiary))] border-[hsl(var(--trading-border))] text-[hsl(var(--trading-text))]"
                    />
                    <Button
                      onClick={handleVerifyPhone}
                      disabled={isVerifying || !phoneNumber}
                      className="w-full"
                    >
                      {isVerifying ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Verification Code
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Password Change */}
            <Card className="border-[hsl(var(--trading-border))] bg-[hsl(var(--trading-bg-secondary))]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Change Password
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Update your account password
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-white">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="bg-[hsl(var(--trading-bg-tertiary))] border-[hsl(var(--trading-border))] text-[hsl(var(--trading-text))]"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-white">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-[hsl(var(--trading-bg-tertiary))] border-[hsl(var(--trading-border))] text-[hsl(var(--trading-text))]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-white">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-[hsl(var(--trading-bg-tertiary))] border-[hsl(var(--trading-border))] text-[hsl(var(--trading-text))]"
                  />
                </div>
                <Button
                  onClick={handleChangePassword}
                  disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
                  className="w-full"
                >
                  {isLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Change Password
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Security Notifications */}
            <Card className="border-[hsl(var(--trading-border))] bg-[hsl(var(--trading-bg-secondary))]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Notifications
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Choose what security alerts you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border border-[hsl(var(--trading-border))] rounded-lg">
                  <div>
                    <h3 className="text-white font-medium">Login Alerts</h3>
                    <p className="text-gray-400 text-sm">Get notified of new logins</p>
                  </div>
                  <Switch
                    checked={securitySettings.loginAlerts}
                    onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, loginAlerts: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border border-[hsl(var(--trading-border))] rounded-lg">
                  <div>
                    <h3 className="text-white font-medium">Withdrawal Alerts</h3>
                    <p className="text-gray-400 text-sm">Get notified of withdrawals</p>
                  </div>
                  <Switch
                    checked={securitySettings.withdrawalAlerts}
                    onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, withdrawalAlerts: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border border-[hsl(var(--trading-border))] rounded-lg">
                  <div>
                    <h3 className="text-white font-medium">Suspicious Activity</h3>
                    <p className="text-gray-400 text-sm">Get notified of suspicious activity</p>
                  </div>
                  <Switch
                    checked={securitySettings.suspiciousActivityAlerts}
                    onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, suspiciousActivityAlerts: checked }))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Security Events */}
          <div className="space-y-6">
            <Card className="border-[hsl(var(--trading-border))] bg-[hsl(var(--trading-bg-secondary))]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5" />
                  Recent Security Events
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Monitor your account activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {securityEvents.map((event) => (
                    <div key={event.id} className="flex items-start space-x-3 p-3 border border-[hsl(var(--trading-border))] rounded-lg">
                      <div className={`mt-1 ${getEventColor(event.status)}`}>
                        {getEventIcon(event.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-white">{event.description}</p>
                          <Badge variant={event.status === 'success' ? 'default' : 'secondary'} className="text-xs">
                            {event.status}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-400 mt-1">
                          <span>{event.timestamp}</span>
                          <span>IP: {event.ip}</span>
                          <span>{event.device}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Security Tips */}
            <Card className="border-[hsl(var(--trading-border))] bg-[hsl(var(--trading-bg-secondary))]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-white">Use a strong password</p>
                    <p className="text-xs text-gray-400">Include uppercase, lowercase, numbers, and symbols</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-white">Enable two-factor authentication</p>
                    <p className="text-xs text-gray-400">Add an extra layer of security to your account</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-white">Monitor your account activity</p>
                    <p className="text-xs text-gray-400">Regularly check for suspicious login attempts</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-white">Keep your devices secure</p>
                    <p className="text-xs text-gray-400">Use antivirus software and keep systems updated</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
