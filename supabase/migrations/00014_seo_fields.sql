-- SEO fields for spaces and pages

-- Space-level SEO fields
alter table public.bb_spaces add column if not exists meta_title text;
alter table public.bb_spaces add column if not exists meta_description text;
alter table public.bb_spaces add column if not exists og_image_url text;
alter table public.bb_spaces add column if not exists favicon_url text;
alter table public.bb_spaces add column if not exists social_twitter text;

-- Page-level SEO fields
alter table public.bb_pages add column if not exists meta_title text;
alter table public.bb_pages add column if not exists meta_description text;
alter table public.bb_pages add column if not exists og_image_url text;
alter table public.bb_pages add column if not exists noindex boolean not null default false;

-- Storage bucket for OG images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'og-images',
  'og-images',
  true,
  2097152,
  array['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
)
on conflict (id) do nothing;

-- Storage bucket for favicons
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'favicons',
  'favicons',
  true,
  524288,
  array['image/png', 'image/x-icon', 'image/svg+xml', 'image/vnd.microsoft.icon']
)
on conflict (id) do nothing;

-- RLS: Public read for OG images
create policy "Public read access for OG images"
  on storage.objects for select
  using (bucket_id = 'og-images');

-- RLS: Authenticated users can upload OG images
create policy "Authenticated users can upload OG images"
  on storage.objects for insert
  with check (bucket_id = 'og-images' and auth.role() = 'authenticated');

-- RLS: Users can update their own OG images
create policy "Users can update own OG images"
  on storage.objects for update
  using (bucket_id = 'og-images' and auth.uid()::text = (storage.foldername(name))[1]);

-- RLS: Users can delete their own OG images
create policy "Users can delete own OG images"
  on storage.objects for delete
  using (bucket_id = 'og-images' and auth.uid()::text = (storage.foldername(name))[1]);

-- RLS: Public read for favicons
create policy "Public read access for favicons"
  on storage.objects for select
  using (bucket_id = 'favicons');

-- RLS: Authenticated users can upload favicons
create policy "Authenticated users can upload favicons"
  on storage.objects for insert
  with check (bucket_id = 'favicons' and auth.role() = 'authenticated');

-- RLS: Users can update their own favicons
create policy "Users can update own favicons"
  on storage.objects for update
  using (bucket_id = 'favicons' and auth.uid()::text = (storage.foldername(name))[1]);

-- RLS: Users can delete their own favicons
create policy "Users can delete own favicons"
  on storage.objects for delete
  using (bucket_id = 'favicons' and auth.uid()::text = (storage.foldername(name))[1]);
