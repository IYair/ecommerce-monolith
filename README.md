# 🛍️ Ecommerce Monolith

Modern, full-featured ecommerce application built as a monolith using **Strapi CMS** for the backend and **Next.js 14** for the frontend. Designed for easy deployment on platforms like Dokploy.

## 🚀 Features

### Backend (Strapi)

- **Headless CMS** with GraphQL and REST APIs
- **Content Types**: Products, Categories, Orders, Customers
- **Media Upload** with image optimization
- **Role-based Access Control**
- **Custom API endpoints** for featured products and search
- **PostgreSQL** database

### Frontend (Next.js)

- **App Router** with React Server Components
- **TypeScript** for type safety
- **Tailwind CSS** + **shadcn/ui** for beautiful UI
- **Shopping Cart** with persistent state (Zustand + LocalStorage)
- **React Query** for efficient data fetching
- **Stripe Integration** for secure payments
- **Responsive Design** mobile-first approach
- **SEO Optimized** with dynamic metadata

### Architecture

- **Monolithic** deployment (single container/server)
- **Unified server** serving both Strapi and Next.js
- **Docker** ready with multi-stage builds
- **Health checks** for monitoring

## 📋 Prerequisites

- **Node.js** 18+ and npm 9+
- **PostgreSQL** 14+ (or use Docker Compose)
- **Stripe Account** (for payment processing)

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd ecommerce-monolith
```

### 2. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and configure your variables:

```env
# Database
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=your_secure_password
DATABASE_NAME=ecommerce_db

# Strapi Secrets (generate with: openssl rand -base64 32)
STRAPI_ADMIN_JWT_SECRET=your_jwt_secret
STRAPI_API_TOKEN_SALT=your_api_token_salt
STRAPI_JWT_SECRET=your_jwt_secret
STRAPI_TRANSFER_TOKEN_SALT=your_transfer_token_salt
STRAPI_APP_KEYS=key1,key2,key3,key4

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# URLs (adjust for production)
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_STRAPI_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Also create `.env` files for Strapi and Next.js:

```bash
# Backend (Strapi)
cp .env backend/.env

# Frontend (Next.js)
cp frontend/.env.local frontend/.env.local
```

### 3. Install Dependencies

Install all dependencies across the monolith:

```bash
npm run setup
```

This will install dependencies for:

- Root monolith server
- Strapi backend
- Next.js frontend

## 🏃 Running in Development

### Option 1: All Services Together (Recommended)

```bash
npm run dev
```

This starts:

- **Strapi** on port `1337`
- **Next.js** on port `3001`
- **Unified Server** on port `3000` (proxying both services)

Access the application at:

- 🏪 **Store**: http://localhost:3000
- ⚙️ **Strapi Admin**: http://localhost:3000/admin
- 🔌 **API**: http://localhost:3000/api
- 💚 **Health Check**: http://localhost:3000/health

### Option 2: Individual Services

```bash
# Terminal 1: Strapi
npm run dev:backend

# Terminal 2: Next.js
npm run dev:frontend

# Terminal 3: Unified Server
npm start
```

## 🎨 Initial Strapi Setup

1. **Create Admin Account**
   - Navigate to http://localhost:3000/admin
   - Create your first admin user

2. **Configure Permissions**
   - Go to **Settings** → **Users & Permissions Plugin** → **Roles** → **Public**
   - Enable the following permissions:
     - **Product**: `find`, `findOne`
     - **Category**: `find`, `findOne`
     - **Upload**: `upload` (for media)

3. **Add Content**
   - Navigate to **Content Manager**
   - Create Categories (e.g., Electronics, Clothing, Home & Garden)
   - Create Products with images, pricing, and descriptions
   - Set some products as **Featured**

## 📦 Adding Products & Categories

### Via Strapi Admin UI

1. **Categories**:
   - Go to Content Manager → Categories → Create New
   - Fill in: Name, Description, Upload Image
   - Publish

2. **Products**:
   - Go to Content Manager → Products → Create New
   - Fill in all fields:
     - Name, Description, Price, SKU
     - Select Category
     - Upload Images (multiple supported)
     - Set Stock quantity
     - Toggle "Featured" if desired
   - Publish

### Via API (Programmatic)

You can also seed data using the Strapi API. Example:

```javascript
// POST to http://localhost:3000/api/products
{
  "data": {
    "name": "Wireless Headphones",
    "slug": "wireless-headphones",
    "description": "Premium noise-cancelling headphones",
    "price": 199.99,
    "sku": "WH-001",
    "stock": 50,
    "featured": true,
    "publishedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## 🚢 Production Deployment

### Option 1: Docker Compose (Recommended)

1. **Build and Run**:

```bash
docker-compose up -d
```

2. **Check Status**:

```bash
docker-compose ps
docker-compose logs -f app
```

3. **Access Application**:
   - App: http://your-domain.com
   - Admin: http://your-domain.com/admin

### Option 2: Dokploy Deployment

1. **Push to Git Repository**:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

2. **In Dokploy**:
   - Create a new application
   - Connect your Git repository
   - Set build command: `docker-compose up -d`
   - Add all environment variables from `.env`
   - Deploy

### Option 3: Manual Build

```bash
# Build
npm run build

# Start production server
NODE_ENV=production npm start
```

## 🛒 Stripe Integration

### Setup Stripe

1. **Get API Keys**:
   - Sign up at https://stripe.com
   - Get your test keys from Dashboard → Developers → API keys

2. **Configure Webhooks** (for production):
   - Go to Developers → Webhooks
   - Add endpoint: `https://your-domain.com/api/stripe/webhook`
   - Select events: `checkout.session.completed`
   - Copy the webhook secret to `STRIPE_WEBHOOK_SECRET`

3. **Test Checkout**:
   - Use test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC

## 📁 Project Structure

```
ecommerce-monolith/
├── backend/                 # Strapi CMS
│   ├── src/
│   │   ├── api/
│   │   │   ├── product/    # Product content type
│   │   │   ├── category/   # Category content type
│   │   │   └── order/      # Order content type
│   │   └── index.ts
│   ├── config/
│   ├── public/uploads/     # Media uploads
│   └── package.json
│
├── frontend/                # Next.js App
│   ├── src/
│   │   ├── app/            # App Router pages
│   │   │   ├── page.tsx    # Home page
│   │   │   └── layout.tsx  # Root layout
│   │   ├── components/     # React components
│   │   │   ├── ui/         # shadcn/ui components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   └── CartDrawer.tsx
│   │   ├── lib/
│   │   │   ├── api.ts      # API client
│   │   │   ├── utils.ts    # Utilities
│   │   │   └── providers.tsx
│   │   └── store/
│   │       └── cart.ts     # Zustand cart store
│   └── package.json
│
├── shared/                  # Shared TypeScript types
│   └── types/
│       └── index.ts
│
├── server.js               # Unified server (proxy)
├── docker-compose.yml      # Docker Compose config
├── Dockerfile              # Multi-stage Docker build
├── .env.example            # Environment variables template
├── package.json            # Root package.json
└── README.md              # This file
```

## 🔧 Available Scripts

### Root Level

- `npm run dev` - Start all services in development mode
- `npm run build` - Build all services for production
- `npm start` - Start the unified production server
- `npm run setup` - Install all dependencies

### Backend (Strapi)

- `npm run dev:backend` - Start Strapi in development
- `npm run build:backend` - Build Strapi
- `npm run strapi` - Run Strapi CLI commands

### Frontend (Next.js)

- `npm run dev:frontend` - Start Next.js in development
- `npm run build:frontend` - Build Next.js for production

## 🎨 Customization

### Branding

1. **Update Colors** - Edit `frontend/src/app/globals.css`
2. **Change Logo** - Modify `frontend/src/components/Header.tsx`
3. **Site Name** - Update in `Header.tsx`, `Footer.tsx`, and `layout.tsx`

### Add New Product Fields

1. Edit `backend/src/api/product/content-types/product/schema.json`
2. Update `shared/types/index.ts`
3. Rebuild Strapi: `npm run build:backend`

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -ti:3000
# Kill it
kill -9 <PID>
```

### Database Connection Failed

- Check PostgreSQL is running
- Verify credentials in `.env`
- Ensure database exists: `createdb ecommerce_db`

### Strapi Admin Not Accessible

- Clear browser cache
- Check `backend/build` folder exists
- Rebuild: `npm run build:backend`

### Images Not Loading

- Check Strapi upload permissions (Settings → Media Library)
- Verify `backend/public/uploads` folder exists and is writable
- Check CORS configuration in `backend/config/middlewares.ts`

## 📊 Performance Optimization

- **Enable Next.js ISR** - Incremental Static Regeneration for product pages
- **Configure CDN** - Serve static assets and images via CDN
- **Database Indexing** - Add indexes to frequently queried fields
- **Caching** - Implement Redis for API response caching

## 🔒 Security Checklist

- [ ] Change all default secrets and passwords
- [ ] Enable HTTPS in production
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable Stripe webhook signature verification
- [ ] Use environment variables for all secrets
- [ ] Regular dependency updates: `npm audit`

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## 📧 Support

For questions or issues, please open a GitHub issue or contact [your-email@example.com]

---

Built with ❤️ using Strapi and Next.js
