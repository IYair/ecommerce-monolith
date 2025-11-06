# Multi-stage Dockerfile for Ecommerce Monolith

# Stage 1: Build Strapi
FROM node:20-alpine AS strapi-builder

WORKDIR /app/backend

COPY backend/package*.json ./
# Install ALL dependencies (including devDependencies) for build
RUN npm ci

COPY backend/ ./
ENV NODE_ENV=production
RUN npm run build

# Stage 2: Build Next.js
FROM node:20-alpine AS nextjs-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
# Install ALL dependencies (including devDependencies) for build
RUN npm ci

COPY frontend/ ./
COPY shared/ /app/shared/

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_STRAPI_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_STRAPI_URL=${NEXT_PUBLIC_STRAPI_URL}
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# Stage 3: Production runtime
FROM node:20-alpine

# Set production environment to skip Husky
ENV NODE_ENV=production

WORKDIR /app

# Install all dependencies (needed for next.config.ts and runtime tools)
COPY package*.json ./
RUN npm ci

# Copy Strapi
COPY --from=strapi-builder /app/backend ./backend

# Copy Next.js
COPY --from=nextjs-builder /app/frontend/.next ./frontend/.next
COPY --from=nextjs-builder /app/frontend/public ./frontend/public
COPY --from=nextjs-builder /app/frontend/package*.json ./frontend/
COPY --from=nextjs-builder /app/frontend/next.config.* ./frontend/

# Install frontend dependencies (needed for next.config.ts transpilation)
WORKDIR /app/frontend
RUN npm ci

WORKDIR /app

# Copy shared types
COPY shared/ ./shared/

# Copy server files
COPY server.js ./
COPY start-production.js ./

# Create uploads directory
RUN mkdir -p backend/public/uploads

# Expose port
EXPOSE 3000

# Health check with proper error handling
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)}).on('error', () => process.exit(1))"

# Start the application with production script
CMD ["node", "start-production.js"]
