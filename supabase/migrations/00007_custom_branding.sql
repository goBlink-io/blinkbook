-- Add custom-branding columns to bb_spaces
alter table public.bb_spaces
  add column if not exists brand_logo_url       text,
  add column if not exists brand_primary_color   text not null default '#3B82F6',
  add column if not exists brand_accent_color    text not null default '#10B981',
  add column if not exists brand_font            text not null default 'Inter',
  add column if not exists brand_hide_powered_by boolean not null default false;

-- Storage bucket for brand logos (2 MB, common image MIME types)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'brand-logos',
  'brand-logos',
  true,
  2097152,
  array['image/png','image/jpeg','image/gif','image/webp','image/svg+xml']
)
on conflict (id) do nothing;

-- RLS: anyone can read brand logos (bucket is public)
do $$ begin
  if not exists (
    select 1 from pg_policies where policyname = 'brand_logos_select' and tablename = 'objects'
  ) then
    create policy "brand_logos_select" on storage.objects
      for select using (bucket_id = 'brand-logos');
  end if;
end $$;

-- RLS: authenticated users can upload logos
do $$ begin
  if not exists (
    select 1 from pg_policies where policyname = 'brand_logos_insert' and tablename = 'objects'
  ) then
    create policy "brand_logos_insert" on storage.objects
      for insert to authenticated
      with check (bucket_id = 'brand-logos');
  end if;
end $$;

-- RLS: users can update only their own logos
do $$ begin
  if not exists (
    select 1 from pg_policies where policyname = 'brand_logos_update' and tablename = 'objects'
  ) then
    create policy "brand_logos_update" on storage.objects
      for update to authenticated
      using (bucket_id = 'brand-logos' and auth.uid()::text = (storage.foldername(name))[1]);
  end if;
end $$;

-- RLS: users can delete only their own logos
do $$ begin
  if not exists (
    select 1 from pg_policies where policyname = 'brand_logos_delete' and tablename = 'objects'
  ) then
    create policy "brand_logos_delete" on storage.objects
      for delete to authenticated
      using (bucket_id = 'brand-logos' and auth.uid()::text = (storage.foldername(name))[1]);
  end if;
end $$;
