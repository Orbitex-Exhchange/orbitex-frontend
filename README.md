# Orbitex Frontend

A modern, high-performance cryptocurrency trading platform built with Next.js 15, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Next.js 15** with App Router and Server Components
- **TypeScript** for type safety and better developer experience
- **Tailwind CSS** with custom trading theme
- **Framer Motion** for smooth animations
- **React Query** for server state management
- **Authentication** with JWT and 2FA support
- **Real-time trading** with WebSocket connections
- **Responsive design** for all devices
- **Dark/Light theme** support
- **Performance optimized** with code splitting and lazy loading

## 📋 Prerequisites

- Node.js 18.17.0 or higher
- npm 9.0.0 or higher
- Git

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and fill in your configuration values.

4. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🔧 Configuration

### Environment Variables

The application uses environment variables for configuration. Copy `.env.example` to `.env.local` and configure the following:

#### Required Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_AUTH_SERVICE_URL` - Authentication service URL
- `NEXT_PUBLIC_FRONTEND_URL` - Frontend application URL
- `NEXT_PUBLIC_WS_URL` - WebSocket URL for real-time data

#### Optional Variables

- `NEXT_PUBLIC_ENABLE_2FA` - Enable two-factor authentication (default: true)
- `NEXT_PUBLIC_ENABLE_KYC` - Enable KYC features (default: true)
- `NEXT_PUBLIC_GA_ID` - Google Analytics ID
- `NEXT_PUBLIC_SENTRY_DSN` - Sentry error tracking DSN

### Development Configuration

The project is configured for optimal development experience:

- **TypeScript** with strict mode enabled
- **ESLint** with Next.js and TypeScript rules
- **Prettier** for code formatting
- **Husky** for git hooks
- **Lint-staged** for pre-commit linting

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Shadcn/ui components
│   │   └── layout/         # Layout components
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions and configurations
│   ├── store/              # State management
│   ├── types/              # TypeScript type definitions
│   └── styles/             # Global styles
├── public/                 # Static assets
├── mocks/                  # Mock data and services
└── tests/                  # Test files
```

## 🎨 Styling

The project uses a custom trading theme built with Tailwind CSS:

### Color Scheme

- **Primary**: Green gradient (`#00ff88` to `#00cc6a`)
- **Background**: Dark theme with multiple levels
- **Text**: High contrast for readability
- **Borders**: Subtle borders for component separation

### CSS Variables

The theme uses CSS custom properties for consistent styling:

```css
:root {
  --trading-bg: 0 0% 4%;
  --trading-bg-secondary: 0 0% 6%;
  --trading-accent: 142 76% 36%;
  --trading-text: 0 0% 95%;
  /* ... more variables */
}
```

### Utility Classes

Custom utility classes for common patterns:

- `.text-gradient-primary` - Gradient text
- `.btn-gradient-primary` - Gradient buttons
- `.card-gradient-primary` - Gradient cards
- `.glass` - Glass morphism effect
- `.trading-input` - Styled form inputs

## 🔐 Authentication

The application uses JWT-based authentication with the following features:

- **Login/Logout** with email and password
- **Two-Factor Authentication** (2FA) support
- **Token refresh** for session management
- **Protected routes** with automatic redirects
- **User context** for global state management

### Auth Flow

1. User enters credentials
2. Server validates and returns JWT token
3. Token stored in localStorage
4. User context updated with user data
5. Protected routes become accessible

## 📊 State Management

The application uses multiple state management solutions:

- **React Query** - Server state and caching
- **React Context** - Global UI state
- **Zustand** - Complex client state
- **Local Storage** - Persistent data

## 🧪 Testing

The project includes comprehensive testing setup:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Structure

- **Unit tests** for utility functions
- **Component tests** with React Testing Library
- **Integration tests** for API interactions
- **E2E tests** for critical user flows

## 🚀 Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Setup

1. Set all required environment variables
2. Configure database connections
3. Set up monitoring and analytics
4. Configure CDN for static assets

### Performance Optimization

The build includes several optimizations:

- **Code splitting** by route and component
- **Tree shaking** to remove unused code
- **Image optimization** with Next.js Image component
- **Bundle analysis** with `@next/bundle-analyzer`
- **Caching strategies** for static assets

## 📈 Performance

The application is optimized for performance:

- **Lighthouse Score**: 90+ across all metrics
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1

### Optimization Techniques

- **Server-side rendering** for critical pages
- **Static generation** for marketing pages
- **Lazy loading** for non-critical components
- **Image optimization** with WebP format
- **Font optimization** with `display: swap`

## 🔧 Development Scripts

```bash
# Development
npm run dev              # Start development server
npm run dev:mock         # Start with mock services

# Building
npm run build           # Production build
npm run start           # Start production server
npm run analyze         # Analyze bundle size

# Code Quality
npm run lint            # Run ESLint
npm run type-check      # Run TypeScript check
npm run clean           # Clean build artifacts

# Testing
npm test                # Run tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Generate coverage report
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow TypeScript best practices
- Use ESLint and Prettier for formatting
- Write meaningful commit messages
- Include tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the documentation
- Review existing issues and discussions

## 🔄 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed history of changes.

---

Built with ❤️ by the Orbitex Team
