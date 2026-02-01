# ForgeFlow — 3D Printing Made Easy

A full-stack 3D printing service platform where users can upload 3D models, preview them in the browser, get instant quotes, pay via Stripe, and have their prints shipped via DHL.

![ForgeFlow](https://via.placeholder.com/800x400?text=ForgeFlow+3D+Printing)

## 🚀 Features

### Customer Features

- **3D Model Upload**: Drag-and-drop STL/OBJ files up to 50MB
- **3D Preview**: Interactive WebGL viewer with orbit controls
- **Instant Quotes**: Real-time pricing based on material, quality, and quantity
- **Secure Payments**: Stripe Checkout integration
- **Order Tracking**: Real-time order status updates
- **Custom Design Requests**: Submit custom 3D modeling requests

### Admin Features

- **Order Management**: View, update, and process orders
- **Shipping Labels**: Generate DHL shipping labels
- **User Management**: Manage customer accounts and roles
- **Custom Request Review**: Quote and respond to custom requests
- **Analytics Dashboard**: Overview of orders, revenue, and activity

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **Payments**: Stripe Checkout
- **Shipping**: DHL API (with mock fallback)
- **3D Rendering**: Three.js + React Three Fiber
- **Styling**: Tailwind CSS
- **Package Manager**: pnpm

## 📁 Project Structure

```
apps/forgeflow/
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   ├── admin/         # Admin dashboard
│   │   ├── auth/          # Auth callbacks
│   │   ├── dashboard/     # Customer dashboard
│   │   ├── login/         # Login page
│   │   ├── signup/        # Signup page
│   │   ├── layout.tsx     # Root layout
│   │   ├── page.tsx       # Landing page
│   │   └── globals.css    # Global styles
│   ├── components/        # Reusable components
│   ├── lib/              # Utilities and helpers
│   │   ├── supabase/     # Supabase clients
│   │   └── pricing.ts    # Pricing calculator
│   └── types/            # TypeScript types
├── supabase/
│   └── migrations/       # Database migrations
├── public/               # Static assets
└── package.json
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Supabase account
- Stripe account (for payments)
- DHL account (optional, falls back to mock)

### 1. Clone and Install

```bash
# From monorepo root
pnpm install
```

### 2. Environment Setup

```bash
cd apps/forgeflow
cp .env.example .env.local
```

Fill in your environment variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# DHL (optional)
DHL_API_KEY=
DHL_ACCOUNT_NUMBER=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3002
```

### 3. Database Setup

Run the migration in your Supabase SQL editor:

```bash
# Copy contents from:
supabase/migrations/001_forgeflow_schema.sql
```

Or use Supabase CLI:

```bash
supabase db push
```

### 4. Run Development Server

```bash
# From monorepo root
pnpm --filter forgeflow dev

# Or from app directory
cd apps/forgeflow
pnpm dev
```

Open [http://localhost:3002](http://localhost:3002)

## 💳 Stripe Setup

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the Dashboard
3. Set up webhook endpoint:
   - URL: `https://your-domain.com/api/stripe/webhook`
   - Events: `checkout.session.completed`, `charge.refunded`
4. Copy webhook secret to `.env.local`

## 📦 DHL Integration

The app includes both real DHL API integration and a mock fallback:

- **With DHL Credentials**: Creates actual shipments and tracking numbers
- **Without Credentials**: Generates mock tracking numbers (prefixed with `FF`)

To enable real DHL:

1. Register at [DHL Developer Portal](https://developer.dhl.com)
2. Get API credentials
3. Add to `.env.local`

## 🎨 Pricing Configuration

Edit `src/lib/pricing.ts` to customize:

```typescript
const MATERIAL_BASE_PRICE: Record<Material, number> = {
  PLA: 1500, // €15.00 base
  PETG: 2000, // €20.00 base
  RESIN: 3500, // €35.00 base
};

const QUALITY_MULTIPLIER: Record<Quality, number> = {
  DRAFT: 1.0,
  STANDARD: 1.25,
  HIGH: 1.75,
};

const SHIPPING_COST = 499; // €4.99
```

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- Server-side authentication checks
- Secure file uploads with type validation
- Stripe webhook signature verification

## 📱 Pages

| Route                      | Description             |
| -------------------------- | ----------------------- |
| `/`                        | Landing page            |
| `/login`                   | User login              |
| `/signup`                  | User registration       |
| `/dashboard`               | Customer dashboard      |
| `/dashboard/models`        | Uploaded models list    |
| `/dashboard/models/[id]`   | Model detail + quote    |
| `/dashboard/orders`        | Orders list             |
| `/dashboard/orders/[id]`   | Order detail + tracking |
| `/dashboard/custom-design` | Custom request form     |
| `/dashboard/settings`      | Account settings        |
| `/admin`                   | Admin dashboard         |
| `/admin/orders`            | All orders management   |
| `/admin/orders/[id]`       | Order processing        |
| `/admin/custom-requests`   | Custom requests         |
| `/admin/users`             | User management         |

## 🧪 API Routes

| Endpoint               | Method          | Description             |
| ---------------------- | --------------- | ----------------------- |
| `/api/models`          | GET/POST/DELETE | Model CRUD              |
| `/api/quotes`          | GET/POST        | Quote management        |
| `/api/orders`          | GET/POST/DELETE | Order management        |
| `/api/stripe/checkout` | POST            | Create checkout session |
| `/api/stripe/webhook`  | POST            | Stripe webhook handler  |
| `/api/shipping`        | GET/POST        | DHL shipping labels     |

## 🚢 Deployment

### Vercel (Recommended)

```bash
vercel
```

Set environment variables in Vercel dashboard.

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN pnpm install
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

## 📄 License

MIT © ForgeFlow

---

Built with ❤️ using Next.js, Supabase, and Three.js
