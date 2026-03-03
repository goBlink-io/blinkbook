-- Enable llms.txt generation for AI-ready documentation
alter table public.bb_spaces
  add column llms_txt_enabled boolean not null default true;
