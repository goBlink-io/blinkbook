create table public.bb_analytics (
  id uuid primary key default gen_random_uuid(),
  space_id uuid references public.bb_spaces on delete cascade not null,
  page_id uuid references public.bb_pages on delete cascade,
  event text not null check (event in ('pageview', 'search', 'feedback')),
  metadata jsonb default '{}'::jsonb,
  visitor_id text,
  created_at timestamptz default now()
);

create index idx_bb_analytics_space on bb_analytics(space_id, created_at);
create index idx_bb_analytics_event on bb_analytics(event);

-- RLS: space owners can read their analytics
alter table bb_analytics enable row level security;
create policy "Space owners can view analytics" on bb_analytics
  for select using (
    space_id in (select id from bb_spaces where user_id = auth.uid())
  );
-- Public insert for tracking
create policy "Anyone can insert analytics" on bb_analytics
  for insert with check (true);
