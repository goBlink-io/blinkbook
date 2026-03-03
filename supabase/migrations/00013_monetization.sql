-- Content monetization: paid/premium content with crypto payments

-- Paid content configurations per space/page
create table public.bb_paid_content (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.bb_spaces(id) on delete cascade,
  page_id uuid references public.bb_pages(id) on delete cascade,
  price_usd numeric(10,2) not null,
  accepted_tokens jsonb not null default '[]',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.bb_paid_content enable row level security;

-- Purchase records
create table public.bb_purchases (
  id uuid primary key default gen_random_uuid(),
  paid_content_id uuid not null references public.bb_paid_content(id) on delete cascade,
  buyer_wallet text not null,
  buyer_chain text not null,
  tx_hash text not null,
  amount_usd numeric(10,2) not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

alter table public.bb_purchases enable row level security;

-- Add premium flag to pages
alter table public.bb_pages add column is_premium boolean not null default false;

-- Add monetization fields to spaces
alter table public.bb_spaces add column monetization_enabled boolean not null default false;
alter table public.bb_spaces add column payout_wallet text;

-- RLS: space owner manages paid content
create policy "Space owners can manage paid content" on public.bb_paid_content
  for all using (
    space_id in (select id from bb_spaces where user_id = auth.uid())
  );

-- RLS: purchases visible to space owner or buyer (buyer matched by wallet)
create policy "Space owners can view purchases" on public.bb_purchases
  for select using (
    paid_content_id in (
      select pc.id from bb_paid_content pc
      join bb_spaces s on s.id = pc.space_id
      where s.user_id = auth.uid()
    )
  );

-- Allow anyone to insert a purchase (public-facing payment)
create policy "Anyone can insert purchases" on public.bb_purchases
  for insert with check (true);

-- Indexes for common queries
create index idx_bb_paid_content_space on public.bb_paid_content(space_id);
create index idx_bb_paid_content_page on public.bb_paid_content(page_id);
create index idx_bb_purchases_content on public.bb_purchases(paid_content_id);
