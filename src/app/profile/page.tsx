"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Navigation } from '@/components/layout/Navigation';
import {
  User,
  Mail,
  Phone,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
  Edit,
  Save,
  X,
  LogOut,
  Settings,
  Key,
  Calendar,
  MapPin
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile, useUpdateProfile, useUserPhones, useCreatePhone, useVerifyPhone } from '@/lib/api/services/user';

interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  country?: string;
  role: string;
  kyc_level: number;
  kyc_status: string;
  email_verified: boolean;
  phone_verified: boolean;
  two_factor_enabled: boolean;
  created_at: string;
  last_login?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated, user, logout } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    country: ''
  });

  // Get real profile data from API
  const { data: profile, isLoading, error: profileError } = useUserProfile();
  const { data: phones = [] } = useUserPhones();
  const updateProfileMutation = useUpdateProfile();
  const createPhoneMutation = useCreatePhone();
  const verifyPhoneMutation = useVerifyPhone();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/signin');
      return;
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (profile) {
      const profileData = profile?.profiles?.[0];
      setEditForm({
        first_name: profileData?.first_name || '',
        last_name: profileData?.last_name || '',
        phone: phones?.[0]?.number || '',
        country: profileData?.country || ''
      });
    }
  }, [profile, phones]);

  const handleLogout = () => {
    logout();
    router.push('/auth/signin');
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      await updateProfileMutation.mutateAsync(editForm);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
      setError('Failed to update profile. Please try again.');
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getKycLevelBadge = (level: number) => {
    const levels = {
      0: { label: 'Level 0', color: 'bg-gray-100 text-gray-800' },
      1: { label: 'Level 1', color: 'bg-blue-100 text-blue-800' },
      2: { label: 'Level 2', color: 'bg-green-100 text-green-800' },
      3: { label: 'Level 3', color: 'bg-purple-100 text-purple-800' }
    };

    const levelInfo = levels[level as keyof typeof levels] || levels[0];
    return <Badge className={levelInfo.color}>{levelInfo.label}</Badge>;
  };

  const getKycStatusBadge = (status: string) => {
    const statuses = {
      'pending': { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
      'approved': { label: 'Approved', color: 'bg-green-100 text-green-800' },
      'rejected': { label: 'Rejected', color: 'bg-red-100 text-red-800' },
      'under_review': { label: 'Under Review', color: 'bg-blue-100 text-blue-800' }
    };

    const statusInfo = statuses[status as keyof typeof statuses] || statuses.pending;
    return <Badge className={statusInfo.color}>{statusInfo.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-600" />
          <p className="text-gray-600">Failed to load profile</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--trading-bg))] via-[hsl(var(--trading-bg-secondary))] to-[hsl(var(--trading-bg))]">
      <Navigation user={user} />
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Profile</h1>
            <p className="text-gray-300">Manage your account settings and preferences</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="border-[hsl(var(--trading-border))] text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-secondary))]">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="border-red-500 bg-red-900/20">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-300">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-500 bg-green-900/20">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-green-300">{success}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-[hsl(var(--trading-bg-secondary))] border border-[hsl(var(--trading-border))]">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[hsl(var(--trading-accent))] data-[state=active]:text-white">Overview</TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-[hsl(var(--trading-accent))] data-[state=active]:text-white">Security</TabsTrigger>
            <TabsTrigger value="kyc" className="data-[state=active]:bg-[hsl(var(--trading-accent))] data-[state=active]:text-white">KYC Status</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-[hsl(var(--trading-accent))] data-[state=active]:text-white">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card className="border-[hsl(var(--trading-border))] bg-[hsl(var(--trading-bg-secondary))]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Personal Information</CardTitle>
                    <CardDescription className="text-gray-300">Update your personal details</CardDescription>
                  </div>
                  {!isEditing ? (
                    <Button variant="outline" onClick={() => setIsEditing(true)} className="border-[hsl(var(--trading-border))] text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))]">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button onClick={handleSaveProfile} disabled={isSaving}>
                        {isSaving ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Save
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)} className="border-[hsl(var(--trading-border))] text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))]">
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name" className="text-white">First Name</Label>
                    <Input
                      id="first_name"
                      value={editForm.first_name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, first_name: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="Enter your first name"
                      className="bg-[hsl(var(--trading-bg-tertiary))] border-[hsl(var(--trading-border))] text-[hsl(var(--trading-text))] placeholder:text-[hsl(var(--trading-text-muted))]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name" className="text-white">Last Name</Label>
                    <Input
                      id="last_name"
                      value={editForm.last_name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, last_name: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="Enter your last name"
                      className="bg-[hsl(var(--trading-bg-tertiary))] border-[hsl(var(--trading-border))] text-[hsl(var(--trading-text))] placeholder:text-[hsl(var(--trading-text-muted))]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">Email</Label>
                    <Input
                      id="email"
                      value={profile?.email || ''}
                      disabled
                      className="bg-[hsl(var(--trading-bg-tertiary))] border-[hsl(var(--trading-border))] text-[hsl(var(--trading-text))] opacity-50"
                    />
                    <div className="flex items-center text-sm text-gray-400">
                      {profile?.state === 'active' ? (
                        <CheckCircle className="h-4 w-4 mr-1 text-green-400" />
                      ) : (
                        <AlertCircle className="h-4 w-4 mr-1 text-yellow-400" />
                      )}
                      {profile?.state === 'active' ? 'Verified' : 'Not verified'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-white">Phone</Label>
                    <Input
                      id="phone"
                      value={editForm.phone}
                      onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="Enter your phone number"
                      className="bg-[hsl(var(--trading-bg-tertiary))] border-[hsl(var(--trading-border))] text-[hsl(var(--trading-text))] placeholder:text-[hsl(var(--trading-text-muted))]"
                    />
                    {phones?.[0]?.validated_at && (
                      <div className="flex items-center text-sm text-green-400">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Verified
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-white">Country</Label>
                    <Input
                      id="country"
                      value={editForm.country}
                      onChange={(e) => setEditForm(prev => ({ ...prev, country: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="Enter your country"
                      className="bg-[hsl(var(--trading-bg-tertiary))] border-[hsl(var(--trading-border))] text-[hsl(var(--trading-text))] placeholder:text-[hsl(var(--trading-text-muted))]"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Your account details and status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Role</p>
                      <p className="text-sm text-gray-500 capitalize">{profile?.role || 'member'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Member Since</p>
                      <p className="text-sm text-gray-500">
                        {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your account security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Key className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-500">
                        {profile?.otp ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                  </div>
                  <Link href="/auth/2fa">
                    <Button variant="outline" size="sm">
                      {profile?.otp ? 'Manage' : 'Enable'}
                    </Button>
                  </Link>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Change Password</p>
                      <p className="text-sm text-gray-500">Update your account password</p>
                    </div>
                  </div>
                  <Link href="/auth/change-password">
                    <Button variant="outline" size="sm">
                      Change
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="kyc" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>KYC Status</CardTitle>
                <CardDescription>Your Know Your Customer verification status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">KYC Level</p>
                      <p className="text-sm text-gray-500">Current verification level</p>
                    </div>
                    {getKycLevelBadge(profile?.level || 0)}
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">KYC Status</p>
                      <p className="text-sm text-gray-500">Verification status</p>
                    </div>
                    {getKycStatusBadge(profile?.state || 'pending')}
                  </div>
                </div>

                <div className="mt-6">
                  <Link href="/verification">
                    <Button className="w-full">
                      Complete KYC Verification
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-500">
                  Additional settings and preferences will be available here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
