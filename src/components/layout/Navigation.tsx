"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  CandlestickChart,
  LineChart,
  PieChart,
  LayoutDashboard,
  ClipboardList,
  Wallet,
  Bell,
  ArrowUpFromLine,
  BookUser,
  BadgeCheck,
  Shield,
  Key,
  Settings,
  User,
  LogOut,
  Search,
  Menu,
  X,
  ChevronDown,
  Clock,
  Zap,
} from 'lucide-react';

interface NavigationProps {
  user?: any;
}

/**
 * Information architecture follows professional exchange conventions
 * (Binance / Kraken / Coinbase): discovery & products on the left, account
 * actions clustered on the right, and a grouped account dropdown.
 */

// Primary navigation — products & analysis, ordered by trading workflow.
const primaryNav = [
  { name: 'Trade', href: '/trade', icon: CandlestickChart },
  { name: 'Perps', href: '/perps', icon: Zap },
  { name: 'Markets', href: '/analytics', icon: LineChart },
  { name: 'Portfolio', href: '/portfolio', icon: PieChart },
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
];

// Quick-access account actions — pinned to the right cluster like the big exchanges.
const quickAccess = [
  { name: 'Orders', href: '/orders', icon: ClipboardList },
  { name: 'Wallet', href: '/wallets', icon: Wallet },
];

// Account dropdown — grouped by concern (identity, funds/activity, developer).
const accountGroups = [
  {
    label: 'Account',
    items: [
      { name: 'Profile', href: '/profile', icon: User, description: 'Personal details' },
      { name: 'Verification', href: '/verification', icon: BadgeCheck, description: 'Identity & KYC level' },
      { name: 'Security', href: '/security', icon: Shield, description: 'Password & 2FA' },
    ],
  },
  {
    label: 'Funds & Activity',
    items: [
      { name: 'Withdraw', href: '/withdraw', icon: ArrowUpFromLine, description: 'Send funds out' },
      { name: 'Transaction History', href: '/history', icon: Clock, description: 'Deposits, trades & withdrawals' },
      { name: 'Address Book', href: '/address-book', icon: BookUser, description: 'Saved withdrawal addresses' },
    ],
  },
  {
    label: 'Developer',
    items: [
      { name: 'API Keys', href: '/api-keys', icon: Key, description: 'Programmatic access' },
      { name: 'Preferences', href: '/settings', icon: Settings, description: 'App settings & display' },
    ],
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

  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside / on Escape.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideUserMenu = userMenuRef.current?.contains(target);
      const isInsideMobileMenu = mobileMenuRef.current?.contains(target);

      if (!isInsideUserMenu && !isInsideMobileMenu) {
        setIsUserMenuOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsUserMenuOpen(false);
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

  // Match exact route and nested routes (e.g. /wallets/[currency]).
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav className="bg-[hsl(var(--trading-bg))]/95 backdrop-blur-sm border-b border-[hsl(var(--trading-border))] sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo + primary navigation */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center space-x-2 group shrink-0">
              <div className="h-8 w-8 bg-gradient-to-r from-[hsl(var(--trading-accent))] to-[hsl(var(--trading-accent-secondary))] rounded-lg flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                <span className="text-white font-bold text-lg">O</span>
              </div>
              <span className="text-xl font-bold text-gradient-primary">Orbitex</span>
            </Link>

            {/* Primary nav — products & analysis */}
            <div className="hidden md:flex items-center gap-1 lg:gap-2">
              {primaryNav.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 relative",
                    isActive(item.href)
                      ? "text-[hsl(var(--trading-accent))] bg-[hsl(var(--trading-accent))]/10"
                      : "text-[hsl(var(--trading-text-secondary))] hover:text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))]"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Right: Search + account actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Market search */}
            <div className="hidden lg:flex items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[hsl(var(--trading-text-muted))]" />
                <input
                  type="text"
                  placeholder="Search markets…"
                  className="pl-10 pr-4 py-2 bg-[hsl(var(--trading-bg-tertiary))] border border-[hsl(var(--trading-border))] rounded-lg text-sm text-[hsl(var(--trading-text))] placeholder-[hsl(var(--trading-text-muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--trading-accent))] focus:border-transparent transition-all duration-200 w-56 xl:w-64"
                />
              </div>
            </div>

            {user ? (
              <>
                {/* Quick-access: Orders + Wallet */}
                <div className="hidden md:flex items-center gap-1">
                  {quickAccess.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                        isActive(item.href)
                          ? "text-[hsl(var(--trading-accent))] bg-[hsl(var(--trading-accent))]/10"
                          : "text-[hsl(var(--trading-text-secondary))] hover:text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))]"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="hidden lg:block">{item.name}</span>
                    </Link>
                  ))}
                </div>

                {/* Alerts (notifications) */}
                <Link
                  href="/alerts"
                  aria-label="Price alerts"
                  className={cn(
                    "hidden md:flex items-center justify-center h-9 w-9 rounded-md transition-all duration-200",
                    isActive('/alerts')
                      ? "text-[hsl(var(--trading-accent))] bg-[hsl(var(--trading-accent))]/10"
                      : "text-[hsl(var(--trading-text-secondary))] hover:text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))]"
                  )}
                >
                  <Bell className="h-4 w-4" />
                </Link>

                {/* Account menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1.5 pr-2 rounded-lg text-[hsl(var(--trading-text-secondary))] hover:text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))] transition-all duration-200"
                  >
                    <div className="h-8 w-8 bg-gradient-to-r from-[hsl(var(--trading-accent))] to-[hsl(var(--trading-accent-secondary))] rounded-full flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isUserMenuOpen && "rotate-180")} />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-72 bg-[hsl(var(--trading-bg-secondary))] border border-[hsl(var(--trading-border))] rounded-lg shadow-xl z-[9999] backdrop-blur-sm overflow-hidden">
                      <div className="p-4 border-b border-[hsl(var(--trading-border))]">
                        <div className="text-sm font-medium text-[hsl(var(--trading-text))] truncate">{user.email}</div>
                        <div className="mt-1 inline-flex items-center gap-1.5 text-xs text-[hsl(var(--trading-text-muted))]">
                          <BadgeCheck className="h-3.5 w-3.5 text-[hsl(var(--trading-accent))]" />
                          KYC Level {user.kyc_level || 0}
                        </div>
                      </div>

                      <div className="p-2 max-h-[70vh] overflow-y-auto">
                        {accountGroups.map((group, gi) => (
                          <div key={group.label} className={cn(gi > 0 && "mt-1 pt-1 border-t border-[hsl(var(--trading-border))]")}>
                            <div className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--trading-text-muted))]">
                              {group.label}
                            </div>
                            {group.items.map((item) => (
                              <Link
                                key={item.name}
                                href={item.href}
                                className="flex items-center gap-3 p-2.5 rounded-lg text-[hsl(var(--trading-text-secondary))] hover:text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))] transition-all duration-200 group"
                                onClick={() => setIsUserMenuOpen(false)}
                              >
                                <item.icon className="h-5 w-5 text-[hsl(var(--trading-accent))] shrink-0" />
                                <div className="min-w-0">
                                  <div className="text-sm font-medium">{item.name}</div>
                                  <div className="text-xs text-[hsl(var(--trading-text-muted))] truncate">{item.description}</div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        ))}

                        <div className="border-t border-[hsl(var(--trading-border))] mt-1 pt-1">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 p-2.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 w-full"
                          >
                            <LogOut className="h-5 w-5 shrink-0" />
                            <span className="text-sm font-medium">Sign Out</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
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
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[hsl(var(--trading-bg-secondary))] border-t border-[hsl(var(--trading-border))] z-[55]" ref={mobileMenuRef}>
          <div className="px-4 py-3 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
            {/* Mobile search */}
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[hsl(var(--trading-text-muted))]" />
              <input
                type="text"
                placeholder="Search markets…"
                className="w-full pl-10 pr-4 py-2 bg-[hsl(var(--trading-bg-tertiary))] border border-[hsl(var(--trading-border))] rounded-lg text-sm text-[hsl(var(--trading-text))] placeholder-[hsl(var(--trading-text-muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--trading-accent))]"
              />
            </div>

            {/* Primary nav */}
            {primaryNav.map((item) => (
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

            {user ? (
              <>
                {/* Quick access + alerts */}
                <div className="border-t border-[hsl(var(--trading-border))] pt-2 mt-2">
                  {[...quickAccess, { name: 'Alerts', href: '/alerts', icon: Bell }].map((item) => (
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
                      <item.icon className="h-5 w-5 text-[hsl(var(--trading-accent))]" />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </div>

                {/* Account groups */}
                {accountGroups.map((group) => (
                  <div key={group.label} className="border-t border-[hsl(var(--trading-border))] pt-2 mt-2">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--trading-text-muted))] px-3 py-1">
                      {group.label}
                    </div>
                    {group.items.map((item) => (
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
                ))}

                <div className="border-t border-[hsl(var(--trading-border))] pt-2 mt-2">
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
              </>
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
