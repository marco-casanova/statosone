# Vercel Deployment Configuration

This app is configured for deployment on Vercel with the following settings:

## Configuration Files

- `vercel.json` - Vercel deployment configuration
- `.vercelignore` - Files to exclude from deployment
- `next.config.mjs` - Next.js config optimized for Vercel

## Deployment Steps

### 1. Via Vercel Dashboard (Recommended)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. **Root Directory**: `apps/x_kin_relay`
4. **Framework Preset**: Next.js (auto-detected)
5. **Build Command**: `pnpm run build` (auto-configured)
6. **Install Command**: `pnpm install --no-frozen-lockfile` (auto-configured)

### 2. Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Supabase Configuration

In your Supabase project → Settings → API:

1. **Site URL**: `https://your-app.vercel.app`
2. **Redirect URLs**: `https://your-app.vercel.app/**`

### 4. Via Vercel CLI

```bash
cd /Users/marcocasanova/stratosone/apps/x_kin_relay
vercel login
vercel --prod
```

## Build Command

The monorepo uses `pnpm` workspaces. Vercel will automatically:

1. Install dependencies with `pnpm install --no-frozen-lockfile`
2. Build with `pnpm run build`
3. Generate standalone output for optimal performance

## Troubleshooting

**Build fails:**

```bash
# Test build locally
pnpm run build
```

**Module not found:**

- Ensure workspace packages are listed in `transpilePackages` in next.config.mjs

**Environment variables not working:**

- Must prefix with `NEXT_PUBLIC_` for client-side access
- Redeploy after adding/changing env vars

## Production URL

After deployment: `https://x-kin-relay.vercel.app`
