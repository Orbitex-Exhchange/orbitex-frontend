"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Navigation } from '@/components/layout/Navigation';
import { 
  ArrowRight, 
  Star,
  Shield,
  Zap,
  TrendingUp,
  Users,
  Activity,
  Cpu,
  Search,
  Bell,
  Settings,
  Menu,
  Sparkles,
  Coins,
  Percent,
  BarChart3,
  Play,
  CheckCircle,
  Globe,
  Wallet,
  Lock,
  Rocket,
  Target,
  Award,
  Eye,
  EyeOff,
  ChevronDown,
  User,
  Bitcoin,
  DollarSign,
  Clock,
  ArrowUp,
  ArrowDown,
  Layers,
  Database,
  Network,
  Code,
  Terminal,
  Smartphone,
  Monitor,
  Server,
  Cloud,
  ShieldCheck,
  Gauge,
  Timer,
  Heart,
  MessageCircle,
  Share2,
  Download,
  Upload,
  ExternalLink,
  X,
  ChevronRight,
  ChevronLeft,
  Maximize2,
  Minimize2,
  RotateCcw,
  PlayCircle,
  PauseCircle,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Settings2,
  HelpCircle,
  Info,
  AlertCircle,
  Check,
  XCircle,
  AlertTriangle,
  Lightbulb,
  Sun,
  Moon,
  CloudRain,
  CloudLightning,
  CloudSnow,
  CloudFog,
  CloudSun,
  CloudMoon,
  Droplets,
  Thermometer,
  Calendar,
  Watch,
  Hourglass,
  CalendarDays,
  CalendarCheck,
  CalendarX,
  CalendarPlus,
  CalendarMinus,
  CalendarRange,
  CalendarSearch,
  CalendarHeart,
  CalendarClock,
  CalendarOff
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { scrollY } = useScroll();

  // Parallax effects
  const heroY = useTransform(scrollY, [0, 500], [0, -100]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // Mock data
  const stats = [
    { label: 'Trading Volume', value: '$2.5B+', icon: TrendingUp, color: 'text-gradient-primary' },
    { label: 'Active Users', value: '500K+', icon: Users, color: 'text-gradient-primary' },
    { label: 'Trading Pairs', value: '150+', icon: BarChart3, color: 'text-gradient-primary' },
    { label: 'Uptime', value: '99.99%', icon: Activity, color: 'text-gradient-primary' }
  ];

  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Sub-millisecond order execution with 99.99% uptime guarantee',
      gradient: 'from-[hsl(var(--trading-accent))] to-[hsl(var(--trading-accent-secondary))]',
      color: 'text-[hsl(var(--trading-accent))]'
    },
    {
      icon: Shield,
      title: 'Bank-Grade Security',
      description: 'Multi-layer security with cold storage and insurance protection',
      gradient: 'from-[hsl(var(--trading-accent))] to-[hsl(var(--trading-accent-secondary))]',
      color: 'text-[hsl(var(--trading-accent))]'
    },
    {
      icon: Cpu,
      title: 'Advanced Trading',
      description: 'Professional tools with 100+ technical indicators and AI insights',
      gradient: 'from-[hsl(var(--trading-accent))] to-[hsl(var(--trading-accent-secondary))]',
      color: 'text-[hsl(var(--trading-accent))]'
    }
  ];

  const tradingFeatures = [
    {
      title: 'Spot Trading',
      description: 'Trade 150+ cryptocurrencies with zero fees',
      icon: Coins,
      color: 'text-[hsl(var(--trading-accent))]'
    },
    {
      title: 'Futures & Options',
      description: 'Advanced derivatives with up to 125x leverage',
      icon: TrendingUp,
      color: 'text-[hsl(var(--trading-accent))]'
    },
    {
      title: 'Staking & Yield',
      description: 'Earn up to 15% APY on your crypto holdings',
      icon: Percent,
      color: 'text-[hsl(var(--trading-accent))]'
    },
    {
      title: 'NFT Marketplace',
      description: 'Trade, mint, and collect unique digital assets',
      icon: Star,
      color: 'text-[hsl(var(--trading-accent))]'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--trading-bg))] via-[hsl(var(--trading-bg-secondary))] to-[hsl(var(--trading-bg))] trading-font overflow-hidden">
      {/* Navigation */}
      <Navigation />

      {/* Enhanced Hero Section */}
      <motion.section 
        className="relative min-h-screen flex items-center justify-center pt-16"
        style={{ y: heroY, opacity: heroOpacity }}
      >
        {/* Enhanced Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-[hsl(var(--trading-accent))]/10 to-[hsl(var(--trading-accent-secondary))]/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-[hsl(var(--trading-accent))]/10 to-[hsl(var(--trading-accent-secondary))]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-[hsl(var(--trading-accent))]/5 to-[hsl(var(--trading-accent-secondary))]/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Enhanced Badge */}
            <motion.div variants={itemVariants} className="mb-8">
              <Badge className="badge-gradient-primary px-4 py-2 text-sm border-0 shadow-lg">
                <Sparkles className="h-4 w-4 mr-2" />
                Next Generation Trading Platform
              </Badge>
            </motion.div>

            {/* Enhanced Main Heading */}
            <motion.h1 
              variants={itemVariants}
              className="text-5xl md:text-7xl lg:text-8xl font-bold text-[hsl(var(--trading-text))] mb-6 leading-tight"
            >
              The Future of
              <span className="block text-gradient-primary">
                Crypto Trading
              </span>
            </motion.h1>

            {/* Enhanced Subtitle */}
            <motion.p 
              variants={itemVariants}
              className="text-xl md:text-2xl text-[hsl(var(--trading-text-secondary))] mb-12 max-w-4xl mx-auto leading-relaxed"
            >
              Experience institutional-grade trading with lightning-fast execution, 
              advanced security, and professional tools designed for serious traders.
            </motion.p>

            {/* Enhanced CTA Buttons */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            >
              <Link href="/trade">
                <Button size="lg" className="text-lg px-8 py-6 btn-gradient-primary shadow-2xl">
                  Start Trading
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-[hsl(var(--trading-border))] text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))] hover:border-[hsl(var(--trading-accent))] transition-all duration-300">
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </Link>
            </motion.div>

            {/* Enhanced Stats */}
            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center group"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className={`${stat.color} text-3xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300`}>
                    {stat.value}
                  </div>
                  <div className="text-[hsl(var(--trading-text-muted))] text-sm group-hover:text-[hsl(var(--trading-text-secondary))] transition-colors duration-300">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Enhanced Floating Elements */}
        <motion.div
          className="absolute top-1/4 right-1/4"
          variants={floatingVariants}
          animate="animate"
        >
          <div className="w-4 h-4 bg-gradient-to-r from-[hsl(var(--trading-accent))] to-[hsl(var(--trading-accent-secondary))] rounded-full shadow-lg"></div>
        </motion.div>
        <motion.div
          className="absolute bottom-1/4 left-1/4"
          variants={floatingVariants}
          animate="animate"
          style={{ animationDelay: '1s' }}
        >
          <div className="w-6 h-6 bg-gradient-to-r from-[hsl(var(--trading-accent))] to-[hsl(var(--trading-accent-secondary))] rounded-full shadow-lg"></div>
        </motion.div>
      </motion.section>

      {/* Enhanced Features Section */}
      <motion.section 
        className="py-24 relative"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-[hsl(var(--trading-text))] mb-6">
              Why Choose <span className="text-gradient-primary">Orbitex</span>?
            </h2>
            <p className="text-xl text-[hsl(var(--trading-text-secondary))] max-w-3xl mx-auto">
              Built for traders who demand the best. Experience the difference with our 
              cutting-edge technology and unwavering commitment to excellence.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ y: -10 }}
                className="group"
              >
                <Card className="card-gradient-primary hover:border-[hsl(var(--trading-accent))]/30 transition-all duration-300 shadow-xl">
                  <CardHeader className="text-center">
                    <motion.div
                      className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                      whileHover={{ rotate: 5 }}
                    >
                      <feature.icon className="h-8 w-8 text-white" />
                    </motion.div>
                    <CardTitle className="text-[hsl(var(--trading-text))] text-2xl group-hover:text-gradient-primary transition-all duration-300">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-[hsl(var(--trading-text-secondary))] text-lg leading-relaxed group-hover:text-[hsl(var(--trading-text))] transition-colors duration-300">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Enhanced Trading Platform Preview with Laptop Design */}
      <motion.section 
        className="py-24 bg-gradient-to-br from-[hsl(var(--trading-bg))] via-[hsl(var(--trading-bg-secondary))] to-[hsl(var(--trading-bg))] relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        {/* Enhanced Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-[hsl(var(--trading-accent))]/5 to-[hsl(var(--trading-accent-secondary))]/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-[hsl(var(--trading-accent))]/5 to-[hsl(var(--trading-accent-secondary))]/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-[hsl(var(--trading-accent))]/3 to-[hsl(var(--trading-accent-secondary))]/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-[hsl(var(--trading-text))] mb-6">
              Professional <span className="text-gradient-primary">Trading Platform</span>
            </h2>
            <p className="text-xl text-[hsl(var(--trading-text-secondary))] max-w-3xl mx-auto">
              Experience the power of institutional-grade trading tools with our 
              advanced platform designed for serious traders.
            </p>
          </motion.div>

          {/* Enhanced Professional Trading Platform Display - OKX Style */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative max-w-7xl mx-auto"
          >
            {/* Enhanced Main Container */}
            <div className="relative">
              {/* Enhanced Laptop Frame - Cleaner Design */}
              <div className="relative bg-gradient-to-b from-[hsl(var(--trading-bg-tertiary))] to-[hsl(var(--trading-bg))] rounded-t-2xl border-4 border-[hsl(var(--trading-border))] shadow-2xl overflow-hidden">
                {/* Enhanced Screen Bezel - Thinner */}
                <div className="bg-[hsl(var(--trading-bg))] p-1">
                  {/* Enhanced Camera - Smaller */}
                  <div className="w-2 h-2 bg-gradient-to-r from-[hsl(var(--trading-border))] to-[hsl(var(--trading-bg-tertiary))] rounded-full mx-auto mb-1"></div>
                  
                  {/* Enhanced Screen Content - Trade.png Image with Better Proportions */}
                  <div className="bg-[hsl(var(--trading-bg))] rounded-lg overflow-hidden relative">
                    <img 
                      src="/trade.png" 
                      alt="Orbitex Trading Platform" 
                      className="w-full h-auto object-cover"
                      style={{ 
                        maxHeight: '500px',
                        minHeight: '400px',
                        objectPosition: 'center top'
                      }}
                    />
                    
                    {/* Enhanced Overlay for Professional Look */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--trading-bg))]/20 to-transparent pointer-events-none"></div>
                  </div>
                </div>
              </div>

              {/* Enhanced Laptop Base - Thinner */}
              <div className="bg-gradient-to-b from-[hsl(var(--trading-border))] to-[hsl(var(--trading-bg-secondary))] h-6 rounded-b-2xl border-4 border-[hsl(var(--trading-border))] border-t-0 shadow-2xl">
                <div className="flex items-center justify-center h-full">
                  <div className="w-24 h-0.5 bg-gradient-to-r from-[hsl(var(--trading-bg-tertiary))] to-[hsl(var(--trading-border))] rounded-full"></div>
                </div>
              </div>

              {/* Enhanced Laptop Stand - More Subtle */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                <div className="w-16 h-2 bg-gradient-to-r from-[hsl(var(--trading-border))] to-[hsl(var(--trading-bg-tertiary))] rounded-full"></div>
              </div>
            </div>

            {/* Enhanced Floating Elements for Professional Touch */}
            <motion.div
              className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-[hsl(var(--trading-accent))] to-[hsl(var(--trading-accent-secondary))] rounded-full opacity-20"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-r from-[hsl(var(--trading-accent))] to-[hsl(var(--trading-accent-secondary))] rounded-full opacity-15"
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.15, 0.3, 0.15]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            />
          </motion.div>

          {/* Enhanced Advanced Trading Features Surrounding the Laptop */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tradingFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.05 }}
                className="group"
              >
                <Card className="card-gradient-primary hover:border-[hsl(var(--trading-accent))]/30 transition-all duration-300 relative overflow-hidden shadow-xl">
                  {/* Enhanced Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[hsl(var(--trading-accent))]/5 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  
                  <CardHeader className="pb-3 relative z-10">
                    <motion.div 
                      className={`${feature.color} w-12 h-12 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 bg-gradient-to-r from-[hsl(var(--trading-accent))]/10 to-[hsl(var(--trading-accent-secondary))]/10`}
                      whileHover={{ rotate: 5 }}
                    >
                      <feature.icon className="h-6 w-6" />
                    </motion.div>
                    <CardTitle className="text-[hsl(var(--trading-text))] group-hover:text-gradient-primary transition-colors duration-300">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <CardDescription className="text-[hsl(var(--trading-text-secondary))] group-hover:text-[hsl(var(--trading-text))] transition-colors duration-300">
                      {feature.description}
                    </CardDescription>
                    <motion.div
                      className="mt-3 flex items-center text-gradient-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      initial={{ x: -10 }}
                      whileHover={{ x: 0 }}
                    >
                      Learn More
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Enhanced Interactive Stats */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { label: 'Order Execution', value: '<1ms', icon: Zap, color: 'text-gradient-primary' },
              { label: 'Uptime', value: '99.99%', icon: Activity, color: 'text-gradient-primary' },
              { label: 'Security', value: 'Bank-Grade', icon: Shield, color: 'text-gradient-primary' },
              { label: 'Support', value: '24/7', icon: Users, color: 'text-gradient-primary' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="text-center group cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  className={`${stat.color} text-3xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300`}
                  whileHover={{ rotate: 5 }}
                >
                  <stat.icon className="h-8 w-8 mx-auto mb-2" />
                  {stat.value}
                </motion.div>
                <div className="text-[hsl(var(--trading-text-muted))] text-sm group-hover:text-[hsl(var(--trading-text-secondary))] transition-colors duration-300">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Enhanced CTA Section */}
      <motion.section 
        className="py-24 bg-gradient-to-r from-[hsl(var(--trading-accent))] to-[hsl(var(--trading-accent-secondary))]"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Ready to Start Trading?
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
              Join thousands of traders who trust Orbitex for their cryptocurrency trading needs.
              Start your journey today with our professional-grade platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="text-lg px-8 py-6 bg-white text-[hsl(var(--trading-accent))] hover:bg-gray-100 shadow-2xl transition-all duration-300">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/trade">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-[hsl(var(--trading-accent))] transition-all duration-300">
                  View Demo
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Enhanced Footer */}
      <motion.footer 
        className="bg-gradient-to-br from-[hsl(var(--trading-bg))] via-[hsl(var(--trading-bg-secondary))] to-[hsl(var(--trading-bg))] text-[hsl(var(--trading-text))] py-12 border-t border-[hsl(var(--trading-border))]"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 bg-gradient-to-r from-[hsl(var(--trading-accent))] to-[hsl(var(--trading-accent-secondary))] rounded-lg flex items-center justify-center mr-2 shadow-lg">
                  <span className="text-white font-bold">O</span>
                </div>
                <span className="text-xl font-bold text-gradient-primary">Orbitex</span>
              </div>
              <p className="text-[hsl(var(--trading-text-muted))]">
                Advanced cryptocurrency trading platform for professional traders.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h3 className="font-semibold mb-4 text-gradient-primary">Product</h3>
              <ul className="space-y-2 text-[hsl(var(--trading-text-muted))]">
                <li><Link href="/trade" className="hover:text-gradient-primary transition-colors duration-300">Trading</Link></li>
                <li><Link href="/wallets" className="hover:text-gradient-primary transition-colors duration-300">Wallets</Link></li>
                <li><Link href="/earn" className="hover:text-gradient-primary transition-colors duration-300">Earn</Link></li>
                <li><Link href="/api" className="hover:text-gradient-primary transition-colors duration-300">API</Link></li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="font-semibold mb-4 text-gradient-primary">Support</h3>
              <ul className="space-y-2 text-[hsl(var(--trading-text-muted))]">
                <li><Link href="/help" className="hover:text-gradient-primary transition-colors duration-300">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-gradient-primary transition-colors duration-300">Contact Us</Link></li>
                <li><Link href="/status" className="hover:text-gradient-primary transition-colors duration-300">System Status</Link></li>
                <li><Link href="/security" className="hover:text-gradient-primary transition-colors duration-300">Security</Link></li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h3 className="font-semibold mb-4 text-gradient-primary">Company</h3>
              <ul className="space-y-2 text-[hsl(var(--trading-text-muted))]">
                <li><Link href="/about" className="hover:text-gradient-primary transition-colors duration-300">About</Link></li>
                <li><Link href="/careers" className="hover:text-gradient-primary transition-colors duration-300">Careers</Link></li>
                <li><Link href="/press" className="hover:text-gradient-primary transition-colors duration-300">Press</Link></li>
                <li><Link href="/legal" className="hover:text-gradient-primary transition-colors duration-300">Legal</Link></li>
              </ul>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="border-t border-[hsl(var(--trading-border))] mt-8 pt-8 text-center text-[hsl(var(--trading-text-muted))]"
          >
            <p>&copy; 2025 Orbitex. All rights reserved.</p>
          </motion.div>
        </div>
      </motion.footer>
    </div>
  );
}
