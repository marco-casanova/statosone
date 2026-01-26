# Supabase Setup Guide for Stratos Apps

## Overview

Each Stratos app has its own Supabase project for data isolation, but shares the same auth schema structure.

## Quick Start

```bash
# Make the setup script executable
chmod +x scripts/setup-supabase.sh

# Run the setup wizard
./scripts/setup-supabase.sh
```

## Manual Setup

### 1. Create Supabase Projects

Create a project for each app at [supabase.com/dashboard](https://supabase.com/dashboard):

| App           | Project Name          | Local Port |
| ------------- | --------------------- | ---------- |
| KinRelay      | stratos-kinrelay      | 3000       |
| StratosTalent | stratos-stratostalent | 3001       |
| DreamNest     | stratos-dreamnest     | 3002       |
| KellerSharer  | stratos-kellersharer  | 3003       |
| StratosHome   | stratos-stratoshome   | 3004       |

> **Note:** StratosOne doesn't need Supabase (marketing only)

### 2. Run Schema Migrations

For each project, go to **SQL Editor** and run:

#### Step 1: Shared Auth Schema (required for all apps)

```sql
-- Run: packages/auth/supabase/schema.sql
```

This creates:

- `profiles` table with roles
- Auto-create profile trigger
- RLS policies
- Helper functions (`is_admin()`, `get_my_role()`)

#### Step 2: App-Specific Schema

| App           | Schema File                                     |
| ------------- | ----------------------------------------------- |
| KinRelay      | `packages/auth/supabase/apps/kinrelay.sql`      |
| StratosTalent | `packages/auth/supabase/apps/stratostalent.sql` |
| DreamNest     | `packages/auth/supabase/apps/dreamnest.sql`     |
| KellerSharer  | `packages/auth/supabase/apps/kellersharer.sql`  |
| StratosHome   | `packages/auth/supabase/apps/stratoshome.sql`   |

### 3. Configure Environment Variables

Copy `.env.example` to `.env.local` in each app:

```bash
cp apps/x_kin_relay/.env.example apps/x_kin_relay/.env.local
cp apps/stratostalent/.env.example apps/stratostalent/.env.local
# ... etc
```

Get credentials from **Project Settings → API**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **Never commit `.env.local` or expose `SUPABASE_SERVICE_ROLE_KEY`**

### 4. Create an Admin User

After a user signs up, make them admin via SQL:

```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'admin@example.com';
```

## Architecture

### Auth Flow

```
User → App → @stratos/auth → Supabase

1. User visits /login or /signup
2. Client-side form submits to Supabase Auth
3. Supabase creates user + triggers profile creation
4. Middleware refreshes session cookies
5. Layout guards check auth via server-side session
6. Protected routes render or redirect
```

### Middleware

Each app has middleware that refreshes the Supabase session:

```typescript
// apps/*/src/middleware.ts
import { createSessionMiddleware } from "@stratos/auth/middleware";

export const middleware = createSessionMiddleware();
```

### Server-Side Auth (Layouts)

Protected routes use layout guards:

```typescript
// app/app/layout.tsx
import { createServerClient } from "@stratos/auth";
import { redirect } from "next/navigation";

export default async function AppLayout({ children }) {
  const supabase = await createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect("/login");

  return <>{children}</>;
}
```

### Admin Routes

```typescript
// app/admin/layout.tsx
import { createServerClient } from "@stratos/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }) {
  const supabase = await createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect("/login");

  // Check admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (profile?.role !== "admin") redirect("/app");

  return <>{children}</>;
}
```

## Database Schema

### Shared Tables (all apps)

```
profiles
├── id (uuid, FK → auth.users)
├── email (text)
├── full_name (text)
├── avatar_url (text)
├── role (user_role: user|provider|company|admin)
├── user_type (text, app-specific)
├── created_at (timestamptz)
└── updated_at (timestamptz)
```

### App-Specific Tables

See individual SQL files in `packages/auth/supabase/apps/`

## Troubleshooting

### "Auth disabled" error

- Check that `.env.local` exists with valid credentials
- Verify Supabase project is running

### Session not persisting

- Ensure middleware is configured correctly
- Check browser cookies are enabled

### RLS blocking queries

- Verify policies are created
- Check user role in profiles table
- Use `is_admin()` for admin operations

### Profile not created on signup

- Check trigger exists: `on_auth_user_created`
- Verify `handle_new_user()` function

## Local Development with Supabase CLI

```bash
# Install CLI
brew install supabase/tap/supabase

# Start local Supabase
supabase start

# Use local credentials in .env.local
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<local-anon-key>
```
