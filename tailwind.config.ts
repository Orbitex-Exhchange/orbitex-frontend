import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Modern trading platform colors
        trading: {
          primary: 'hsl(var(--trading-accent))',
          secondary: 'hsl(var(--trading-accent-secondary))',
          accent: 'hsl(var(--trading-accent))',
          background: {
            DEFAULT: 'hsl(var(--trading-bg))',
            secondary: 'hsl(var(--trading-bg-secondary))',
            tertiary: 'hsl(var(--trading-bg-tertiary))',
            dark: '#0a0a0a',
            medium: '#1a1a1a',
            light: '#2a2a2a',
            panel: '#0f0f0f'
          },
          text: {
            DEFAULT: 'hsl(var(--trading-text))',
            secondary: 'hsl(var(--trading-text-secondary))',
            muted: 'hsl(var(--trading-text-muted))',
            primary: '#ffffff',
            success: 'hsl(var(--trading-success))',
            error: 'hsl(var(--trading-error))',
            warning: 'hsl(var(--trading-warning))'
          },
          border: {
            DEFAULT: 'hsl(var(--trading-border))',
            light: '#3a3a3a',
            medium: '#2a2a2a',
            dark: '#1a1a1a'
          },
          success: 'hsl(var(--trading-success))',
          error: 'hsl(var(--trading-error))',
          warning: 'hsl(var(--trading-warning))',
          info: 'hsl(var(--trading-info))'
        },
        // Shadcn/ui colors
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        }
      },
      fontFamily: {
        'trading': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: [
          'Inter',
          'system-ui',
          'sans-serif'
        ]
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s linear infinite',
        'loading': 'loading 1.5s infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 255, 136, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 255, 136, 0.8)' }
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        loading: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' }
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'trading': '0 4px 6px -1px rgba(0, 255, 136, 0.1), 0 2px 4px -1px rgba(0, 255, 136, 0.06)',
        'trading-lg': '0 10px 15px -3px rgba(0, 255, 136, 0.1), 0 4px 6px -2px rgba(0, 255, 136, 0.05)',
        'trading-xl': '0 20px 25px -5px rgba(0, 255, 136, 0.1), 0 10px 10px -5px rgba(0, 255, 136, 0.04)'
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('tailwindcss-animate'),
    // Custom plugin for trading-specific utilities
    function({ addUtilities, theme }: any) {
      const newUtilities = {
        '.text-gradient-primary': {
          background: 'linear-gradient(135deg, hsl(var(--trading-accent)), hsl(var(--trading-accent-secondary)))',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.bg-gradient-primary': {
          background: 'linear-gradient(135deg, hsl(var(--trading-accent)), hsl(var(--trading-accent-secondary)))',
        },
        '.card-gradient-primary': {
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
        },
        '.btn-gradient-primary': {
          background: 'linear-gradient(135deg, hsl(var(--trading-accent)), hsl(var(--trading-accent-secondary)))',
          color: 'white',
          border: 'none',
          transition: 'all 0.3s ease',
        },
        '.btn-gradient-primary:hover': {
          transform: 'translateY(-1px)',
          boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
        },
        '.glass': {
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          '-webkit-backdrop-filter': 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.dark .glass': {
          background: 'rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.trading-input': {
          background: 'hsl(var(--trading-bg-tertiary))',
          border: '1px solid hsl(var(--trading-border))',
          color: 'hsl(var(--trading-text))',
          transition: 'all 0.2s ease',
        },
        '.trading-input:focus': {
          borderColor: 'hsl(var(--trading-accent))',
          boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.1)',
        },
        '.focus-ring:focus': {
          outline: 'none',
          ring: '2px',
          ringColor: 'hsl(var(--trading-accent))',
          ringOffset: '2px',
        },
        '.loading-skeleton': {
          background: 'linear-gradient(90deg, hsl(var(--trading-bg-tertiary)) 25%, hsl(var(--trading-bg-secondary)) 50%, hsl(var(--trading-bg-tertiary)) 75%)',
          backgroundSize: '200% 100%',
          animation: 'loading 1.5s infinite',
        },
        '.custom-scrollbar': {
          scrollbarWidth: 'thin',
          scrollbarColor: 'hsl(var(--trading-border)) transparent',
        },
        '.custom-scrollbar::-webkit-scrollbar': {
          width: '6px',
          height: '6px',
        },
        '.custom-scrollbar::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '.custom-scrollbar::-webkit-scrollbar-thumb': {
          backgroundColor: 'hsl(var(--trading-border))',
          borderRadius: '3px',
        },
        '.custom-scrollbar::-webkit-scrollbar-thumb:hover': {
          backgroundColor: 'hsl(var(--trading-text-muted))',
        },
      }
      addUtilities(newUtilities)
    }
  ],
}

export default config
