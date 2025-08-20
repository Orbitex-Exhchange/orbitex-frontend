"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  ChevronDown, 
  User, 
  Settings, 
  LogOut, 
  Bell,
  Wallet,
  BarChart3,
  Shield,
  HelpCircle,
  Globe,
  Building2,
  GraduationCap,
  Zap,
  Coins,
  Percent,
  Star,
  Users,
  Target,
  Rocket,
  Database,
  Cpu,
  Network,
  Lock,
  Key,
  CreditCard,
  FileText,
  MessageCircle,
  Phone,
  Mail,
  ExternalLink
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface NavigationProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

const tradingInstruments = [
  { name: 'Spot Trading', description: 'Trade cryptocurrencies instantly', href: '/trade/spot', icon: Coins },
  { name: 'Futures Trading', description: 'Advanced derivatives trading', href: '/trade/futures', icon: TrendingUp },
  { name: 'Options Trading', description: 'Options and advanced strategies', href: '/trade/options', icon: BarChart3 },
  { name: 'Margin Trading', description: 'Trade with leverage', href: '/trade/margin', icon: Zap },
  { name: 'Copy Trading', description: 'Follow expert traders', href: '/trade/copy', icon: Users },
  { name: 'Grid Trading', description: 'Automated grid strategies', href: '/trade/grid', icon: Target },
];

const earnProducts = [
  { name: 'Staking', description: 'Earn rewards by staking', href: '/earn/staking', icon: Star },
  { name: 'Yield Farming', description: 'Maximize your returns', href: '/earn/yield', icon: Percent },
  { name: 'Liquidity Mining', description: 'Provide liquidity and earn', href: '/earn/liquidity', icon: Coins },
  { name: 'Fixed Deposits', description: 'Lock funds for higher returns', href: '/earn/fixed', icon: Lock },
  { name: 'Launchpad', description: 'Early access to new projects', href: '/earn/launchpad', icon: Rocket },
];

const institutionalServices = [
  { name: 'Institutional Trading', description: 'Professional trading solutions', href: '/institutional/trading', icon: BarChart3 },
  { name: 'Custody Services', description: 'Secure asset custody', href: '/institutional/custody', icon: Shield },
  { name: 'API Access', description: 'High-frequency trading APIs', href: '/institutional/api', icon: Database },
  { name: 'White Label', description: 'Custom exchange solutions', href: '/institutional/whitelabel', icon: Building2 },
  { name: 'Prime Brokerage', description: 'Comprehensive trading services', href: '/institutional/prime', icon: Cpu },
];

export default function Navigation({ user }: NavigationProps) {
  const pathname = usePathname();
  const [isTradingDropdownOpen, setIsTradingDropdownOpen] = useState(false);
  const [isEarnDropdownOpen, setIsEarnDropdownOpen] = useState(false);
  const [isInstitutionalDropdownOpen, setIsInstitutionalDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  return (
    <motion.nav 
      className="bg-gradient-to-r from-[hsl(var(--trading-bg-secondary))] to-[hsl(var(--trading-bg))] border-b border-[hsl(var(--trading-border))] glass z-9999"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
          >
            <div className="h-8 w-8 bg-gradient-to-r from-[hsl(var(--trading-accent))] to-[hsl(var(--trading-accent-secondary))] rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">O</span>
            </div>
            <span className="text-xl font-bold text-gradient-primary">Orbitex</span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:ml-8 lg:flex lg:space-x-1">
            {/* Trade Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsTradingDropdownOpen(!isTradingDropdownOpen)}
                className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  pathname.startsWith('/trade') 
                    ? 'text-[hsl(var(--trading-accent))] bg-[hsl(var(--trading-accent))]/10' 
                    : 'text-[hsl(var(--trading-text-secondary))] hover:text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))]'
                }`}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Trade
                <ChevronDown className={`h-4 w-4 ml-1 transition-transform duration-200 ${isTradingDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {isTradingDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 mt-1 w-64 bg-[hsl(var(--trading-bg-secondary))] border border-[hsl(var(--trading-border))] rounded-lg shadow-xl z-9999"
                    style={{ zIndex: 9999 }}
                  >
                    <div className="p-2">
                      {tradingInstruments.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="flex items-center px-3 py-2 rounded-md text-sm text-[hsl(var(--trading-text-secondary))] hover:text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))] transition-colors duration-200"
                          onClick={() => setIsTradingDropdownOpen(false)}
                        >
                          <item.icon className="h-4 w-4 mr-3 text-[hsl(var(--trading-accent))]" />
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-xs text-[hsl(var(--trading-text-muted))]">{item.description}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Earn Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsEarnDropdownOpen(!isEarnDropdownOpen)}
                className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  pathname.startsWith('/earn') 
                    ? 'text-[hsl(var(--trading-accent))] bg-[hsl(var(--trading-accent))]/10' 
                    : 'text-[hsl(var(--trading-text-secondary))] hover:text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))]'
                }`}
              >
                <Star className="h-4 w-4 mr-2" />
                Earn
                <ChevronDown className={`h-4 w-4 ml-1 transition-transform duration-200 ${isEarnDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {isEarnDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 mt-1 w-64 bg-[hsl(var(--trading-bg-secondary))] border border-[hsl(var(--trading-border))] rounded-lg shadow-xl z-9999"
                    style={{ zIndex: 9999 }}
                  >
                    <div className="p-2">
                      {earnProducts.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="flex items-center px-3 py-2 rounded-md text-sm text-[hsl(var(--trading-text-secondary))] hover:text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))] transition-colors duration-200"
                          onClick={() => setIsEarnDropdownOpen(false)}
                        >
                          <item.icon className="h-4 w-4 mr-3 text-[hsl(var(--trading-accent))]" />
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-xs text-[hsl(var(--trading-text-muted))]">{item.description}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Institutional Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsInstitutionalDropdownOpen(!isInstitutionalDropdownOpen)}
                className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  pathname.startsWith('/institutional') 
                    ? 'text-[hsl(var(--trading-accent))] bg-[hsl(var(--trading-accent))]/10' 
                    : 'text-[hsl(var(--trading-text-secondary))] hover:text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))]'
                }`}
              >
                <Building2 className="h-4 w-4 mr-2" />
                Institutional
                <ChevronDown className={`h-4 w-4 ml-1 transition-transform duration-200 ${isInstitutionalDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {isInstitutionalDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 mt-1 w-64 bg-[hsl(var(--trading-bg-secondary))] border border-[hsl(var(--trading-border))] rounded-lg shadow-xl z-9999"
                    style={{ zIndex: 9999 }}
                  >
                    <div className="p-2">
                      {institutionalServices.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="flex items-center px-3 py-2 rounded-md text-sm text-[hsl(var(--trading-text-secondary))] hover:text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))] transition-colors duration-200"
                          onClick={() => setIsInstitutionalDropdownOpen(false)}
                        >
                          <item.icon className="h-4 w-4 mr-3 text-[hsl(var(--trading-accent))]" />
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-xs text-[hsl(var(--trading-text-muted))]">{item.description}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Direct Links */}
            <Link 
              href="/wallets" 
              className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                pathname.startsWith('/wallets') 
                  ? 'text-[hsl(var(--trading-accent))] bg-[hsl(var(--trading-accent))]/10' 
                  : 'text-[hsl(var(--trading-text-secondary))] hover:text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))]'
              }`}
            >
              <Wallet className="h-4 w-4 mr-2" />
              Wallets
            </Link>

            <Link 
              href="/learn" 
              className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                pathname.startsWith('/learn') 
                  ? 'text-[hsl(var(--trading-accent))] bg-[hsl(var(--trading-accent))]/10' 
                  : 'text-[hsl(var(--trading-text-secondary))] hover:text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))]'
              }`}
            >
              <GraduationCap className="h-4 w-4 mr-2" />
              Learn
            </Link>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="text-[hsl(var(--trading-text-secondary))] hover:text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))] transition-colors duration-200">
              <Bell className="h-4 w-4" />
            </Button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center space-x-2 text-[hsl(var(--trading-text-secondary))] hover:text-[hsl(var(--trading-text))] transition-colors duration-200"
              >
                <div className="h-8 w-8 bg-gradient-to-r from-[hsl(var(--trading-accent))] to-[hsl(var(--trading-accent-secondary))] rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="hidden md:block text-sm font-medium">{user?.name || 'User'}</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              <AnimatePresence>
                {isUserDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full right-0 mt-1 w-64 bg-[hsl(var(--trading-bg-secondary))] border border-[hsl(var(--trading-border))] rounded-lg shadow-xl z-9999"
                    style={{ zIndex: 9999 }}
                  >
                    <div className="p-2">
                      <div className="px-3 py-2 border-b border-[hsl(var(--trading-border))]">
                        <div className="text-sm font-medium text-[hsl(var(--trading-text))]">{user?.name || 'User'}</div>
                        <div className="text-xs text-[hsl(var(--trading-text-muted))]">{user?.email || 'user@example.com'}</div>
                      </div>
                      
                      <div className="py-1">
                        <Link href="/profile" className="flex items-center px-3 py-2 text-sm text-[hsl(var(--trading-text-secondary))] hover:text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))] transition-colors duration-200">
                          <User className="h-4 w-4 mr-3" />
                          Profile
                        </Link>
                        <Link href="/settings" className="flex items-center px-3 py-2 text-sm text-[hsl(var(--trading-text-secondary))] hover:text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))] transition-colors duration-200">
                          <Settings className="h-4 w-4 mr-3" />
                          Settings
                        </Link>
                        <Link href="/security" className="flex items-center px-3 py-2 text-sm text-[hsl(var(--trading-text-secondary))] hover:text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))] transition-colors duration-200">
                          <Shield className="h-4 w-4 mr-3" />
                          Security
                        </Link>
                        <Link href="/support" className="flex items-center px-3 py-2 text-sm text-[hsl(var(--trading-text-secondary))] hover:text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))] transition-colors duration-200">
                          <HelpCircle className="h-4 w-4 mr-3" />
                          Support
                        </Link>
                      </div>
                      
                      <div className="border-t border-[hsl(var(--trading-border))] pt-1">
                        <button className="flex items-center w-full px-3 py-2 text-sm text-[hsl(var(--trading-error))] hover:bg-[hsl(var(--trading-bg-tertiary))] transition-colors duration-200">
                          <LogOut className="h-4 w-4 mr-3" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
