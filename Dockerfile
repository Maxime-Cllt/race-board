# --- Stage 1: Base (Installation de pnpm une seule fois) ---
FROM node:25-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

# --- Stage 2: Deps (Cache des dépendances) ---
FROM base AS deps
RUN apk add --no-cache libc6-compat
COPY package.json pnpm-lock.yaml* ./
# On utilise --frozen-lockfile pour garantir l'intégrité
RUN pnpm install --frozen-lockfile

# --- Stage 3: Builder ---
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables d'environnement de build
ARG NEXT_PUBLIC_APP_MODE
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_API_TOKEN

ENV NEXT_PUBLIC_APP_MODE=${NEXT_PUBLIC_APP_MODE} \
    NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL} \
    NEXT_PUBLIC_API_TOKEN=${NEXT_PUBLIC_API_TOKEN} \
    NEXT_TELEMETRY_DISABLED=1

RUN pnpm run build

# --- Stage 4: Runner ---
FROM node:25-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3001

CMD ["node", "server.js"]