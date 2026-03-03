-- Review Reminders: space-level settings, per-page tracking, and reminder log

-- 1. Space-level reminder settings
alter table public.bb_spaces
  add column if not exists review_reminder_enabled boolean not null default false,
  add column if not exists review_reminder_days integer not null default 90;

-- 2. Per-page review tracking columns
alter table public.bb_pages
  add column if not exists last_reviewed_at timestamptz,
  add column if not exists review_exempt boolean not null default false;

-- 3. Table to track when reminders were sent (prevents spam via cooldown)
create table if not exists public.bb_review_logs (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.bb_pages(id) on delete cascade,
  space_id uuid not null references public.bb_spaces(id) on delete cascade,
  sent_at timestamptz not null default now(),
  sent_to text not null
);

create index if not exists bb_review_logs_page_id_idx on public.bb_review_logs(page_id);
create index if not exists bb_review_logs_space_id_idx on public.bb_review_logs(space_id);
create index if not exists bb_review_logs_sent_at_idx on public.bb_review_logs(sent_at);

-- 4. RLS: space owners and team members can read review logs
alter table public.bb_review_logs enable row level security;

create policy "review_logs_owner" on public.bb_review_logs
  for select using (
    space_id in (
      select id from public.bb_spaces where user_id = auth.uid()
    )
  );

create policy "review_logs_team" on public.bb_review_logs
  for select using (
    exists (
      select 1 from public.bb_team_members
      where space_id = bb_review_logs.space_id
        and user_id = auth.uid()
    )
  );
