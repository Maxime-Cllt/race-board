# --- Stage 1: Base ---
FROM node:25-alpine AS base
# Installation de bun (sans npm)
COPY --from=oven/bun:1.2.22-alpine /usr/local/bin/bun /usr/local/bin/bun
WORKDIR /app

# --- Stage 2: Deps ---
FROM base AS deps
# libc6-compat est nécessaire pour certaines dépendances natives sur Alpine
RUN apk add --no-cache libc6-compat
COPY package.json bun.lock* ./
RUN bun install

# --- Stage 3: Builder ---
FROM base AS builder
WORKDIR /app
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

RUN bun run build

# --- Stage 4: Runner (Poids plume) ---
FROM node:25-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME="0.0.0.0"

# Création de l'utilisateur sécurité
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# On ne copie que le standalone et les assets statiques
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

# PORT is set at runtime via docker-compose environment (APP_PORT)

# On lance node directement, pas besoin de bun en runtime !
CMD ["node", "server.js"]
