import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = {
  // API URLs
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://orbitex-backend-976099405307.us-central1.run.app',
  NEXT_PUBLIC_AUTH_SERVICE_URL: process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'https://orbitex-auth-service-976099405307.us-central1.run.app',
  
  // Frontend URLs
  NEXT_PUBLIC_FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://orbitex-frontend.vercel.app',
  NEXT_PUBLIC_ADMIN_DASHBOARD_URL: process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_URL || 'https://orbitex-admin-dashboard.vercel.app',
  
  // WebSocket URLs
  NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'wss://orbitex-backend-976099405307.us-central1.run.app/ws',
  
  // Database Configuration (Google Cloud PostgreSQL 17)
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:orteTCF23r@34.44.134.77:5432/orbitex_auth_db',
  DATABASE_URL_AUTH: process.env.DATABASE_URL_AUTH || 'postgresql://postgres:orteTCF23r@34.44.134.77:5432/orbitex_auth_db',
  
  // Redis Configuration (Google Cloud Redis 7.2)
  REDIS_URL: process.env.REDIS_URL || 'redis://10.8.45.99:6379',
  
  // Feature flags
  NEXT_PUBLIC_ENABLE_2FA: process.env.NEXT_PUBLIC_ENABLE_2FA === 'true',
  NEXT_PUBLIC_ENABLE_KYC: process.env.NEXT_PUBLIC_ENABLE_KYC === 'true',
  NEXT_PUBLIC_ENABLE_WEBAUTHN: process.env.NEXT_PUBLIC_ENABLE_WEBAUTHN === 'true',
  
  // Analytics
  NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // External services
  NEXT_PUBLIC_KYC_AID_URL: process.env.NEXT_PUBLIC_KYC_AID_URL,
  NEXT_PUBLIC_SMTP_HOST: process.env.NEXT_PUBLIC_SMTP_HOST,
  
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
} as const;
