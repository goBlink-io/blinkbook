-- Broken link detection
create table public.bb_broken_links (
  id uuid primary key default gen_random_uuid(),
  space_id uuid references public.bb_spaces on delete cascade not null,
  page_id uuid references public.bb_pages on delete cascade not null,
  url text not null,
  link_text text,
  status_code int,
  error text,
  last_checked_at timestamptz default now(),
  is_broken boolean not null default true
);

create index idx_bb_broken_links_space on bb_broken_links(space_id);
create index idx_bb_broken_links_page on bb_broken_links(page_id);

-- Track when a space was last scanned
alter table public.bb_spaces add column last_link_check_at timestamptz;

-- RLS: space owners can manage their broken links
alter table bb_broken_links enable row level security;
create policy "Space owners can view broken links" on bb_broken_links
  for select using (
    space_id in (select id from bb_spaces where user_id = auth.uid())
  );
create policy "Space owners can insert broken links" on bb_broken_links
  for insert with check (
    space_id in (select id from bb_spaces where user_id = auth.uid())
  );
create policy "Space owners can delete broken links" on bb_broken_links
  for delete using (
    space_id in (select id from bb_spaces where user_id = auth.uid())
  );
