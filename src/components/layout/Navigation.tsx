"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search,
  Bell,
  Settings,
  User,
  LogOut,
  Wallet,
  BarChart3,
  TrendingUp,
  Shield,
  HelpCircle,
  Menu,
  X,
  Clock,
  History,
  Coins,
  Percent,
  Star,
  Award,
  Zap,
  Globe,
  BookOpen,
  Headphones,
  ChevronDown,
  ChevronRight,
  Plus,
  Minus,
  DollarSign,
  Bitcoin,
  Activity,
  Target,
  Rocket,
  Lock,
  RefreshCw,
  ExternalLink,
  Download,
  Upload,
  MoreHorizontal,
  Grid3X3,
  PieChart,
  LineChart,
  CandlestickChart,
  AlertTriangle,
  CheckCircle,
  Info,
  Code,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface NavigationProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

const mainNavigation = [
  { 
    name: 'Trade', 
    href: '/trade', 
    icon: TrendingUp,
    description: 'Spot, Futures & Options',
    badge: 'Live'
  },
  { 
    name: 'Wallets', 
    href: '/wallets', 
    icon: Wallet,
    description: 'Manage your assets',
    badge: null
  },
  { 
    name: 'Earn', 
    href: '/earn', 
    icon: Percent,
    description: 'Staking & Yield',
    badge: 'New'
  },
  { 
    name: 'Learn', 
    href: '/learn', 
    icon: BookOpen,
    description: 'Trading education',
    badge: null
  },
];

const tradingInstruments = [
  { name: 'Spot Trading', href: '/trade/spot', icon: Coins, description: 'Buy & sell crypto' },
  { name: 'Futures', href: '/trade/futures', icon: TrendingUp, description: 'Perpetual & expiry' },
  { name: 'Options', href: '/trade/options', icon: Target, description: 'Advanced derivatives' },
  { name: 'Convert', href: '/trade/convert', icon: Zap, description: 'Quick conversion' },
];

const earnProducts = [
  { name: 'Simple Earn', href: '/earn/simple', icon: Star, description: 'Flexible staking' },
  { name: 'Dual Investment', href: '/earn/dual', icon: Award, description: 'BTC Yield+' },
  { name: 'Loan', href: '/earn/loan', icon: DollarSign, description: 'Borrow to earn' },
];

const institutionalServices = [
  { name: 'Liquid Marketplace', href: '/institutional/liquid', icon: BarChart3, description: 'OTC liquidity' },
  { name: 'APIs', href: '/institutional/apis', icon: Code, description: 'Ultra-low latency' },
  { name: 'Broker Program', href: '/institutional/broker', icon: Users, description: 'High commissions' },
];

export default function Navigation({ user }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isTradingDropdownOpen, setIsTradingDropdownOpen] = useState(false);
  const [isEarnDropdownOpen, setIsEarnDropdownOpen] = useState(false);
  const [isInstitutionalDropdownOpen, setIsInstitutionalDropdownOpen] = useState(false);
  const pathname = usePathname();

  const handleLogout = () => {
    console.log('Logout clicked');
    // Handle logout logic
  };

  return (
    <nav className="nav-dark border-b border-[#2a2a2a] bg-[#0a0a0a]/95 backdrop-blur-xl" style={{ zIndex: 9999 }}>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Primary Navigation */}
          <div className="flex items-center">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center group">
                <div className="h-8 w-8 bg-gradient-to-r from-[#00ff88] to-[#00cc6a] rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                  <span className="text-black text-lg font-bold">O</span>
                </div>
                <span className="ml-2 text-xl font-bold text-white group-hover:text-[#00ff88] transition-colors duration-200">Orbitex</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:ml-8 lg:flex lg:space-x-1">
              {/* Trade Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsTradingDropdownOpen(!isTradingDropdownOpen)}
                  className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    pathname.startsWith('/trade') 
                      ? 'text-[#00ff88] bg-[#00ff88]/10' 
                      : 'text-[#d1d5db] hover:text-white hover:bg-[#1a1a1a]'
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
                       className="absolute top-full left-0 mt-1 w-64 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-xl z-[9999]"
                       style={{ zIndex: 9999 }}
                     >
                      <div className="p-2">
                        {tradingInstruments.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center px-3 py-2 rounded-md text-sm text-[#d1d5db] hover:text-white hover:bg-[#2a2a2a] transition-colors duration-200"
                            onClick={() => setIsTradingDropdownOpen(false)}
                          >
                            <item.icon className="h-4 w-4 mr-3 text-[#00ff88]" />
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-xs text-[#888888]">{item.description}</div>
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
                      ? 'text-[#00ff88] bg-[#00ff88]/10' 
                      : 'text-[#d1d5db] hover:text-white hover:bg-[#1a1a1a]'
                  }`}
                >
                  <Percent className="h-4 w-4 mr-2" />
                  Earn
                  <Badge className="ml-1 bg-[#00ff88] text-black text-xs px-1 py-0">New</Badge>
                  <ChevronDown className={`h-4 w-4 ml-1 transition-transform duration-200 ${isEarnDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {isEarnDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 mt-1 w-64 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-xl z-[9999]"
                    >
                      <div className="p-2">
                        {earnProducts.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center px-3 py-2 rounded-md text-sm text-[#d1d5db] hover:text-white hover:bg-[#2a2a2a] transition-colors duration-200"
                            onClick={() => setIsEarnDropdownOpen(false)}
                          >
                            <item.icon className="h-4 w-4 mr-3 text-[#00ff88]" />
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-xs text-[#888888]">{item.description}</div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Simple Navigation Items */}
              {mainNavigation.slice(2).map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      isActive 
                        ? 'text-[#00ff88] bg-[#00ff88]/10' 
                        : 'text-[#d1d5db] hover:text-white hover:bg-[#1a1a1a]'
                    }`}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.name}
                    {item.badge && (
                      <Badge className="ml-1 bg-[#00ff88] text-black text-xs px-1 py-0">{item.badge}</Badge>
                    )}
                  </Link>
                );
              })}

              {/* Institutional Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsInstitutionalDropdownOpen(!isInstitutionalDropdownOpen)}
                  className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium text-[#d1d5db] hover:text-white hover:bg-[#1a1a1a] transition-colors duration-200"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Institutional
                  <ChevronDown className={`h-4 w-4 ml-1 transition-transform duration-200 ${isInstitutionalDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {isInstitutionalDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 mt-1 w-64 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-xl z-[9999]"
                    >
                      <div className="p-2">
                        {institutionalServices.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center px-3 py-2 rounded-md text-sm text-[#d1d5db] hover:text-white hover:bg-[#2a2a2a] transition-colors duration-200"
                            onClick={() => setIsInstitutionalDropdownOpen(false)}
                          >
                            <item.icon className="h-4 w-4 mr-3 text-[#00ff88]" />
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-xs text-[#888888]">{item.description}</div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Right side - Search, Notifications, User Menu */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#888888] h-4 w-4" />
                <Input
                  placeholder="Search markets, assets..."
                  className="pl-10 w-64 trading-input focus:w-80 transition-all duration-300"
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="hidden md:flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="relative text-[#d1d5db] hover:text-white">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="relative text-[#d1d5db] hover:text-white">
                <Upload className="h-4 w-4" />
              </Button>
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative text-[#d1d5db] hover:text-white">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
            </Button>

            {/* Settings */}
            <Button variant="ghost" size="sm" className="text-[#d1d5db] hover:text-white">
              <Settings className="h-5 w-5" />
            </Button>

            {/* User Menu */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 text-[#d1d5db] hover:text-white"
              >
                {user?.avatar ? (
                  <img
                    className="h-8 w-8 rounded-full border-2 border-[#00ff88]"
                    src={user.avatar}
                    alt={user.name}
                  />
                ) : (
                  <div className="h-8 w-8 bg-gradient-to-r from-[#00ff88] to-[#00cc6a] rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-black" />
                  </div>
                )}
                <span className="hidden md:block text-sm font-medium">
                  {user?.name || 'User'}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>

              {/* User Dropdown */}
              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                                         className="absolute right-0 mt-2 w-64 bg-[#1a1a1a] rounded-lg shadow-xl py-2 z-[9999] border border-[#2a2a2a]"
                  >
                    <div className="px-4 py-3 border-b border-[#2a2a2a]">
                      <p className="text-sm font-medium text-white">{user?.name}</p>
                      <p className="text-sm text-[#888888]">{user?.email}</p>
                    </div>
                    
                    <div className="py-2">
                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-2 text-sm text-[#d1d5db] hover:text-white hover:bg-[#2a2a2a] transition-colors duration-200"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="h-4 w-4 mr-3" />
                        Profile
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center px-4 py-2 text-sm text-[#d1d5db] hover:text-white hover:bg-[#2a2a2a] transition-colors duration-200"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4 mr-3" />
                        Settings
                      </Link>
                      <Link
                        href="/security"
                        className="flex items-center px-4 py-2 text-sm text-[#d1d5db] hover:text-white hover:bg-[#2a2a2a] transition-colors duration-200"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Shield className="h-4 w-4 mr-3" />
                        Security
                      </Link>
                      <Link
                        href="/support"
                        className="flex items-center px-4 py-2 text-sm text-[#d1d5db] hover:text-white hover:bg-[#2a2a2a] transition-colors duration-200"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Headphones className="h-4 w-4 mr-3" />
                        Support
                      </Link>
                    </div>
                    
                    <div className="border-t border-[#2a2a2a] pt-2">
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsUserMenuOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors duration-200"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-[#d1d5db] hover:text-white"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-[#1a1a1a] border-t border-[#2a2a2a]"
          >
            <div className="px-4 py-4 space-y-4">
              {/* Mobile Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#888888] h-4 w-4" />
                <Input
                  placeholder="Search markets, assets..."
                  className="pl-10 trading-input"
                />
              </div>

              {/* Mobile Navigation */}
              {mainNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                      isActive
                        ? 'text-[#00ff88] bg-[#00ff88]/10'
                        : 'text-[#d1d5db] hover:text-white hover:bg-[#2a2a2a]'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                    {item.badge && (
                      <Badge className="ml-auto bg-[#00ff88] text-black text-xs px-1 py-0">{item.badge}</Badge>
                    )}
                  </Link>
                );
              })}

              {/* Mobile User Info */}
              <div className="pt-4 border-t border-[#2a2a2a]">
                <div className="flex items-center mb-3">
                  {user?.avatar ? (
                    <img
                      className="h-8 w-8 rounded-full border-2 border-[#00ff88]"
                      src={user.avatar}
                      alt={user.name}
                    />
                  ) : (
                    <div className="h-8 w-8 bg-gradient-to-r from-[#00ff88] to-[#00cc6a] rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-black" />
                    </div>
                  )}
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white">{user?.name}</p>
                    <p className="text-sm text-[#888888]">{user?.email}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <Link
                    href="/profile"
                    className="flex items-center px-3 py-2 text-sm text-[#d1d5db] hover:text-white hover:bg-[#2a2a2a] rounded-md transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="h-4 w-4 mr-3" />
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center px-3 py-2 text-sm text-[#d1d5db] hover:text-white hover:bg-[#2a2a2a] rounded-md transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center w-full px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md transition-colors duration-200"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
