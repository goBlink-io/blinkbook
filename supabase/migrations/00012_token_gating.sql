-- Token-gated documentation: access rules table + gating flags

create table if not exists public.bb_access_rules (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.bb_spaces(id) on delete cascade,
  page_id uuid references public.bb_pages(id) on delete cascade,
  chain text not null,
  contract_address text not null,
  token_type text not null,
  min_amount numeric not null default 1,
  token_id text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_bb_access_rules_space
  on public.bb_access_rules(space_id);

create index if not exists idx_bb_access_rules_page
  on public.bb_access_rules(page_id);

-- Gating flags on spaces and pages
alter table public.bb_spaces
  add column if not exists is_gated boolean not null default false;

alter table public.bb_pages
  add column if not exists is_gated boolean not null default false;

-- RLS
alter table public.bb_access_rules enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'bb_access_rules' and policyname = 'Owner can manage access rules'
  ) then
    create policy "Owner can manage access rules"
      on public.bb_access_rules
      for all
      using (
        space_id in (
          select id from public.bb_spaces where user_id = auth.uid()
        )
      )
      with check (
        space_id in (
          select id from public.bb_spaces where user_id = auth.uid()
        )
      );
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'bb_access_rules' and policyname = 'Public can read active access rules'
  ) then
    create policy "Public can read active access rules"
      on public.bb_access_rules
      for select
      using (is_active = true);
  end if;
end $$;
