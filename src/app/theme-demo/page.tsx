"use client";

import { useTheme } from '@/contexts/ThemeContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  Sun, 
  Moon, 
  Palette, 
  CheckCircle, 
  Star,
  Zap,
  Shield,
  TrendingUp,
  Users,
  Activity
} from 'lucide-react';

export default function ThemeDemoPage() {
  const { theme, toggleTheme } = useTheme();

  const features = [
    {
      icon: Sun,
      title: 'Light Theme',
      description: 'Clean, bright interface perfect for daytime trading',
      gradient: 'from-yellow-400 to-orange-500'
    },
    {
      icon: Moon,
      title: 'Dark Theme',
      description: 'Easy on the eyes for extended trading sessions',
      gradient: 'from-blue-600 to-purple-600'
    },
    {
      icon: Palette,
      title: 'Auto Switch',
      description: 'Automatically adapts to your system preference',
      gradient: 'from-green-400 to-blue-500'
    }
  ];

  const stats = [
    { label: 'Theme Switches', value: '∞', icon: Zap, color: 'text-gradient-primary' },
    { label: 'Smooth Transitions', value: '100%', icon: CheckCircle, color: 'text-gradient-primary' },
    { label: 'User Preference', value: 'Saved', icon: Star, color: 'text-gradient-primary' },
    { label: 'System Sync', value: 'Auto', icon: Activity, color: 'text-gradient-primary' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--trading-bg))] via-[hsl(var(--trading-bg-secondary))] to-[hsl(var(--trading-bg))] trading-font">
      {/* Header */}
      <motion.header 
        className="bg-gradient-to-r from-[hsl(var(--trading-bg-secondary))] to-[hsl(var(--trading-bg))] border-b border-[hsl(var(--trading-border))] glass"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-r from-[hsl(var(--trading-accent))] to-[hsl(var(--trading-accent-secondary))] rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">O</span>
              </div>
              <span className="text-xl font-bold text-gradient-primary">Orbitex</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-[hsl(var(--trading-text-secondary))] text-sm">
                Current Theme: <span className="text-gradient-primary font-medium capitalize">{theme}</span>
              </span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <Badge className="badge-gradient-primary px-4 py-2 text-sm border-0 shadow-lg mb-6">
            <Palette className="h-4 w-4 mr-2" />
            Theme Demo
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold text-[hsl(var(--trading-text))] mb-6">
            Beautiful <span className="text-gradient-primary">Theme Switching</span>
          </h1>
          
          <p className="text-xl text-[hsl(var(--trading-text-secondary))] max-w-3xl mx-auto mb-8">
            Experience seamless theme switching with our advanced trading platform. 
            Switch between light and dark themes with smooth animations and persistent preferences.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={toggleTheme}
              size="lg" 
              className="text-lg px-8 py-6 btn-gradient-primary shadow-2xl"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="mr-2 h-5 w-5" />
                  Switch to Light
                </>
              ) : (
                <>
                  <Moon className="mr-2 h-5 w-5" />
                  Switch to Dark
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
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
                  <CardTitle className="text-[hsl(var(--trading-text))] text-2xl group-hover:text-gradient-primary transition-all duration-300">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-[hsl(var(--trading-text-secondary))] text-lg leading-relaxed group-hover:text-[hsl(var(--trading-text))] transition-colors duration-300">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="text-center group"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className={`${stat.color} text-3xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="h-8 w-8 mx-auto mb-2" />
                {stat.value}
              </div>
              <div className="text-[hsl(var(--trading-text-muted))] text-sm group-hover:text-[hsl(var(--trading-text-secondary))] transition-colors duration-300">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Theme Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Light Theme Preview */}
          <Card className="card-gradient-primary shadow-xl">
            <CardHeader>
              <CardTitle className="text-[hsl(var(--trading-text))] flex items-center">
                <Sun className="h-6 w-6 mr-2 text-yellow-500" />
                Light Theme
              </CardTitle>
              <CardDescription className="text-[hsl(var(--trading-text-secondary))]">
                Perfect for bright environments and daytime trading
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-900 font-medium">Sample Component</span>
                    <Badge className="bg-blue-500 text-white">Active</Badge>
                  </div>
                  <p className="text-gray-600 text-sm">This is how components look in light theme</p>
                </div>
                <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                  Light Theme Button
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Dark Theme Preview */}
          <Card className="card-gradient-primary shadow-xl">
            <CardHeader>
              <CardTitle className="text-[hsl(var(--trading-text))] flex items-center">
                <Moon className="h-6 w-6 mr-2 text-blue-400" />
                Dark Theme
              </CardTitle>
              <CardDescription className="text-[hsl(var(--trading-text-secondary))]">
                Easy on the eyes for extended trading sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-100 font-medium">Sample Component</span>
                    <Badge className="bg-blue-500 text-white">Active</Badge>
                  </div>
                  <p className="text-gray-300 text-sm">This is how components look in dark theme</p>
                </div>
                <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                  Dark Theme Button
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="text-center mt-16"
        >
          <h2 className="text-3xl font-bold text-[hsl(var(--trading-text))] mb-4">
            Ready to Experience the Full Platform?
          </h2>
          <p className="text-[hsl(var(--trading-text-secondary))] mb-8 max-w-2xl mx-auto">
            Explore our complete trading platform with advanced features, real-time data, 
            and professional tools designed for serious traders.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-6 btn-gradient-primary shadow-2xl">
              Start Trading
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-[hsl(var(--trading-border))] text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))] hover:border-[hsl(var(--trading-accent))] transition-all duration-300">
              View Documentation
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
