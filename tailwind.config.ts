import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Modern trading platform colors
        trading: {
          primary: '#00ff88',
          secondary: '#ff4444',
          accent: '#00cc6a',
          background: {
            dark: '#0a0a0a',
            medium: '#1a1a1a',
            light: '#2a2a2a',
            panel: '#0f0f0f'
          },
          text: {
            primary: '#ffffff',
            secondary: '#d1d5db',
            muted: '#888888',
            success: '#00ff88',
            error: '#ff4444',
            warning: '#ffaa00'
          },
          border: {
            light: '#3a3a3a',
            medium: '#2a2a2a',
            dark: '#1a1a1a'
          }
        }
      },
      fontFamily: {
        'trading': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate'
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
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 255, 136, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 255, 136, 0.8)' }
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'trading': '0 4px 6px -1px rgba(0, 255, 136, 0.1), 0 2px 4px -1px rgba(0, 255, 136, 0.06)',
        'trading-lg': '0 10px 15px -3px rgba(0, 255, 136, 0.1), 0 4px 6px -2px rgba(0, 255, 136, 0.05)',
        'trading-xl': '0 20px 25px -5px rgba(0, 255, 136, 0.1), 0 10px 10px -5px rgba(0, 255, 136, 0.04)'
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('tailwindcss-animate')
  ],
}

export default config
