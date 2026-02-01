# KellerSharer 🏠

A modern marketplace for renting and finding storage spaces (basements, garages, attics, etc.) in Germany.

## Features

- **User Types**: Renters (space owners) and Searchers (people looking for space)
- **Space Listings**: Post and browse available storage spaces
- **Search Profiles**: Create profiles for what you're looking for
- **Stripe Integration**: Secure payments with Stripe Checkout
- **Contract Generation**: Automated bilingual (DE/EN) rental contracts
- **Admin Panel**: Approve spaces, manage users, view analytics

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Auth & Database**: Supabase
- **Payments**: Stripe
- **UI**: @stratos/ui shared components
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (monorepo package manager)
- Supabase account
- Stripe account

### 1. Install Dependencies

```bash
# From the monorepo root
pnpm install
```

### 2. Set Up Environment Variables

```bash
# Copy the example env file
cp .env.example .env.local
```

Fill in your credentials:

```env
# Supabase (from project settings > API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe (from dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3004
```

### 3. Set Up Database

Run the SQL schema in your Supabase SQL Editor:

```bash
# The schema file is at:
supabase/schema.sql
```

This creates:

- `keller_profiles` - User profiles with type (renter/searcher)
- `spaces` - Available spaces for rent
- `space_searches` - Search profiles
- `rentals` - Active rental agreements
- `contracts` - Signed contracts
- `payments` - Payment history

### 4. Configure Stripe

1. Create products in Stripe for rentals (or use dynamic pricing)
2. Set up webhook endpoint: `https://your-domain.com/api/webhooks/stripe`
3. Subscribe to events: `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`

### 5. Run Development Server

```bash
# From kellersharer directory
pnpm dev

# Or from monorepo root
pnpm --filter kellersharer dev
```

Open [http://localhost:3004](http://localhost:3004)

## Project Structure

```
src/
├── app/
│   ├── admin/         # Admin dashboard
│   ├── app/           # Main app (dashboard, browse, contracts)
│   ├── login/         # Login page
│   ├── signup/        # Signup with user type selection
│   └── onboarding/    # Complete profile setup
├── actions/           # Server actions
│   ├── index.ts       # CRUD operations
│   ├── stripe.ts      # Payment actions
│   └── contracts.ts   # Contract generation
├── components/
│   ├── dashboard/     # Sidebar, Header, StatCard
│   └── spaces/        # SpaceCard, SearchCard
├── lib/
│   └── supabase/      # Supabase client utilities
└── types/             # TypeScript definitions
```

## User Flows

### For Renters (Space Owners)

1. Sign up → Select "I have space to rent"
2. Complete profile with company info
3. Add spaces with details (size, price/m², amenities)
4. Wait for admin approval
5. Manage rentals and view contracts

### For Searchers

1. Sign up → Select "I'm looking for space"
2. Complete profile
3. Browse available spaces
4. Rent a space → Stripe Checkout
5. Sign contract → Start rental

### For Admins

1. Log in with admin account
2. Review pending spaces
3. Approve or reject with feedback
4. View platform analytics

## API Routes (TODO)

- `POST /api/webhooks/stripe` - Handle Stripe webhooks
- `GET /api/contracts/[id]/pdf` - Download contract as PDF

## Environment Variables Reference

| Variable                             | Required | Description                           |
| ------------------------------------ | -------- | ------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`           | Yes      | Supabase project URL                  |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`      | Yes      | Supabase anonymous key                |
| `SUPABASE_SERVICE_ROLE_KEY`          | Yes      | Supabase service role key             |
| `STRIPE_SECRET_KEY`                  | Yes      | Stripe secret key                     |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes      | Stripe publishable key                |
| `STRIPE_WEBHOOK_SECRET`              | Yes      | Stripe webhook signing secret         |
| `NEXT_PUBLIC_APP_URL`                | Yes      | App URL (e.g., http://localhost:3004) |

## Deployment

### Vercel (Recommended)

1. Connect your repo to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy!

### Docker

```dockerfile
# Dockerfile coming soon
```

## Contributing

1. Create a feature branch
2. Make changes
3. Submit PR

## License

Private - All rights reserved
