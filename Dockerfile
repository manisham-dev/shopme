FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache nginx curl

COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm ci --only=production

COPY backend/prisma ./prisma/
RUN npx prisma generate

COPY backend/src ./src/

WORKDIR /app

COPY frontend/dist/frontend/browser ./frontend/dist
COPY nginx.conf ./nginx.conf

RUN addgroup -g 1000 -S appgroup && \
    adduser -u 1000 -S appuser -G appgroup

RUN mkdir -p /run/nginx && \
    chown -R appuser:appgroup /run/nginx

RUN chown -R appuser:appgroup /app

USER appuser

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000 80

COPY --chmod=755 startup.sh /startup.sh

CMD ["/startup.sh"]
