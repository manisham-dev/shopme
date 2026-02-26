#!/bin/sh

set -e

cd /app/backend

if [ -f .env ]; then
  echo "Loading .env file"
else
  echo "DATABASE_URL=postgresql://jewelcart_user:jewelcart_pass@postgres:5432/jewelcart" > .env
  echo "JWT_SECRET=jewelcart-secret-key-change-in-production" >> .env
  echo "STRIPE_SECRET_KEY=" >> .env
fi

npx prisma migrate deploy || true

node src/index.js &

nginx -g 'daemon off;'
