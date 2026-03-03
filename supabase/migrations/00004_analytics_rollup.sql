-- Daily aggregated analytics table
create table public.bb_analytics_daily (
  id uuid primary key default gen_random_uuid(),
  space_id uuid references public.bb_spaces on delete cascade not null,
  page_id uuid references public.bb_pages on delete cascade,
  date date not null,
  event text not null check (event in ('pageview', 'search', 'feedback')),
  count integer default 0,
  unique_visitors integer default 0,
  metadata jsonb default '{}'::jsonb,
  unique(space_id, page_id, date, event)
);

create index idx_bb_analytics_daily_space on bb_analytics_daily(space_id, date);

-- RLS: space owners can read their aggregated analytics
alter table bb_analytics_daily enable row level security;
create policy "Space owners can view daily analytics" on bb_analytics_daily
  for select using (
    space_id in (select id from bb_spaces where user_id = auth.uid())
  );

-- Rollup function: aggregate yesterday's raw events into daily table,
-- then purge raw events older than 7 days.
-- Should be called daily via pg_cron or Vercel cron.
create or replace function rollup_analytics() returns void as $$
begin
  -- Aggregate pageviews
  insert into bb_analytics_daily (space_id, page_id, date, event, count, unique_visitors, metadata)
  select
    space_id,
    page_id,
    (created_at at time zone 'UTC')::date as date,
    event,
    count(*) as count,
    count(distinct visitor_id) as unique_visitors,
    case
      when event = 'search' then jsonb_build_object(
        'queries', jsonb_agg(distinct metadata->'query') filter (where metadata->>'query' is not null)
      )
      else '{}'::jsonb
    end as metadata
  from bb_analytics
  where (created_at at time zone 'UTC')::date = (now() at time zone 'UTC')::date - interval '1 day'
  group by space_id, page_id, (created_at at time zone 'UTC')::date, event
  on conflict (space_id, page_id, date, event) do update set
    count = excluded.count,
    unique_visitors = excluded.unique_visitors,
    metadata = excluded.metadata;

  -- Purge raw events older than 7 days
  delete from bb_analytics
  where created_at < now() - interval '7 days';
end;
$$ language plpgsql security definer;
