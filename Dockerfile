# ============================================
# Multi-stage Dockerfile for Ecommerce Monolith
# Optimized for production deployment
# ============================================

# ============================================
# Stage 1: Base Dependencies
# ============================================
FROM node:20-alpine AS deps-base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# ============================================
# Stage 2: Build Strapi Backend
# ============================================
FROM deps-base AS backend-builder

WORKDIR /app/backend

# Copy package files
COPY backend/package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY backend/ ./

# Build Strapi
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build

# Prune to production dependencies only
RUN npm prune --production

# ============================================
# Stage 3: Build Next.js Frontend
# ============================================
FROM deps-base AS frontend-builder

WORKDIR /app

# Copy shared types first (needed for build)
COPY shared/ ./shared/

# Copy frontend package files
COPY frontend/package*.json ./frontend/

WORKDIR /app/frontend

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Copy frontend source
COPY frontend/ ./

# Build arguments for Next.js
ARG NEXT_PUBLIC_API_URL=http://localhost:3000/api
ARG NEXT_PUBLIC_STRAPI_URL=http://localhost:3000
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

# Set environment variables for build
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_STRAPI_URL=${NEXT_PUBLIC_STRAPI_URL}
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Build Next.js
RUN npm run build

# Prune to production dependencies (TypeScript is now in dependencies, so it will remain)
RUN npm prune --production

# ============================================
# Stage 4: Production Runtime
# ============================================
FROM node:20-alpine AS runner

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

WORKDIR /app

# ============================================
# Copy Strapi Backend (with production deps)
# ============================================
COPY --from=backend-builder --chown=nodejs:nodejs /app/backend/package*.json ./backend/
COPY --from=backend-builder --chown=nodejs:nodejs /app/backend/node_modules ./backend/node_modules
COPY --from=backend-builder --chown=nodejs:nodejs /app/backend/dist ./backend/dist
COPY --from=backend-builder --chown=nodejs:nodejs /app/backend/build ./backend/build
COPY --from=backend-builder --chown=nodejs:nodejs /app/backend/public ./backend/public

# Copy compiled config files from dist to root config folder (Strapi expects them there in production)
COPY --from=backend-builder --chown=nodejs:nodejs /app/backend/dist/config ./backend/config

# Create uploads and tmp directories with correct permissions
RUN mkdir -p backend/public/uploads backend/.tmp .tmp && \
    chown -R nodejs:nodejs backend/public backend/.tmp .tmp

# ============================================
# Copy Next.js Frontend (with production deps including TypeScript)
# ============================================
COPY --from=frontend-builder --chown=nodejs:nodejs /app/frontend/package*.json ./frontend/
COPY --from=frontend-builder --chown=nodejs:nodejs /app/frontend/node_modules ./frontend/node_modules
COPY --from=frontend-builder --chown=nodejs:nodejs /app/frontend/.next ./frontend/.next
COPY --from=frontend-builder --chown=nodejs:nodejs /app/frontend/public ./frontend/public
COPY --from=frontend-builder --chown=nodejs:nodejs /app/frontend/next.config.ts ./frontend/
COPY --from=frontend-builder --chown=nodejs:nodejs /app/frontend/tsconfig.json ./frontend/

# ============================================
# Copy Shared Types and Server Files
# ============================================
COPY --chown=nodejs:nodejs shared/ ./shared/
COPY --chown=nodejs:nodejs server.js ./
COPY --chown=nodejs:nodejs start-production.js ./
COPY --chown=nodejs:nodejs package*.json ./

# Install root production dependencies (if any)
RUN npm ci --only=production 2>/dev/null || true

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check with proper error handling and longer start period
HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)}).on('error', () => process.exit(1))"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application with production script
CMD ["node", "start-production.js"]
