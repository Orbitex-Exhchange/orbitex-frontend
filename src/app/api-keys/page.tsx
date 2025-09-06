'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Navigation } from '@/components/layout/Navigation';
import { 
  Key,
  Plus,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  created: string;
  lastUsed: string;
  status: 'active' | 'inactive';
}

export default function ApiKeysPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { authToken, isAuthenticated, user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showKeys, setShowKeys] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // Mock API keys data
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: '1',
      name: 'Trading Bot',
      key: 'sk_test_1234567890abcdef',
      permissions: ['read', 'trade'],
      created: '2024-01-15',
      lastUsed: '2024-01-20',
      status: 'active'
    },
    {
      id: '2',
      name: 'Analytics Dashboard',
      key: 'sk_test_0987654321fedcba',
      permissions: ['read'],
      created: '2024-01-10',
      lastUsed: '2024-01-19',
      status: 'active'
    }
  ]);

  const availablePermissions = [
    { id: 'read', label: 'Read', description: 'View account data and balances' },
    { id: 'trade', label: 'Trade', description: 'Place and cancel orders' },
    { id: 'withdraw', label: 'Withdraw', description: 'Withdraw funds' },
    { id: 'admin', label: 'Admin', description: 'Full administrative access' }
  ];

  // Show authentication required message if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--trading-bg))] via-[hsl(var(--trading-bg-secondary))] to-[hsl(var(--trading-bg))]">
        <Navigation user={user} />
        <div className="container mx-auto p-6">
          <Card className="border-yellow-500 bg-yellow-900/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <Key className="h-12 w-12 mx-auto text-yellow-400 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Authentication Required</h3>
                <p className="text-yellow-200 mb-4">
                  Please sign in to manage your API keys.
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

  const handleCreateApiKey = async () => {
    if (!newKeyName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for your API key.",
      });
      return;
    }

    if (selectedPermissions.length === 0) {
      toast({
        title: "Permissions Required",
        description: "Please select at least one permission.",
      });
      return;
    }

    setIsCreating(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newKey: ApiKey = {
        id: Date.now().toString(),
        name: newKeyName,
        key: `sk_test_${Math.random().toString(36).substring(2, 15)}`,
        permissions: selectedPermissions,
        created: new Date().toISOString().split('T')[0] || new Date().toISOString().slice(0, 10),
        lastUsed: 'Never',
        status: 'active'
      };

      setApiKeys(prev => [newKey, ...prev]);
      setNewKeyName('');
      setSelectedPermissions([]);
      setIsCreating(false);

      toast({
        title: "API Key Created",
        description: "Your new API key has been created successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create API key. Please try again.",
      });
      setIsCreating(false);
    }
  };

  const handleDeleteApiKey = async (keyId: string) => {
    setIsLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setApiKeys(prev => prev.filter(key => key.id !== keyId));
      
      toast({
        title: "API Key Deleted",
        description: "The API key has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete API key. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "API key copied to clipboard",
    });
  };

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(p => p !== permissionId)
        : [...prev, permissionId]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--trading-bg))] via-[hsl(var(--trading-bg-secondary))] to-[hsl(var(--trading-bg))]">
      <Navigation user={user} />
      
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">API Keys</h1>
            <p className="text-gray-300">Manage your API access keys</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowKeys(!showKeys)}
              className="flex items-center gap-2"
            >
              {showKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showKeys ? 'Hide' : 'Show'} Keys
            </Button>
            <Button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create API Key
            </Button>
          </div>
        </div>

        {/* Security Notice */}
        <Alert className="border-yellow-500 bg-yellow-900/20">
          <AlertTriangle className="h-4 w-4 text-yellow-400" />
          <AlertDescription className="text-yellow-200">
            Keep your API keys secure and never share them publicly. API keys have the same permissions as your account.
          </AlertDescription>
        </Alert>

        {/* Create New API Key Modal */}
        {isCreating && (
          <Card className="border-[hsl(var(--trading-border))] bg-[hsl(var(--trading-bg-secondary))]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New API Key
              </CardTitle>
              <CardDescription className="text-gray-300">
                Create a new API key with specific permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="keyName" className="text-white">API Key Name</Label>
                <Input
                  id="keyName"
                  placeholder="e.g., Trading Bot, Analytics Dashboard"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="bg-[hsl(var(--trading-bg-tertiary))] border-[hsl(var(--trading-border))] text-[hsl(var(--trading-text))]"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-white">Permissions</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availablePermissions.map((permission) => (
                    <div
                      key={permission.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedPermissions.includes(permission.id)
                          ? 'border-[hsl(var(--trading-accent))] bg-[hsl(var(--trading-accent))]/10'
                          : 'border-[hsl(var(--trading-border))] bg-[hsl(var(--trading-bg-tertiary))] hover:border-[hsl(var(--trading-accent))]/50'
                      }`}
                      onClick={() => togglePermission(permission.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-white">{permission.label}</div>
                          <div className="text-sm text-gray-400">{permission.description}</div>
                        </div>
                        {selectedPermissions.includes(permission.id) && (
                          <CheckCircle className="h-5 w-5 text-[hsl(var(--trading-accent))]" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={handleCreateApiKey}
                  disabled={!newKeyName.trim() || selectedPermissions.length === 0}
                  className="flex items-center gap-2"
                >
                  <Key className="h-4 w-4" />
                  Create API Key
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false);
                    setNewKeyName('');
                    setSelectedPermissions([]);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* API Keys List */}
        <div className="space-y-4">
          {apiKeys.map((apiKey) => (
            <Card key={apiKey.id} className="border-[hsl(var(--trading-border))] bg-[hsl(var(--trading-bg-secondary))]">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium text-white">{apiKey.name}</h3>
                      <Badge variant={apiKey.status === 'active' ? 'default' : 'secondary'}>
                        {apiKey.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">API Key:</span>
                        <code className="flex-1 text-sm bg-[hsl(var(--trading-bg-tertiary))] p-2 rounded text-green-300 font-mono">
                          {showKeys ? apiKey.key : '••••••••••••••••••••••••••••••••'}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(apiKey.key)}
                          className="h-8 w-8 p-0"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>Created: {apiKey.created}</span>
                        <span>Last used: {apiKey.lastUsed}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">Permissions:</span>
                        <div className="flex gap-1">
                          {apiKey.permissions.map((permission) => (
                            <Badge key={permission} variant="outline" className="text-xs">
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteApiKey(apiKey.id)}
                    disabled={isLoading}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 border-red-500/50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {apiKeys.length === 0 && !isCreating && (
          <Card className="border-[hsl(var(--trading-border))] bg-[hsl(var(--trading-bg-secondary))]">
            <CardContent className="text-center py-12">
              <Key className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No API Keys</h3>
              <p className="text-gray-400 mb-4">
                You haven't created any API keys yet. Create your first API key to get started.
              </p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create API Key
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
