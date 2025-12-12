# Multi-stage build for Next.js frontend
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

# Build-time environment variables for Next.js (NEXT_PUBLIC_* must be set at build time)
ARG NEXT_PUBLIC_API_URL=https://orbitex-976099405307.us-central1.run.app
ARG NEXT_PUBLIC_AUTH_SERVICE_URL=https://orbisigner-976099405307.us-central1.run.app/api/v2/identity
ARG NEXT_PUBLIC_FRONTEND_URL=https://orbitex-frontend-976099405307.us-central1.run.app
ARG NEXT_PUBLIC_WS_URL=wss://socketeer-976099405307.us-central1.run.app/public
ARG NEXT_PUBLIC_ENABLE_2FA=false
ARG NEXT_PUBLIC_ENABLE_KYC=false
ARG NEXT_PUBLIC_ENABLE_WEBAUTHN=false
ARG SKIP_ENV_VALIDATION=true

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_AUTH_SERVICE_URL=$NEXT_PUBLIC_AUTH_SERVICE_URL
ENV NEXT_PUBLIC_FRONTEND_URL=$NEXT_PUBLIC_FRONTEND_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL
ENV NEXT_PUBLIC_ENABLE_2FA=$NEXT_PUBLIC_ENABLE_2FA
ENV NEXT_PUBLIC_ENABLE_KYC=$NEXT_PUBLIC_ENABLE_KYC
ENV NEXT_PUBLIC_ENABLE_WEBAUTHN=$NEXT_PUBLIC_ENABLE_WEBAUTHN
ENV SKIP_ENV_VALIDATION=$SKIP_ENV_VALIDATION

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]
