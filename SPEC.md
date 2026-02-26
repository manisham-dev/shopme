# JewelCart - Jewelry E-Commerce Website Specification

## 1. Project Overview

**Project Name:** JewelCart
**Project Type:** Full-stack E-commerce Web Application
**Core Functionality:** A premium jewelry shopping platform with product catalog, user authentication, shopping cart, and payment processing
**Target Users:** Consumers looking to purchase jewelry online

## 2. Technology Stack

- **Frontend:** Angular 21 with Tailwind CSS
- **Backend:** Node.js 24 with Express.js
- **Database:** PostgreSQL on Docker
- **Authentication:** JWT-based auth
- **Payment Gateway:** Stripe (test mode)
- **Dev Environment:** Ubuntu with VS Code

## 3. UI/UX Specification

### Color Palette
- **Primary:** `#1a1a2e` (Deep Navy)
- **Secondary:** `#16213e` (Dark Blue)
- **Accent:** `#e94560` (Rose Gold Red)
- **Gold Accent:** `#d4af37` (Metallic Gold)
- **Background:** `#0f0f1a` (Near Black)
- **Surface:** `#1f1f2e` (Card Background)
- **Text Primary:** `#ffffff`
- **Text Secondary:** `#a0a0b0`
- **Success:** `#00d9a5`
- **Error:** `#ff4757`

### Typography
- **Headings:** 'Playfair Display', serif (elegant, jewelry-appropriate)
- **Body:** 'Inter', sans-serif (clean, readable)
- **Sizes:**
  - H1: 3rem (48px)
  - H2: 2.25rem (36px)
  - H3: 1.5rem (24px)
  - Body: 1rem (16px)
  - Small: 0.875rem (14px)

### Responsive Breakpoints
- **Mobile:** < 640px
- **Tablet:** 640px - 1024px
- **Desktop:** > 1024px

### Layout Structure
- **Header:** Fixed top navigation with logo, search, cart icon, user menu
- **Hero:** Full-width hero with featured jewelry image and CTA
- **Product Grid:** 1 col mobile, 2 col tablet, 4 col desktop
- **Footer:** Links, newsletter, social icons

### Visual Effects
- Product cards with hover scale (1.02) and shadow
- Smooth page transitions (300ms ease)
- Gold shimmer effect on accent buttons
- Image zoom on product hover

## 4. Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Products Table
```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100),
  image_url VARCHAR(500),
  stock_quantity INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Orders Table
```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  shipping_address TEXT,
  payment_status VARCHAR(50) DEFAULT 'pending',
  stripe_payment_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Order Items Table
```sql
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INT REFERENCES orders(id),
  product_id INT REFERENCES products(id),
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL
);
```

### Cart Items Table
```sql
CREATE TABLE cart_items (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  product_id INT REFERENCES products(id),
  quantity INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 5. API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - List all products (with filters)
- `GET /api/products/:id` - Get product details
- `GET /api/products/featured` - Get featured products

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update cart item quantity
- `DELETE /api/cart/:id` - Remove item from cart
- `DELETE /api/cart` - Clear cart

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get order details

### Payments
- `POST /api/payment/create-intent` - Create Stripe payment intent
- `POST /api/payment/confirm` - Confirm payment

## 6. Page Structure

### Pages
1. **Home** - Hero, featured products, categories
2. **Products** - Product listing with filters
3. **Product Detail** - Single product view with add to cart
4. **Cart** - Shopping cart management
5. **Checkout** - Shipping info, payment
6. **Login** - User login
7. **Register** - User registration
8. **My Orders** - Order history

## 7. Acceptance Criteria

- [ ] Responsive design works on mobile, tablet, desktop
- [ ] User can register and login
- [ ] User can browse products
- [ ] User can add/remove items from cart
- [ ] User can complete checkout with Stripe
- [ ] Orders are saved to database
- [ ] JWT authentication works correctly
- [ ] All API endpoints return proper responses
- [ ] UI matches specified color scheme and typography
