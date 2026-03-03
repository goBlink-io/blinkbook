-- Versions (snapshots of a space's pages at a point in time)
create table public.bb_versions (
  id uuid primary key default gen_random_uuid(),
  space_id uuid references public.bb_spaces on delete cascade not null,
  label text not null,
  is_current boolean default false,
  created_at timestamptz default now(),
  unique(space_id, label)
);

-- Version page snapshots (copy of pages at the time a version is created)
create table public.bb_version_pages (
  id uuid primary key default gen_random_uuid(),
  version_id uuid references public.bb_versions on delete cascade not null,
  page_id uuid,
  title text not null,
  slug text not null,
  content jsonb default '{"type":"doc","content":[]}'::jsonb,
  parent_id uuid,
  position integer default 0,
  created_at timestamptz default now()
);

-- RLS
alter table public.bb_versions enable row level security;
alter table public.bb_version_pages enable row level security;

-- Versions: space owner can manage
create policy "versions_owner" on public.bb_versions for all using (
  exists (select 1 from public.bb_spaces where id = space_id and user_id = auth.uid())
);
-- Versions: team members can read
create policy "versions_team" on public.bb_versions for select using (
  exists (select 1 from public.bb_team_members where space_id = bb_versions.space_id and user_id = auth.uid())
);
-- Versions: public read for published spaces
create policy "versions_public" on public.bb_versions for select using (
  exists (select 1 from public.bb_spaces where id = space_id and is_published = true)
);

-- Version pages: space owner can manage
create policy "version_pages_owner" on public.bb_version_pages for all using (
  exists (
    select 1 from public.bb_versions v
    join public.bb_spaces s on s.id = v.space_id
    where v.id = version_id and s.user_id = auth.uid()
  )
);
-- Version pages: team members can read
create policy "version_pages_team" on public.bb_version_pages for select using (
  exists (
    select 1 from public.bb_versions v
    join public.bb_team_members tm on tm.space_id = v.space_id
    where v.id = version_id and tm.user_id = auth.uid()
  )
);
-- Version pages: public read for published spaces
create policy "version_pages_public" on public.bb_version_pages for select using (
  exists (
    select 1 from public.bb_versions v
    join public.bb_spaces s on s.id = v.space_id
    where v.id = version_id and s.is_published = true
  )
);

-- Function: snapshot pages when creating a version
create or replace function public.snapshot_version_pages(p_version_id uuid, p_space_id uuid)
returns void language plpgsql security definer as $$
begin
  insert into public.bb_version_pages (version_id, page_id, title, slug, content, parent_id, position)
  select p_version_id, id, title, slug, content, parent_id, position
  from public.bb_pages
  where space_id = p_space_id and is_published = true;
end;
$$;
