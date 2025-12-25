# Stage 1: Dependencies
FROM node:25-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@latest

# Copy package files
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:25-alpine AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@latest

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments for Next.js public environment variables
ARG NEXT_PUBLIC_APP_MODE
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_API_TOKEN

# Set environment variables for build
ENV NEXT_PUBLIC_APP_MODE=${NEXT_PUBLIC_APP_MODE}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_API_TOKEN=${NEXT_PUBLIC_API_TOKEN}
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN pnpm run build

# Stage 3: Runner
FROM node:25-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install pnpm for running the app
RUN npm install -g pnpm@latest

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Change ownership to nextjs user
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["pnpm", "start"]
