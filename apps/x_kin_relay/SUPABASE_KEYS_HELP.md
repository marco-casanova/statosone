# 🔑 How to Get Your Supabase Keys

## Problem

Your login is not working because the `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local` is not a valid JWT token.

## Solution

### 1. Go to Supabase Dashboard

Visit: https://supabase.com/dashboard/project/mzdggzpvqfuxywdssgkz/settings/api

### 2. Copy Your Keys

You'll see two keys:

#### **Project URL**

```
https://mzdggzpvqfuxywdssgkz.supabase.co
```

#### **anon public** (This is what you need!)

It looks like:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16ZGdnenB2cWZ1eHl3ZHNzZ2t6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDYxMjM0NTYsImV4cCI6MjAyMTY5OTQ1Nn0.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**NOT** like: `sb_publishable_...` (that's wrong!)

### 3. Update `.env.local`

Replace the entire file content with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://mzdggzpvqfuxywdssgkz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_ACTUAL_JWT_TOKEN_HERE
```

### 4. Restart Dev Server

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

### 5. Test Login

- Go to http://localhost:3000
- Try logging in with your credentials
- Should redirect to `/app` on success

## Verify Supabase is Working

Open browser console (F12) and you should NOT see:

```
Supabase disabled: missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## Still Not Working?

### Check Supabase Auth Settings

1. Go to: https://supabase.com/dashboard/project/mzdggzpvqfuxywdssgkz/auth/url-configuration

2. **Site URL**: Set to `http://localhost:3000`

3. **Redirect URLs**: Add:
   ```
   http://localhost:3000/**
   http://localhost:3000/en/app
   ```

### Check User Exists

1. Go to: https://supabase.com/dashboard/project/mzdggzpvqfuxywdssgkz/auth/users

2. Ensure you have a test user created

3. If not, create one:
   - Click "Add user" → "Create new user"
   - Enter email & password
   - Confirm user

### Check RLS Policies

If login works but data doesn't load:

1. Go to: https://supabase.com/dashboard/project/mzdggzpvqfuxywdssgkz/auth/policies

2. Run the migration: `20260103_add_missing_kr_tables.sql`
   - This sets all RLS policies to `USING (true)` for development

## Environment Variables Format

✅ **Correct anon key**:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im...
```

(Starts with `eyJ`, is ~200+ characters long, JWT format)

❌ **Wrong format**:

```
sb_publishable_Nxw7KVERFcBss2ZuSkiOdw_7JJpKSw0
```

(Starts with `sb_`, short, not a JWT)
