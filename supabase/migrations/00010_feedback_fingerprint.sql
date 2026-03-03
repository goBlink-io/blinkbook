-- Add user_fingerprint column for dedup (localStorage-based visitor ID)
alter table public.bb_feedback
  add column user_fingerprint text;

-- Index for dedup lookups: prevent same visitor voting twice on a page
create unique index idx_bb_feedback_dedup
  on public.bb_feedback(page_id, user_fingerprint)
  where user_fingerprint is not null;
