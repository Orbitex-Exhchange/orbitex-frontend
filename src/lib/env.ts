import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

// Helper to handle optional URLs (empty strings become undefined before URL validation)
const optionalUrl = z.preprocess(
  (val) => (val === '' || val === undefined ? undefined : val),
  z.string().url().optional()
);

// Helper to handle optional strings (empty strings become undefined)
const optionalString = z.preprocess(
  (val) => (val === '' || val === undefined ? undefined : val),
  z.string().optional()
);

// Helper to convert string to boolean
const booleanFromString = z.preprocess(
  (val) => {
    if (typeof val === 'string') {
      return val === 'true' || val === '1';
    }
    return val === true || val === 1;
  },
  z.boolean()
);

export const env = createEnv({

  client: {
    // API URLs
    NEXT_PUBLIC_API_URL: z.string().url().default('https://orbitex-976099405307.us-central1.run.app'),
    // Point directly to Orbisigner v2 identity base for clean endpoint usage
    NEXT_PUBLIC_AUTH_SERVICE_URL: z.string().url().default('https://orbisigner-976099405307.us-central1.run.app/api/v2/identity'),

    // Frontend URLs
    NEXT_PUBLIC_FRONTEND_URL: z.string().url().default('https://orbitex-frontend.vercel.app'),
    NEXT_PUBLIC_ADMIN_DASHBOARD_URL: z.string().url().default('https://orbitex-admin-dashboard.vercel.app'),

    // WebSocket URLs
    NEXT_PUBLIC_WS_URL: z.string().default('wss://socketeer-976099405307.us-central1.run.app/public'),

    // Feature flags - parse from strings
    NEXT_PUBLIC_ENABLE_2FA: booleanFromString.default(true),
    NEXT_PUBLIC_ENABLE_KYC: booleanFromString.default(true),
    NEXT_PUBLIC_ENABLE_WEBAUTHN: booleanFromString.default(false),

    // Analytics
    NEXT_PUBLIC_GA_ID: optionalString,
    NEXT_PUBLIC_SENTRY_DSN: optionalUrl,

    // External services
    NEXT_PUBLIC_KYC_AID_URL: optionalUrl,
  },
  runtimeEnv: {
    // Client variables only (matching the client schema above)
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
