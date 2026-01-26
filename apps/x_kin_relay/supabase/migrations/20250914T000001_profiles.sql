-- Migration: create profiles table with RLS, policies, trigger for new auth users
-- Generated at 2025-09-14

begin;

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  address_line1 text,
  address_line2 text,
  city text,
  region text,
  postal_code text,
  country_code text,
  role text check (role in ('patient','carer')),
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- Policies (Postgres doesn't support IF NOT EXISTS for create policy yet) - drop then create
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- Trigger to auto create profile from auth metadata
create or replace function public.handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

commit;
