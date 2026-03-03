-- Add RLS policies for bb_feedback (table created in 00001 but missing policies)

-- Allow anyone to insert feedback (public-facing widget, no auth required)
create policy "Anyone can insert feedback" on public.bb_feedback
  for insert with check (true);

-- Space owners can view feedback for their spaces
create policy "Space owners can view feedback" on public.bb_feedback
  for select using (
    space_id in (select id from bb_spaces where user_id = auth.uid())
  );

-- Index for common query pattern (analytics reads by space + page)
create index idx_bb_feedback_space on public.bb_feedback(space_id, page_id);
