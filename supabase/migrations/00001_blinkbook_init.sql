-- Users (extends Supabase auth.users)
create table public.bb_users (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  name text,
  avatar_url text,
  plan text not null default 'free',
  created_at timestamptz default now()
);

-- Spaces (doc sites)
create table public.bb_spaces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.bb_users on delete cascade not null,
  name text not null,
  slug text not null unique,
  description text,
  theme jsonb not null default '{"preset": "midnight"}'::jsonb,
  logo_url text,
  custom_domain text,
  is_published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Pages
create table public.bb_pages (
  id uuid primary key default gen_random_uuid(),
  space_id uuid references public.bb_spaces on delete cascade not null,
  title text not null default 'Untitled',
  slug text not null,
  content jsonb default '{"type":"doc","content":[]}'::jsonb,
  parent_id uuid references public.bb_pages(id) on delete set null,
  position integer default 0,
  is_published boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(space_id, slug)
);

-- Team members
create table public.bb_team_members (
  id uuid primary key default gen_random_uuid(),
  space_id uuid references public.bb_spaces on delete cascade not null,
  user_id uuid references public.bb_users on delete cascade not null,
  role text not null check (role in ('admin','editor','viewer')),
  created_at timestamptz default now(),
  unique(space_id, user_id)
);

-- Feedback
create table public.bb_feedback (
  id uuid primary key default gen_random_uuid(),
  space_id uuid references public.bb_spaces on delete cascade not null,
  page_id uuid references public.bb_pages on delete cascade not null,
  helpful boolean not null,
  comment text,
  created_at timestamptz default now()
);

-- RLS
alter table public.bb_users enable row level security;
alter table public.bb_spaces enable row level security;
alter table public.bb_pages enable row level security;
alter table public.bb_team_members enable row level security;
alter table public.bb_feedback enable row level security;

-- Users: can read/update own record
create policy "users_own" on public.bb_users for all using (auth.uid() = id);

-- Spaces: owner + team members can read
create policy "spaces_owner" on public.bb_spaces for all using (auth.uid() = user_id);
create policy "spaces_team" on public.bb_spaces for select using (
  exists (select 1 from public.bb_team_members where space_id = id and user_id = auth.uid())
);

-- Pages: space owner + editors/admins can write, viewers can read
create policy "pages_owner" on public.bb_pages for all using (
  exists (select 1 from public.bb_spaces where id = space_id and user_id = auth.uid())
);
create policy "pages_team_write" on public.bb_pages for all using (
  exists (select 1 from public.bb_team_members where space_id = bb_pages.space_id and user_id = auth.uid() and role in ('admin','editor'))
);
create policy "pages_team_read" on public.bb_pages for select using (
  exists (select 1 from public.bb_team_members where space_id = bb_pages.space_id and user_id = auth.uid())
);

-- Trigger: auto-create bb_user on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.bb_users (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Updated_at triggers
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger bb_spaces_updated_at before update on public.bb_spaces for each row execute function public.set_updated_at();
create trigger bb_pages_updated_at before update on public.bb_pages for each row execute function public.set_updated_at();
