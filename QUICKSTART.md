# 🚀 Quick Start Guide

Get your ecommerce store running in 5 minutes!

## 📦 Prerequisites Check

Before starting, ensure you have:

- ✅ Node.js 18+ installed (`node --version`)
- ✅ PostgreSQL running (or use Docker)
- ✅ Stripe account (free test account)

## ⚡ Quick Setup

### 1. Install Dependencies

```bash
npm run setup
```

This installs all dependencies for the monolith, backend, and frontend.

### 2. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env
```

**Minimum required configuration in `.env`:**

```env
# Database
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=strapi123
DATABASE_NAME=ecommerce_db

# Generate these with: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
STRAPI_ADMIN_JWT_SECRET=<generate_random_string>
STRAPI_API_TOKEN_SALT=<generate_random_string>
STRAPI_JWT_SECRET=<generate_random_string>
STRAPI_TRANSFER_TOKEN_SALT=<generate_random_string>
STRAPI_APP_KEYS=<key1>,<key2>,<key3>,<key4>

# Stripe (get from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=sk_test_your_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

### 3. Setup Database

**Option A: Using Docker (Easiest)**

```bash
docker run -d \
  --name ecommerce-postgres \
  -e POSTGRES_USER=strapi \
  -e POSTGRES_PASSWORD=strapi123 \
  -e POSTGRES_DB=ecommerce_db \
  -p 5432:5432 \
  postgres:15-alpine
```

**Option B: Local PostgreSQL**

```bash
# Create database
createdb ecommerce_db

# Or using psql
psql -U postgres -c "CREATE DATABASE ecommerce_db;"
```

### 4. Start Development

```bash
npm run dev
```

This starts all services. Wait for:

```
✨ Make sure Strapi (port 1337) and Next.js (port 3001) are running
```

### 5. Access the Application

Open your browser:

- 🏪 **Store**: http://localhost:3000
- ⚙️ **Strapi Admin**: http://localhost:3000/admin
- 🔌 **API**: http://localhost:3000/api

## 🎨 Initial Setup in Strapi

### Create Admin Account

1. Go to http://localhost:3000/admin
2. Fill in the registration form
3. Click "Let's start"

### Configure Public Permissions

1. **Settings** (left sidebar) → **Users & Permissions Plugin** → **Roles**
2. Click on **Public**
3. Enable these permissions:
   - **Product**: `find`, `findOne`
   - **Category**: `find`, `findOne`
   - **Upload**: `upload`
4. Click **Save**

### Add Your First Products

1. Click **Content Manager** (left sidebar)
2. Create a **Category**:
   - Click **Category** → **Create new entry**
   - Name: "Electronics"
   - Description: "Electronic devices and gadgets"
   - Click **Save** and **Publish**

3. Create a **Product**:
   - Click **Product** → **Create new entry**
   - Name: "Wireless Headphones"
   - SKU: "WH-001"
   - Price: 199.99
   - Stock: 50
   - Description: Add a description
   - Select Category: Electronics
   - Toggle **Featured** to ON
   - Upload an image (drag & drop)
   - Click **Save** and **Publish**

4. Repeat to add 3-5 more products

### View Your Store

Go to http://localhost:3000 - you should see your products on the homepage!

## 🛒 Test Checkout

1. Add products to cart using the "Add to Cart" button
2. Click the cart icon in the header
3. Click "Proceed to Checkout"
4. Fill in the checkout form
5. Use Stripe test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits

## 🐛 Troubleshooting

### "Cannot connect to database"

- Check PostgreSQL is running: `psql -U postgres -l`
- Verify credentials in `.env` match your database

### "Port 3000 already in use"

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### "Module not found"

```bash
# Reinstall dependencies
rm -rf node_modules backend/node_modules frontend/node_modules
npm run setup
```

### "Strapi Admin won't load"

```bash
# Rebuild Strapi
cd backend
npm run build
cd ..
npm run dev
```

## 📚 Next Steps

- ✅ Add more products and categories
- ✅ Customize colors in `frontend/src/app/globals.css`
- ✅ Update branding in Header and Footer
- ✅ Configure Stripe webhooks for production
- ✅ Set up email notifications
- ✅ Deploy to production (see README.md)

## 🎓 Learn More

- [Strapi Documentation](https://docs.strapi.io)
- [Next.js Documentation](https://nextjs.org/docs)
- [Stripe Documentation](https://stripe.com/docs)

## 💡 Tips

- **Test Data**: Add 8+ featured products for a nice homepage
- **Images**: Use high-quality square images (800x800px+)
- **SEO**: Fill in product descriptions for better search visibility
- **Performance**: Featured products are cached for better performance

---

Need help? Check the full [README.md](./README.md) or open an issue!
