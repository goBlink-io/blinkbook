-- Subscriptions
create table public.bb_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.bb_users on delete cascade not null unique,
  plan text not null default 'free' check (plan in ('free','pro','team')),
  status text not null default 'active' check (status in ('active','canceled','past_due','trialing')),
  -- Stripe
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_price_id text,
  -- goBlink crypto
  goblink_payment_id text,
  payment_method text check (payment_method in ('stripe','crypto')),
  -- Billing
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Drop existing bb_team_members (from init migration) and recreate with full schema
drop policy if exists "pages_team_read" on public.bb_pages;
drop policy if exists "pages_team_write" on public.bb_pages;
drop policy if exists "spaces_team" on public.bb_spaces;
drop table if exists public.bb_team_members;

create table public.bb_team_members (
  id uuid primary key default gen_random_uuid(),
  space_id uuid references public.bb_spaces on delete cascade not null,
  user_id uuid references public.bb_users on delete cascade,
  email text,
  role text not null default 'editor' check (role in ('admin','editor','viewer')),
  status text not null default 'pending' check (status in ('pending','accepted')),
  invite_token text unique,
  invited_at timestamptz default now(),
  accepted_at timestamptz,
  unique(space_id, user_id)
);

-- RLS
alter table bb_subscriptions enable row level security;
create policy "Users manage own subscription" on bb_subscriptions
  for all using (user_id = auth.uid());

alter table bb_team_members enable row level security;
create policy "Space admins manage team" on bb_team_members
  for all using (
    space_id in (
      select id from bb_spaces where user_id = auth.uid()
    )
  );
create policy "Team members can view" on bb_team_members
  for select using (user_id = auth.uid());
