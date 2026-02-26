# JewelCart - Jewelry E-Commerce Website

A full-stack e-commerce platform for jewelry built with Angular 21, Node.js 24, PostgreSQL, and Prisma ORM.

## Tech Stack

- **Frontend:** Angular 21 + Tailwind CSS
- **Backend:** Node.js 24 + Express.js
- **Database:** PostgreSQL on Docker with Prisma ORM
- **Payment:** Stripe (test mode)

## Getting Started

### Prerequisites

- Node.js 24+
- Docker Desktop
- npm or yarn

### Setup

1. **Start PostgreSQL:**
   ```bash
   docker compose up -d
   ```

2. **Install Dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Generate Prisma Client & Push Schema:**
   ```bash
   npm run db:generate
   npm run db:push
   ```

4. **Seed Database (creates superadmin & sample products):**
   ```bash
   npm run db:seed
   ```

5. **Start Backend:**
   ```bash
   npm run dev
   ```
   Backend runs on http://localhost:3000

6. **Start Frontend:**
   ```bash
   cd ../frontend
   npm install
   npm start
   ```
   Frontend runs on http://localhost:4200

### Environment Variables

Configure `backend/.env`:

```env
# Server
PORT=3000
NODE_ENV=development

# Database - PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=jewelcart
DB_USER=jewelcart_user
DB_PASSWORD=jewelcart_pass
DATABASE_URL="postgresql://jewelcart_user:jewelcart_pass@localhost:5432/jewelcart?schema=public"

# JWT
JWT_SECRET=jewelcart_super_secret_key_2024
JWT_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Frontend URL
FRONTEND_URL=http://localhost:4200

# Superadmin Credentials
ADMIN_EMAIL=admin@jewelcart.com
ADMIN_PASSWORD=Admin@123456
```

### Database Scripts

```bash
npm run db:generate   # Generate Prisma Client
npm run db:push       # Push schema to database
npm run db:migrate    # Run migrations
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio
npm run db:reset     # Reset database
```

### Features

- User registration and login
- Admin (superadmin) and user roles
- Product catalog with filtering and search
- Shopping cart
- Checkout with Stripe payment
- Order history
- Responsive design (mobile, tablet, desktop)

### Demo Credentials

**Superadmin:**
- Email: admin@jewelcart.com
- Password: Admin@123456

**Stripe Test Card:** `4242 4242 4242 4242`
