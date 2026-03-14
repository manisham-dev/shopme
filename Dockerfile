# Stage 1: Backend
FROM node:20-alpine AS backend

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci --only=production

COPY backend/prisma ./prisma/
RUN npx prisma generate

COPY backend/src ./src/
COPY backend/public ./public/

# Stage 2: Frontend build
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/src ./src/
COPY frontend/angular.json ./
COPY frontend/tsconfig*.json ./
COPY frontend/tailwind.config.* ./
COPY frontend/postcss.config.* ./

RUN npm run build

# Stage 3: Production
FROM node:20-alpine AS production

RUN apk add --no-cache nginx curl

WORKDIR /app

# Copy backend and frontend
COPY --from=backend /app/backend ./
COPY --from=frontend-build /app/frontend/dist/frontend/browser ./frontend/dist/browser

# Copy nginx config (CACHE BUST)
COPY frontend/nginx.conf /etc/nginx/nginx.conf

# Create directories and set permissions
RUN mkdir -p /run/nginx /var/lib/nginx/tmp/client_body /var/lib/nginx/logs /var/log/nginx && \
    chmod -R 755 /app/frontend/dist

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/products || exit 1

CMD ["sh", "-c", "npx prisma migrate deploy && node src/index.js & nginx -g 'daemon off;'"]
