import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({

  client: {
    // API URLs
    NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:3333'),
    // Point directly to Orbisigner v2 identity base for clean endpoint usage
    NEXT_PUBLIC_AUTH_SERVICE_URL: z.string().url().default('http://localhost:3330/api/v2'),
    
    // Frontend URLs
    NEXT_PUBLIC_FRONTEND_URL: z.string().url().default('http://localhost:3000'),
    NEXT_PUBLIC_ADMIN_DASHBOARD_URL: z.string().url().default('https://orbitex-admin-dashboard.vercel.app'),
    
    // WebSocket URLs
    NEXT_PUBLIC_WS_URL: z.string().default('ws://localhost:8081/public'),
    
    // Feature flags
    NEXT_PUBLIC_ENABLE_2FA: z.boolean().default(true),
    NEXT_PUBLIC_ENABLE_KYC: z.boolean().default(true),
    NEXT_PUBLIC_ENABLE_WEBAUTHN: z.boolean().default(false),
    
    // Analytics
    NEXT_PUBLIC_GA_ID: z.string().optional(),
    NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
    
    // External services
    NEXT_PUBLIC_KYC_AID_URL: z.string().url().optional(),
  },
  runtimeEnv: {
    // Server variables
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_URL_AUTH: process.env.DATABASE_URL_AUTH,
    REDIS_URL: process.env.REDIS_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    KYC_AID_URL: process.env.KYC_AID_URL,
    SENTRY_DSN: process.env.SENTRY_DSN,
    
    // Client variables
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_AUTH_SERVICE_URL: process.env.NEXT_PUBLIC_AUTH_SERVICE_URL,
    NEXT_PUBLIC_FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL,
    NEXT_PUBLIC_ADMIN_DASHBOARD_URL: process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_URL,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
    NEXT_PUBLIC_ENABLE_2FA: process.env.NEXT_PUBLIC_ENABLE_2FA,
    NEXT_PUBLIC_ENABLE_KYC: process.env.NEXT_PUBLIC_ENABLE_KYC,
    NEXT_PUBLIC_ENABLE_WEBAUTHN: process.env.NEXT_PUBLIC_ENABLE_WEBAUTHN,
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_KYC_AID_URL: process.env.NEXT_PUBLIC_KYC_AID_URL,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
