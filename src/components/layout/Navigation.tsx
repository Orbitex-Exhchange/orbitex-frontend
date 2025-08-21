"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  User,
  Settings,
  LogOut,
  Wallet,
  BarChart3,
  TrendingUp,
  Shield,
  HelpCircle,
  Bell,
  Search,
  Globe,
  Bitcoin,
  Activity,
  Target,
  Rocket,
  Zap,
  Star,
  Award,
  Lock,
  RefreshCw,
  Download,
  Upload,
  Settings2,
  Users,
  Database,
  Server,
  Cloud,
  Cpu,
  Network,
  Code,
  Terminal,
  Smartphone,
  Monitor,
  Clock,
  Key
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { authService } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

interface NavigationProps {
  user?: any;
}

const navigationItems = [
  {
    name: 'Trade',
    href: '/trade',
    icon: BarChart3,
    description: 'Advanced trading interface',
    badge: 'Live',
    badgeColor: 'bg-green-500',
  },
  {
    name: 'Wallets',
    href: '/wallets',
    icon: Wallet,
    description: 'Manage your assets',
  },
  {
    name: 'Earn',
    href: '/earn',
    icon: TrendingUp,
    description: 'Staking and yield farming',
    badge: 'New',
    badgeColor: 'bg-blue-500',
  },
  {
    name: 'Learn',
    href: '/learn',
    icon: HelpCircle,
    description: 'Educational resources',
  },
  {
    name: 'Institutional',
    href: '/institutional',
    icon: Shield,
    description: 'Enterprise solutions',
    badge: 'Pro',
    badgeColor: 'bg-purple-500',
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

export function Navigation({ user }: NavigationProps) {
  const pathname = usePathname();
  const { theme } = useTheme();
  const { toast } = useToast();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isTradingToolsOpen, setIsTradingToolsOpen] = useState(false);
  
  const userMenuRef = useRef<HTMLDivElement>(null);
  const tradingToolsRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (tradingToolsRef.current && !tradingToolsRef.current.contains(event.target as Node)) {
        setIsTradingToolsOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      });
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="bg-[hsl(var(--trading-bg))]/95 backdrop-blur-sm border-b border-[hsl(var(--trading-border))] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="h-8 w-8 bg-gradient-to-r from-[hsl(var(--trading-accent))] to-[hsl(var(--trading-accent-secondary))] rounded-lg flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                <span className="text-white font-bold text-lg">O</span>
              </div>
              <span className="text-xl font-bold text-gradient-primary">Orbitex</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
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
                {item.badge && (
                  <Badge className={cn("text-xs px-1.5 py-0.5", item.badgeColor)}>
                    {item.badge}
                  </Badge>
                )}
                {/* Active indicator */}
                {isActive(item.href) && (
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-[hsl(var(--trading-accent))] to-[hsl(var(--trading-accent-secondary))] rounded-full" />
                )}
              </Link>
            ))}

            {/* Trading Tools Dropdown */}
            <div className="relative" ref={tradingToolsRef}>
              <button
                onClick={() => setIsTradingToolsOpen(!isTradingToolsOpen)}
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
                <div className="absolute top-full left-0 mt-2 w-64 bg-[hsl(var(--trading-bg-secondary))] border border-[hsl(var(--trading-border))] rounded-lg shadow-xl z-50">
                  <div className="p-2">
                    {tradingTools.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center space-x-3 p-3 rounded-lg text-[hsl(var(--trading-text-secondary))] hover:text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))] transition-all duration-200 group"
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
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
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
                  <div className="absolute top-full right-0 mt-2 w-64 bg-[hsl(var(--trading-bg-secondary))] border border-[hsl(var(--trading-border))] rounded-lg shadow-xl z-50">
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
        <div className="md:hidden bg-[hsl(var(--trading-bg-secondary))] border-t border-[hsl(var(--trading-border))]" ref={mobileMenuRef}>
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
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
                {item.badge && (
                  <Badge className={cn("ml-auto text-xs px-1.5 py-0.5", item.badgeColor)}>
                    {item.badge}
                  </Badge>
                )}
              </Link>
            ))}
            
            {/* Trading Tools in Mobile */}
            <div className="border-t border-[hsl(var(--trading-border))] pt-2">
              <div className="text-xs font-medium text-[hsl(var(--trading-text-muted))] px-3 py-2">Trading Tools</div>
              {tradingTools.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-3 p-3 rounded-lg text-sm text-[hsl(var(--trading-text-secondary))] hover:text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))] transition-all duration-200"
                >
                  <item.icon className="h-5 w-5 text-[hsl(var(--trading-accent))]" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

// Helper function for conditional classes
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
