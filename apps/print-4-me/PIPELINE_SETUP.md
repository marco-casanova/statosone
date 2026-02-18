# STL → Slice → Quote → Pay → G-code Pipeline

Complete setup guide for the 3D Print ordering pipeline.

## Architecture Overview

```
User uploads STL → Order (NEW)
     ↓
Slicer estimates grams/time → Order (QUOTED) + price breakdown
     ↓
Stripe Checkout → Webhook → Order (PAID)
     ↓
Slicer service generates G-code → Order (READY_TO_PRINT)
     ↓
Admin prints + updates status → PRINTING → PRINT_DONE → DELIVERED
```

## Order Status Lifecycle

```
NEW → QUOTED → PAID → SLICING → READY_TO_PRINT → PRINTING
  → PRINT_DONE → WAITING_DELIVERY → OUT_FOR_DELIVERY → DELIVERED

Any status → FAILED
PAID → REFUNDED (admin only)
```

---

## 1. Environment Variables

Add these to your `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_BASE_URL=http://localhost:3002

# Slicer Service (Docker)
SLICER_SERVICE_URL=http://localhost:8080

# Internal API auth (for webhook → slice calls)
INTERNAL_API_SECRET=your-random-secret-here
```

## 2. Database Setup

Run the migration to create pipeline tables:

```bash
# Via Supabase CLI
supabase db push

# Or manually in Supabase SQL Editor:
# Copy contents of supabase/migrations/003_stl_pipeline_schema.sql
```

### Tables Created

- `printer_profiles` — printer configurations (name, cost/hour, avg kW)
- `material_profiles` — filament types (PLA, PETG, ABS, TPU with pricing)
- `pipeline_orders` — full order lifecycle with slicer data
- `order_events` — audit log for every status transition

### Storage Buckets

Create these buckets in Supabase Storage (Dashboard → Storage → New bucket):- **stl-files** — Private bucket for uploaded STL files

- **gcode-files** — Private bucket for generated G-code files

## 3. Slicer Service Setup

The slicer runs PrusaSlicer CLI inside Docker. **Do NOT run slicing on Vercel serverless.**

### Option A: Docker Compose (local / VPS)

```bash
cd apps/print-4-me

# Build and start the slicer service
docker compose -f docker-compose.slicer.yml up -d

# Check health
curl http://localhost:8080/health
```

### Option B: Google Cloud Run

```bash
# Build and push image
gcloud builds submit --tag gcr.io/YOUR_PROJECT/slicer-service ./slicer-service

# Deploy
gcloud run deploy slicer-service \
  --image gcr.io/YOUR_PROJECT/slicer-service \
  --memory 2Gi --cpu 2 \
  --timeout 600 \
  --max-instances 5
```

### Option C: AWS ECS / Fargate

```bash
# Build image
docker build -t slicer-service ./slicer-service

# Push to ECR and create ECS task definition with:
#   CPU: 2048, Memory: 4096
#   Container port: 8080
```

### Adding Printer/Filament Profiles

Export `.ini` profiles from PrusaSlicer:

1. Open PrusaSlicer → Printer Settings → Export Config
2. Place in `slicer-service/profiles/`
3. Update `printer_profiles.prusa_ini_storage_key` in the database

## 4. Pricing Model

All prices are computed from slicer output using these constants:

| Constant                    | Default  | Source          |
| --------------------------- | -------- | --------------- |
| `FILAMENT_EUR_PER_KG`       | €9.83    | 6kg / €59       |
| `FILAMENT_EUR_PER_G`        | €0.00983 | —               |
| `ENERGY_EUR_PER_KWH`        | €0.35    | Germany avg     |
| `PRINTER_AVG_KW`            | 0.12 kW  | Ender-class PLA |
| `MACHINE_EUR_PER_HOUR`      | €4.00    | Configurable    |
| `OVERHEAD_FIXED_EUR`        | €1.50    | Per order       |
| `RISK_MULTIPLIER`           | 10%      | —               |
| `PROFIT_MULTIPLIER`         | 20%      | —               |
| `MATERIAL_WASTE_MULTIPLIER` | 15%      | Supports/purge  |

### Formula

```
material_cost = grams × (1 + waste_multiplier) × eur_per_g
machine_cost  = hours × machine_eur_per_hour
energy_cost   = hours × printer_kw × energy_eur_per_kwh
subtotal      = material + machine + energy + overhead
risk_fee      = subtotal × 0.10
profit_fee    = subtotal × 0.20
total         = subtotal + risk_fee + profit_fee
```

Constants are overridable per printer profile and material profile. The exact constants used are stored in `pricing_constants_json` for each order (immutable quote).

## 5. API Endpoints

### User Endpoints

| Method | Path                                       | Description                         |
| ------ | ------------------------------------------ | ----------------------------------- |
| GET    | `/api/pipeline/profiles`                   | List available printers & materials |
| POST   | `/api/pipeline/orders/create`              | Create order + get STL upload URL   |
| GET    | `/api/pipeline/orders`                     | List user's pipeline orders         |
| POST   | `/api/pipeline/orders/[id]/quote`          | Generate quote from slicer estimate |
| POST   | `/api/pipeline/orders/[id]/checkout`       | Create Stripe Checkout session      |
| GET    | `/api/pipeline/orders/[id]/download-gcode` | Get signed G-code download URL      |

### Admin Endpoints

| Method | Path                              | Description                  |
| ------ | --------------------------------- | ---------------------------- |
| GET    | `/api/pipeline/admin/orders`      | List all orders (filterable) |
| GET    | `/api/pipeline/admin/orders/[id]` | Order detail + events        |
| PATCH  | `/api/pipeline/admin/orders/[id]` | Update order status          |

### Internal/Worker Endpoints

| Method | Path                              | Description                         |
| ------ | --------------------------------- | ----------------------------------- |
| POST   | `/api/pipeline/orders/[id]/slice` | Trigger slicing (called by webhook) |
| POST   | `/api/stripe/webhook`             | Stripe payment webhook              |

## 6. User Flow

### Pages

| Path                              | Description                                            |
| --------------------------------- | ------------------------------------------------------ |
| `/dashboard/pipeline/new`         | New order form: upload STL, select settings, get quote |
| `/dashboard/pipeline/orders`      | List all pipeline orders                               |
| `/dashboard/pipeline/orders/[id]` | Order detail with progress, quote breakdown, downloads |

### Admin Pages

| Path                          | Description                                              |
| ----------------------------- | -------------------------------------------------------- |
| `/admin/pipeline/orders`      | All orders table with filters                            |
| `/admin/pipeline/orders/[id]` | Order detail with status management, timeline, downloads |

## 7. Stripe Setup

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from Dashboard → Developers → API keys
3. Set up webhooks:
   - URL: `https://your-domain.com/api/stripe/webhook`
   - Events: `checkout.session.completed`, `payment_intent.payment_failed`, `charge.refunded`
4. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### Local Testing

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Forward webhooks to local server
stripe listen --forward-to localhost:3002/api/stripe/webhook

# Use the webhook signing secret printed by the CLI
```

## 8. Security Checklist

- [x] STL file validation (extension check, size limit)
- [x] Rate limiting on quote/slice endpoints (add via middleware)
- [x] Slicer container has CPU/memory limits
- [x] No user-provided G-code allowed
- [x] Signed URLs for all file downloads (15-min expiry)
- [x] Admin routes require ADMIN role
- [x] Webhook signature verification
- [x] Internal slice endpoint uses Bearer token auth
- [x] Quote is immutable once checkout session is created

## 9. Converting STL to G-code

The conversion happens automatically via the pipeline:

1. **User uploads STL** → stored in Supabase Storage `stl-files` bucket
2. **Quote endpoint** → calls slicer service `/estimate` to get grams/time
3. **After payment** → webhook calls `/api/pipeline/orders/[id]/slice`
4. **Slice endpoint** → downloads STL, calls slicer service `/slice`
5. **Slicer service** → runs `prusa-slicer --export-gcode` in Docker
6. **G-code uploaded** → stored in Supabase Storage `gcode-files` bucket
7. **Order updated** → status = `READY_TO_PRINT`, email notification sent

### Without Slicer Service (Development)

If `SLICER_SERVICE_URL` is not set:

- Quote endpoint uses a **heuristic estimate** based on file size
- G-code generation is skipped — admin must manually slice
- Orders go to PAID but not automatically to SLICING

## 10. Development

```bash
# Start Next.js dev server
npm run dev

# Start slicer service (separate terminal)
docker compose -f docker-compose.slicer.yml up

# Start Stripe webhook forwarding (separate terminal)
stripe listen --forward-to localhost:3002/api/stripe/webhook
```
