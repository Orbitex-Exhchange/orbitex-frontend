"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Shield, 
  Key, 
  Activity,
  Copy,
  Eye,
  EyeOff,
  Edit,
  Check,
  X,
  QrCode,
  Smartphone,
  Mail,
  Phone,
  Camera,
  Settings,
  Bell,
  CreditCard,
  Wallet,
  BarChart3,
  Plus
} from 'lucide-react';
import { formatNumber, formatCurrency } from '@/lib/utils';

interface UserProfile {
  id: number;
  email: string;
  level: number;
  otp: boolean;
  role: string;
  state: string;
  uid: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  secret: string;
  permissions: string[];
  state: 'active' | 'disabled';
  createdAt: string;
  lastUsed?: string;
}

interface ActivityLog {
  id: string;
  action: string;
  ip: string;
  userAgent: string;
  createdAt: string;
  status: 'success' | 'failed';
}

const mockUser: UserProfile = {
  id: 1,
  email: 'user@example.com',
  level: 2,
  otp: true,
  role: 'user',
  state: 'active',
  uid: 'mock-uid-123',
  firstName: 'John',
  lastName: 'Doe',
  phone: '+1234567890',
};

const mockApiKeys: ApiKey[] = [
  {
    id: '1',
    name: 'Trading Bot',
    key: 'pk_test_1234567890abcdef',
    secret: 'sk_test_1234567890abcdef',
    permissions: ['read', 'trade'],
    state: 'active',
    createdAt: '2024-01-15T10:30:00Z',
    lastUsed: '2024-01-20T14:22:00Z',
  },
  {
    id: '2',
    name: 'Mobile App',
    key: 'pk_test_abcdef1234567890',
    secret: 'sk_test_abcdef1234567890',
    permissions: ['read'],
    state: 'disabled',
    createdAt: '2024-01-10T09:15:00Z',
  },
];

const mockActivities: ActivityLog[] = [
  {
    id: '1',
    action: 'Login',
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    createdAt: '2024-01-20T14:22:00Z',
    status: 'success',
  },
  {
    id: '2',
    action: 'API Key Created',
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    createdAt: '2024-01-15T10:30:00Z',
    status: 'success',
  },
  {
    id: '3',
    action: 'Failed Login Attempt',
    ip: '203.0.113.45',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    createdAt: '2024-01-19T08:15:00Z',
    status: 'failed',
  },
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'account' | 'security' | 'api-keys' | 'activity'>('account');
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  const handleEdit = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditValues(prev => ({ ...prev, [field]: currentValue }));
  };

  const handleSave = (field: string) => {
    // Here you would typically make an API call to update the user profile
    console.log(`Saving ${field}:`, editValues[field]);
    setEditingField(null);
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditValues({});
  };

  const toggleSecret = (keyId: string) => {
    setShowSecrets(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could show a toast notification here
      console.log('Copied to clipboard');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const renderAccountTab = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-[#1a1a1a] rounded-lg p-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-20 h-20 bg-[#333] rounded-full flex items-center justify-center">
              {mockUser.avatar ? (
                <img src={mockUser.avatar} alt="Avatar" className="w-full h-full rounded-full" />
              ) : (
                <User className="w-10 h-10 text-[#888]" />
              )}
            </div>
            <button className="absolute bottom-0 right-0 bg-[#00ff88] text-black p-1 rounded-full">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-white">
              {mockUser.firstName} {mockUser.lastName}
            </h2>
            <p className="text-[#888]">{mockUser.email}</p>
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant="outline" className="text-[#00ff88] border-[#00ff88]">
                Level {mockUser.level}
              </Badge>
              <Badge variant="outline" className="text-[#00ff88] border-[#00ff88]">
                {mockUser.state}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="bg-[#1a1a1a] rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Profile Information</h3>
        <div className="space-y-4">
          {[
            { label: 'First Name', field: 'firstName', value: mockUser.firstName || '', icon: User },
            { label: 'Last Name', field: 'lastName', value: mockUser.lastName || '', icon: User },
            { label: 'Email', field: 'email', value: mockUser.email, icon: Mail },
            { label: 'Phone', field: 'phone', value: mockUser.phone || '', icon: Phone },
          ].map(({ label, field, value, icon: Icon }) => (
            <div key={field} className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg">
              <div className="flex items-center space-x-3">
                <Icon className="w-5 h-5 text-[#888]" />
                <div>
                  <p className="text-sm text-[#888]">{label}</p>
                  {editingField === field ? (
                    <Input
                      value={editValues[field] || ''}
                      onChange={(e) => setEditValues(prev => ({ ...prev, [field]: e.target.value }))}
                      className="bg-[#1a1a1a] border-[#333] text-white mt-1"
                    />
                  ) : (
                    <p className="text-white">{value || 'Not set'}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {editingField === field ? (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleSave(field)}
                      className="bg-[#00ff88] text-black hover:bg-[#00cc6a]"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancel}
                      className="border-[#333] text-white hover:bg-[#333]"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(field, value)}
                    className="border-[#333] text-white hover:bg-[#333]"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      {/* Two-Factor Authentication */}
      <div className="bg-[#1a1a1a] rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#00ff88] rounded-lg">
              <Shield className="w-6 h-6 text-black" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Two-Factor Authentication</h3>
              <p className="text-[#888]">Add an extra layer of security to your account</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant={mockUser.otp ? "default" : "outline"} 
                   className={mockUser.otp ? "bg-[#00ff88] text-black" : "border-[#333] text-white"}>
              {mockUser.otp ? 'Enabled' : 'Disabled'}
            </Badge>
            <Button className="bg-[#00ff88] text-black hover:bg-[#00cc6a]">
              {mockUser.otp ? 'Manage' : 'Enable'}
            </Button>
          </div>
        </div>
      </div>

      {/* Password */}
      <div className="bg-[#1a1a1a] rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#ff4444] rounded-lg">
              <Key className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Password</h3>
              <p className="text-[#888]">Last changed 30 days ago</p>
            </div>
          </div>
          <Button variant="outline" className="border-[#333] text-white hover:bg-[#333]">
            Change Password
          </Button>
        </div>
      </div>

      {/* Login Sessions */}
      <div className="bg-[#1a1a1a] rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Active Sessions</h3>
        <div className="space-y-3">
          {mockActivities.slice(0, 3).map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`p-1 rounded ${activity.status === 'success' ? 'bg-[#00ff88]' : 'bg-[#ff4444]'}`}>
                  {activity.status === 'success' ? (
                    <Check className="w-4 h-4 text-black" />
                  ) : (
                    <X className="w-4 h-4 text-white" />
                  )}
                </div>
                <div>
                  <p className="text-white">{activity.action}</p>
                  <p className="text-sm text-[#888]">{activity.ip} • {new Date(activity.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="border-[#333] text-white hover:bg-[#333]">
                Revoke
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderApiKeysTab = () => (
    <div className="space-y-6">
      {/* API Keys Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">API Keys</h3>
          <p className="text-[#888]">Manage your API keys for trading and data access</p>
        </div>
        <Button className="bg-[#00ff88] text-black hover:bg-[#00cc6a]">
          <Plus className="w-4 h-4 mr-2" />
          Create New Key
        </Button>
      </div>

      {/* API Keys List */}
      <div className="space-y-4">
        {mockApiKeys.map((apiKey) => (
          <div key={apiKey.id} className="bg-[#1a1a1a] rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#333] rounded-lg">
                  <Key className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-medium">{apiKey.name}</h4>
                  <p className="text-sm text-[#888]">Created {new Date(apiKey.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={apiKey.state === 'active' ? "default" : "outline"}
                       className={apiKey.state === 'active' ? "bg-[#00ff88] text-black" : "border-[#333] text-white"}>
                  {apiKey.state}
                </Badge>
                <Button variant="outline" size="sm" className="border-[#333] text-white hover:bg-[#333]">
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="border-[#ff4444] text-[#ff4444] hover:bg-[#ff4444] hover:text-white">
                  Delete
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* API Key */}
              <div className="bg-[#0a0a0a] rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-[#888]">API Key</label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleSecret(apiKey.id)}
                      className="text-[#888] hover:text-white"
                    >
                      {showSecrets[apiKey.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => copyToClipboard(apiKey.key)}
                      className="text-[#888] hover:text-white"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="bg-[#1a1a1a] rounded p-2 font-mono text-sm">
                  {showSecrets[apiKey.id] ? apiKey.key : '••••••••••••••••••••••••••••••••'}
                </div>
              </div>

              {/* Secret Key */}
              <div className="bg-[#0a0a0a] rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-[#888]">Secret Key</label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleSecret(`${apiKey.id}-secret`)}
                      className="text-[#888] hover:text-white"
                    >
                      {showSecrets[`${apiKey.id}-secret`] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => copyToClipboard(apiKey.secret)}
                      className="text-[#888] hover:text-white"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="bg-[#1a1a1a] rounded p-2 font-mono text-sm">
                  {showSecrets[`${apiKey.id}-secret`] ? apiKey.secret : '••••••••••••••••••••••••••••••••'}
                </div>
              </div>
            </div>

            {/* Permissions */}
            <div className="mt-4">
              <label className="text-sm text-[#888] mb-2 block">Permissions</label>
              <div className="flex flex-wrap gap-2">
                {apiKey.permissions.map((permission) => (
                  <Badge key={permission} variant="outline" className="border-[#333] text-white">
                    {permission}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Last Used */}
            {apiKey.lastUsed && (
              <div className="mt-4 text-sm text-[#888]">
                Last used: {new Date(apiKey.lastUsed).toLocaleString()}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderActivityTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Account Activity</h3>
        <p className="text-[#888] mb-6">Monitor your account activity and security events</p>
      </div>

      <div className="space-y-3">
        {mockActivities.map((activity) => (
          <div key={activity.id} className="bg-[#1a1a1a] rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded ${activity.status === 'success' ? 'bg-[#00ff88]' : 'bg-[#ff4444]'}`}>
                  {activity.status === 'success' ? (
                    <Check className="w-5 h-5 text-black" />
                  ) : (
                    <X className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <p className="text-white font-medium">{activity.action}</p>
                  <p className="text-sm text-[#888]">
                    {activity.ip} • {activity.userAgent}
                  </p>
                  <p className="text-xs text-[#666]">
                    {new Date(activity.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <Badge variant={activity.status === 'success' ? "default" : "outline"}
                     className={activity.status === 'success' ? "bg-[#00ff88] text-black" : "border-[#ff4444] text-[#ff4444]"}>
                {activity.status}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="bg-[#1a1a1a] border-b border-[#333] p-6">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
              <p className="text-[#888] mt-1">Manage your account settings and preferences</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" className="border-[#333] text-white hover:bg-[#333]">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex space-x-1 bg-[#1a1a1a] rounded-lg p-1 mb-8">
          {[
            { id: 'account', label: 'Account', icon: User },
            { id: 'security', label: 'Security', icon: Shield },
            { id: 'api-keys', label: 'API Keys', icon: Key },
            { id: 'activity', label: 'Activity', icon: Activity },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === id
                  ? 'bg-[#00ff88] text-black'
                  : 'text-[#888] hover:text-white hover:bg-[#333]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'account' && renderAccountTab()}
        {activeTab === 'security' && renderSecurityTab()}
        {activeTab === 'api-keys' && renderApiKeysTab()}
        {activeTab === 'activity' && renderActivityTab()}
      </div>
    </div>
  );
}
