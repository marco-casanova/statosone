# E) Stripe Integration Plan

## Overview

DreamNest uses Stripe for subscription billing with:

- Two subscription tiers (monthly/yearly)
- 7-day free trial on all plans
- Webhook-based status synchronization
- Server-side subscription verification for content gating

---

## Products & Prices

### Stripe Dashboard Configuration

**Product: DreamNest Library Subscription**

| Price ID (example)  | Nickname | Interval | Amount | Trial  |
| ------------------- | -------- | -------- | ------ | ------ |
| `price_monthly_xxx` | Monthly  | month    | $9.99  | 7 days |
| `price_yearly_xxx`  | Yearly   | year     | $79.99 | 7 days |

### Environment Variables

```env
# .env.local
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Price IDs
NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID=price_xxx
NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID=price_xxx
```

---

## Checkout Flow

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                       CHECKOUT FLOW                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. User clicks "Start Free Trial"                              │
│     └── /pricing or /signup page                                │
│                                                                  │
│  2. Check auth status                                            │
│     ├── Not logged in → Redirect to /signup?redirect=/pricing   │
│     └── Logged in → Continue                                    │
│                                                                  │
│  3. POST /api/checkout                                           │
│     ├── Input: { priceId, userId }                              │
│     ├── Create or retrieve Stripe Customer                      │
│     ├── Create Checkout Session                                  │
│     └── Return: { sessionId, url }                              │
│                                                                  │
│  4. Redirect to Stripe Checkout                                  │
│     └── stripe.redirectToCheckout({ sessionId })                │
│                                                                  │
│  5. User completes payment                                       │
│     └── Stripe handles card, trial setup                        │
│                                                                  │
│  6. Stripe redirects to success URL                              │
│     └── /app?checkout=success                                   │
│                                                                  │
│  7. Webhook fires (async)                                        │
│     ├── customer.subscription.created                           │
│     └── Updates subscriptions table                             │
│                                                                  │
│  8. User lands on /app with active subscription                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### API Route: Create Checkout Session

```typescript
// POST /api/checkout
interface CheckoutRequest {
  priceId: string;
}

interface CheckoutResponse {
  sessionId: string;
  url: string;
}
```

**Logic:**

1. Authenticate user (must be logged in)
2. Get or create Stripe customer
3. Store `stripe_customer_id` in subscriptions table
4. Create Checkout Session with:
   - `customer`: Stripe customer ID
   - `line_items`: [{ price: priceId, quantity: 1 }]
   - `mode`: 'subscription'
   - `subscription_data.trial_period_days`: 7
   - `success_url`: `{BASE_URL}/app?checkout=success`
   - `cancel_url`: `{BASE_URL}/pricing?checkout=canceled`
   - `metadata`: { userId }
5. Return session URL for redirect

---

## Billing Portal

For managing subscriptions (cancel, update payment, change plan):

### API Route: Create Portal Session

```typescript
// POST /api/billing/portal
interface PortalRequest {
  // No body needed, uses authenticated user
}

interface PortalResponse {
  url: string;
}
```

**Logic:**

1. Authenticate user
2. Get user's `stripe_customer_id`
3. Create Billing Portal Session:
   - `customer`: stripe_customer_id
   - `return_url`: `{BASE_URL}/app/subscription`
4. Return portal URL

---

## Webhook Events

### Webhook Endpoint

```
POST /api/webhooks/stripe
```

### Events to Handle

| Event                                  | Action                             |
| -------------------------------------- | ---------------------------------- |
| `customer.subscription.created`        | Insert/update subscription record  |
| `customer.subscription.updated`        | Update subscription status & dates |
| `customer.subscription.deleted`        | Mark subscription as canceled      |
| `customer.subscription.trial_will_end` | (Optional) Send reminder email     |
| `invoice.payment_succeeded`            | (Optional) Log payment             |
| `invoice.payment_failed`               | Update status to past_due          |

### Event Handler Logic

```typescript
// Webhook handler pseudocode
async function handleWebhook(event: Stripe.Event) {
  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;

      await supabase.from("subscriptions").upsert(
        {
          user_id: subscription.metadata.userId,
          stripe_customer_id: subscription.customer,
          stripe_subscription_id: subscription.id,
          stripe_price_id: subscription.items.data[0].price.id,
          status: mapStripeStatus(subscription.status),
          current_period_start: new Date(
            subscription.current_period_start * 1000
          ),
          current_period_end: new Date(subscription.current_period_end * 1000),
          cancel_at_period_end: subscription.cancel_at_period_end,
          canceled_at: subscription.canceled_at
            ? new Date(subscription.canceled_at * 1000)
            : null,
          trial_start: subscription.trial_start
            ? new Date(subscription.trial_start * 1000)
            : null,
          trial_end: subscription.trial_end
            ? new Date(subscription.trial_end * 1000)
            : null,
        },
        {
          onConflict: "stripe_subscription_id",
        }
      );
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;

      await supabase
        .from("subscriptions")
        .update({
          status: "canceled",
          canceled_at: new Date(),
        })
        .eq("stripe_subscription_id", subscription.id);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;

      if (invoice.subscription) {
        await supabase
          .from("subscriptions")
          .update({ status: "past_due" })
          .eq("stripe_subscription_id", invoice.subscription);
      }
      break;
    }
  }
}

function mapStripeStatus(status: string): subscription_status {
  const statusMap: Record<string, subscription_status> = {
    active: "active",
    trialing: "trialing",
    past_due: "past_due",
    canceled: "canceled",
    unpaid: "unpaid",
    incomplete: "incomplete",
    incomplete_expired: "incomplete_expired",
    paused: "paused",
  };
  return statusMap[status] || "incomplete";
}
```

---

## Content Gating

### Subscription Status Check

```typescript
// lib/subscription.ts
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const supabase = createServerClient();

  const { data } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_id", userId)
    .single();

  return data?.status === "active" || data?.status === "trialing";
}

export async function getSubscription(userId: string) {
  const supabase = createServerClient();

  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .single();

  return data;
}
```

### Middleware Gating (Route Protection)

```typescript
// middleware.ts
import { hasActiveSubscription } from "@/lib/subscription";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Routes that require subscription
  const subscriptionRoutes = [
    "/app/books/*/read", // Reader
  ];

  const isSubscriptionRoute = subscriptionRoutes.some((route) =>
    new RegExp(route.replace("*", "[^/]+")).test(pathname)
  );

  if (isSubscriptionRoute) {
    const session = await getSession();

    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const hasSubscription = await hasActiveSubscription(session.user.id);

    if (!hasSubscription) {
      return NextResponse.redirect(new URL("/pricing", request.url));
    }
  }

  return NextResponse.next();
}
```

### Component-Level Gating

```tsx
// components/SubscriptionGate.tsx
"use client";

import { useSubscription } from "@/hooks/useSubscription";

interface SubscriptionGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function SubscriptionGate({
  children,
  fallback,
}: SubscriptionGateProps) {
  const { isSubscribed, isLoading } = useSubscription();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isSubscribed) {
    return fallback ?? <UpgradePrompt />;
  }

  return <>{children}</>;
}
```

---

## Pricing Page Integration

### Price Display Component

```tsx
// components/PricingCard.tsx
interface PricingCardProps {
  name: string;
  price: number;
  interval: "month" | "year";
  priceId: string;
  features: string[];
  popular?: boolean;
}

export function PricingCard({
  name,
  price,
  interval,
  priceId,
  features,
  popular,
}: PricingCardProps) {
  const handleSubscribe = async () => {
    const res = await fetch("/api/checkout", {
      method: "POST",
      body: JSON.stringify({ priceId }),
    });
    const { url } = await res.json();
    window.location.href = url;
  };

  return (
    <div className={cn("pricing-card", popular && "popular")}>
      {popular && <Badge>Most Popular</Badge>}
      <h3>{name}</h3>
      <div className="price">
        <span className="amount">${price}</span>
        <span className="interval">/{interval}</span>
      </div>
      <ul className="features">
        {features.map((f) => (
          <li key={f}>✓ {f}</li>
        ))}
      </ul>
      <Button onClick={handleSubscribe}>Start 7-Day Free Trial</Button>
      <p className="terms">
        Cancel anytime. No credit card required for trial.
      </p>
    </div>
  );
}
```

---

## Trial Handling

### Trial Status Display

```tsx
// components/TrialBanner.tsx
export function TrialBanner() {
  const { subscription } = useSubscription();

  if (subscription?.status !== "trialing") return null;

  const daysLeft = Math.ceil(
    (new Date(subscription.trial_end).getTime() - Date.now()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <div className="trial-banner">
      <p>
        🎉 You're on a free trial! <strong>{daysLeft} days</strong> remaining.
      </p>
      <Button variant="outline" asChild>
        <Link href="/app/subscription">View Plan</Link>
      </Button>
    </div>
  );
}
```

---

## Subscription Management UI

### Subscription Page (/app/subscription)

```tsx
// Features:
// - Current plan display
// - Billing cycle dates
// - Trial status
// - Cancel/Resume buttons
// - Change plan option
// - Payment method (link to portal)
// - Billing history (link to portal)

export default function SubscriptionPage() {
  const { subscription, isLoading } = useSubscription();

  const handleManageBilling = async () => {
    const res = await fetch("/api/billing/portal", { method: "POST" });
    const { url } = await res.json();
    window.location.href = url;
  };

  return (
    <div>
      <h1>Subscription</h1>

      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Plan: {getPlanName(subscription?.stripe_price_id)}</p>
          <p>Status: {subscription?.status}</p>
          <p>
            {subscription?.status === "trialing"
              ? `Trial ends: ${formatDate(subscription.trial_end)}`
              : `Renews: ${formatDate(subscription.current_period_end)}`}
          </p>

          {subscription?.cancel_at_period_end && (
            <Alert variant="warning">
              Your subscription will cancel on{" "}
              {formatDate(subscription.current_period_end)}
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleManageBilling}>Manage Billing</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
```

---

## Security Considerations

1. **Webhook Signature Verification**: Always verify webhook signatures
2. **Idempotency**: Handle duplicate webhook events gracefully
3. **Server-side Verification**: Never trust client-side subscription status
4. **Secure Price IDs**: Validate price IDs against allowed list
5. **Customer Portal**: Use Stripe's hosted portal for PCI compliance

---

## Testing Checklist

- [ ] Create checkout session (monthly)
- [ ] Create checkout session (yearly)
- [ ] Complete checkout with test card
- [ ] Webhook creates subscription record
- [ ] Trial period displays correctly
- [ ] Content unlocks after subscription
- [ ] Billing portal accessible
- [ ] Cancel subscription updates status
- [ ] Reactivate subscription
- [ ] Handle payment failure
- [ ] Handle trial expiration
