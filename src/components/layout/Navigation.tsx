"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  Home,
  TrendingUp,
  Wallet,
  BarChart3,
  User,
  Settings,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  Key,
  Lock,
  Activity,
  Target,
  Clock,
  Shield,
  Globe,
  Palette
} from 'lucide-react';

interface NavigationProps {
  user?: any;
}

const navigationItems = [
  {
    name: 'Home',
    href: '/',
    icon: Home,
  },
  {
    name: 'Trade',
    href: '/trade',
    icon: TrendingUp,
  },
  {
    name: 'Wallets',
    href: '/wallets',
    icon: Wallet,
  },
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: BarChart3,
  },
];

const userMenuItems = [
  {
    name: 'Profile',
    href: '/profile',
    icon: User,
    description: 'Manage your account',
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'Preferences and security',
  },
  {
    name: 'API Keys',
    href: '/api-keys',
    icon: Key,
    description: 'Manage API access',
  },
  {
    name: 'Security',
    href: '/security',
    icon: Lock,
    description: 'Two-factor authentication',
  },
];

const tradingTools = [
  {
    name: 'Portfolio',
    href: '/portfolio',
    icon: Activity,
    description: 'Track your investments',
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: Target,
    description: 'Advanced analytics',
  },
  {
    name: 'Alerts',
    href: '/alerts',
    icon: Bell,
    description: 'Price and news alerts',
  },
  {
    name: 'History',
    href: '/history',
    icon: Clock,
    description: 'Transaction history',
  },
];

export function Navigation({ user: propUser }: NavigationProps) {
  const pathname = usePathname();
  const { theme } = useTheme();
  const { toast } = useToast();
  const { user: contextUser, logout } = useAuth();

  const user = propUser || contextUser;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isTradingToolsOpen, setIsTradingToolsOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const tradingToolsRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Debug logging
  useEffect(() => {
    console.log('Navigation state:', {
      isUserMenuOpen,
      isTradingToolsOpen,
      isMobileMenuOpen,
      user: !!user
    });
  }, [isUserMenuOpen, isTradingToolsOpen, isMobileMenuOpen, user]);

  // Close menus when clicking outside with improved detection
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // Check if click is inside any of the dropdown menus
      const isInsideUserMenu = userMenuRef.current?.contains(target);
      const isInsideTradingTools = tradingToolsRef.current?.contains(target);
      const isInsideMobileMenu = mobileMenuRef.current?.contains(target);

      // Only close if click is outside all menus
      if (!isInsideUserMenu && !isInsideTradingTools && !isInsideMobileMenu) {
        setIsUserMenuOpen(false);
        setIsTradingToolsOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    // Use mousedown instead of click for better responsiveness
    document.addEventListener('mousedown', handleClickOutside);

    // Also close on escape key
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsUserMenuOpen(false);
        setIsTradingToolsOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
      });
    }
  };

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="bg-[hsl(var(--trading-bg))]/95 backdrop-blur-sm border-b border-[hsl(var(--trading-border))] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Always left-aligned */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="h-8 w-8 bg-gradient-to-r from-[hsl(var(--trading-accent))] to-[hsl(var(--trading-accent-secondary))] rounded-lg flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                <span className="text-white font-bold text-lg">O</span>
              </div>
              <span className="text-xl font-bold text-gradient-primary">Orbitex</span>
            </Link>
          </div>

          {/* Desktop Navigation - Center */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Main Navigation Items */}
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center space-x-2 text-sm font-medium transition-all duration-300 relative group",
                  isActive(item.href)
                    ? "text-[hsl(var(--trading-accent))]"
                    : "text-[hsl(var(--trading-text-secondary))] hover:text-[hsl(var(--trading-text))]"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
                {/* Active indicator */}
                {isActive(item.href) && (
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-[hsl(var(--trading-accent))] to-[hsl(var(--trading-accent-secondary))] rounded-full" />
                )}
              </Link>
            ))}

            {/* Trading Tools Dropdown */}
            <div className="relative" ref={tradingToolsRef}>
              <button
                onClick={() => {
                  console.log('Trading tools clicked, current state:', isTradingToolsOpen);
                  setIsTradingToolsOpen(!isTradingToolsOpen);
                }}
                className={cn(
                  "flex items-center space-x-2 text-sm font-medium transition-all duration-300",
                  isTradingToolsOpen
                    ? "text-[hsl(var(--trading-accent))]"
                    : "text-[hsl(var(--trading-text-secondary))] hover:text-[hsl(var(--trading-text))]"
                )}
              >
                <span>Trading Tools</span>
                <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isTradingToolsOpen && "rotate-180")} />
              </button>

              {/* Trading Tools Dropdown Menu */}
              {isTradingToolsOpen && (
                <div
                  className="absolute top-full left-0 mt-2 w-64 bg-[hsl(var(--trading-bg-secondary))] border border-[hsl(var(--trading-border))] rounded-lg shadow-xl z-[9999] backdrop-blur-sm"
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: '0',
                    marginTop: '0.5rem',
                    width: '16rem',
                    backgroundColor: 'hsl(var(--trading-bg-secondary))',
                    border: '1px solid hsl(var(--trading-border))',
                    borderRadius: '0.5rem',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    zIndex: 9999,
                    backdropFilter: 'blur(8px)'
                  }}
                >
                  <div className="p-2">
                    {tradingTools.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center space-x-3 p-3 rounded-lg text-[hsl(var(--trading-text-secondary))] hover:text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))] transition-all duration-200 group"
                        onClick={() => setIsTradingToolsOpen(false)}
                      >
                        <item.icon className="h-5 w-5 text-[hsl(var(--trading-accent))] group-hover:scale-110 transition-transform duration-200" />
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs text-[hsl(var(--trading-text-muted))]">{item.description}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right side - Search, Notifications, User Menu */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="hidden md:flex items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[hsl(var(--trading-text-muted))]" />
                <input
                  type="text"
                  placeholder="Search markets..."
                  className="pl-10 pr-4 py-2 bg-[hsl(var(--trading-bg-tertiary))] border border-[hsl(var(--trading-border))] rounded-lg text-[hsl(var(--trading-text))] placeholder-[hsl(var(--trading-text-muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--trading-accent))] focus:border-transparent transition-all duration-200 w-64"
                />
              </div>
            </div>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="relative text-[hsl(var(--trading-text-secondary))] hover:text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))] transition-all duration-200"
            >
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-red-500">3</Badge>
            </Button>

            {/* User Menu */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => {
                    console.log('User menu clicked, current state:', isUserMenuOpen);
                    setIsUserMenuOpen(!isUserMenuOpen);
                  }}
                  className="flex items-center space-x-2 p-2 rounded-lg text-[hsl(var(--trading-text-secondary))] hover:text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))] transition-all duration-200"
                >
                  <div className="h-8 w-8 bg-gradient-to-r from-[hsl(var(--trading-accent))] to-[hsl(var(--trading-accent-secondary))] rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="hidden lg:block text-sm font-medium">{user.email}</span>
                  <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isUserMenuOpen && "rotate-180")} />
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div
                    className="absolute top-full right-0 mt-2 w-64 bg-[hsl(var(--trading-bg-secondary))] border border-[hsl(var(--trading-border))] rounded-lg shadow-xl z-[9999] backdrop-blur-sm"
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: '0',
                      marginTop: '0.5rem',
                      width: '16rem',
                      backgroundColor: 'hsl(var(--trading-bg-secondary))',
                      border: '1px solid hsl(var(--trading-border))',
                      borderRadius: '0.5rem',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                      zIndex: 9999,
                      backdropFilter: 'blur(8px)'
                    }}
                  >
                    <div className="p-4 border-b border-[hsl(var(--trading-border))]">
                      <div className="text-sm font-medium text-[hsl(var(--trading-text))]">{user.email}</div>
                      <div className="text-xs text-[hsl(var(--trading-text-muted))]">KYC Level {user.kyc_level || 0}</div>
                    </div>
                    <div className="p-2">
                      {userMenuItems.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="flex items-center space-x-3 p-3 rounded-lg text-[hsl(var(--trading-text-secondary))] hover:text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))] transition-all duration-200 group"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <item.icon className="h-5 w-5 text-[hsl(var(--trading-accent))] group-hover:scale-110 transition-transform duration-200" />
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-xs text-[hsl(var(--trading-text-muted))]">{item.description}</div>
                          </div>
                        </Link>
                      ))}
                      <div className="border-t border-[hsl(var(--trading-border))] mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-3 p-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 group w-full"
                        >
                          <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                          <span className="font-medium">Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/signin">
                  <Button variant="outline" size="sm" className="border-[hsl(var(--trading-border))] text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))] transition-all duration-300 hover:border-[hsl(var(--trading-accent))]">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="btn-gradient-primary">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-[hsl(var(--trading-text-secondary))] hover:text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))] transition-all duration-200"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[hsl(var(--trading-bg-secondary))] border-t border-[hsl(var(--trading-border))] z-[55]" ref={mobileMenuRef}>
          <div className="px-4 py-2 space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive(item.href)
                    ? "text-[hsl(var(--trading-accent))] bg-[hsl(var(--trading-accent))]/10"
                    : "text-[hsl(var(--trading-text-secondary))] hover:text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))]"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            ))}

            {/* Trading Tools in Mobile */}
            <div className="border-t border-[hsl(var(--trading-border))] pt-2 mt-2">
              <div className="text-xs font-medium text-[hsl(var(--trading-text-muted))] px-3 py-2">Trading Tools</div>
              {tradingTools.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-3 p-3 rounded-lg text-sm text-[hsl(var(--trading-text-secondary))] hover:text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))] transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5 text-[hsl(var(--trading-accent))]" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>

            {/* User Menu in Mobile */}
            {user ? (
              <div className="border-t border-[hsl(var(--trading-border))] pt-2 mt-2">
                <div className="text-xs font-medium text-[hsl(var(--trading-text-muted))] px-3 py-2">Account</div>
                {userMenuItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-3 p-3 rounded-lg text-sm text-[hsl(var(--trading-text-secondary))] hover:text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))] transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className="h-5 w-5 text-[hsl(var(--trading-accent))]" />
                    <span>{item.name}</span>
                  </Link>
                ))}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 p-3 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 w-full"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="border-t border-[hsl(var(--trading-border))] pt-2 mt-2">
                <div className="flex flex-col space-y-2 p-3">
                  <Link href="/auth/signin">
                    <Button variant="outline" className="w-full border-[hsl(var(--trading-border))] text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))]">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button className="w-full btn-gradient-primary">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
