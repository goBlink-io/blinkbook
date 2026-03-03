-- Custom branding columns for bb_spaces
alter table public.bb_spaces
  add column if not exists brand_logo_url text,
  add column if not exists brand_primary_color text not null default '#3B82F6',
  add column if not exists brand_accent_color text not null default '#10B981',
  add column if not exists brand_font text not null default 'Inter',
  add column if not exists brand_hide_powered_by boolean not null default false;

-- Storage bucket for brand logos
-- NOTE: If using Supabase CLI / dashboard, create the bucket manually or via the
-- storage API. The insert below works when the storage schema is available.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'brand-logos',
  'brand-logos',
  true,
  2097152, -- 2 MB
  array['image/png','image/jpeg','image/jpg','image/gif','image/webp','image/svg+xml']
)
on conflict (id) do nothing;

-- Storage RLS: authenticated users can upload/delete their own logos,
-- everyone can read (bucket is public).
create policy "brand_logos_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'brand-logos');

create policy "brand_logos_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'brand-logos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "brand_logos_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'brand-logos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "brand_logos_select" on storage.objects
  for select using (bucket_id = 'brand-logos');
