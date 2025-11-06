# Multi-stage Dockerfile for Ecommerce Monolith

# Stage 1: Build Strapi
FROM node:18-alpine AS strapi-builder
WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci --only=production

COPY backend/ ./
RUN npm run build

# Stage 2: Build Next.js
FROM node:18-alpine AS nextjs-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
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

RUN npm run build

# Stage 3: Production runtime
FROM node:18-alpine
WORKDIR /app

# Install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy Strapi
COPY --from=strapi-builder /app/backend ./backend

# Copy Next.js
COPY --from=nextjs-builder /app/frontend/.next ./frontend/.next
COPY --from=nextjs-builder /app/frontend/public ./frontend/public
COPY --from=nextjs-builder /app/frontend/package*.json ./frontend/
COPY --from=nextjs-builder /app/frontend/next.config.* ./frontend/

# Install frontend production dependencies
WORKDIR /app/frontend
RUN npm ci --only=production

WORKDIR /app

# Copy shared types
COPY shared/ ./shared/

# Copy server
COPY server.js ./

# Create uploads directory
RUN mkdir -p backend/public/uploads

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "server.js"]
