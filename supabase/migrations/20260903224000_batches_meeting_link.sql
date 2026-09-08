-- Online class meeting link for each batch (Zoom, Google Meet, etc.).

alter table public.batches
  add column if not exists meeting_link text;

alter table public.batches
  drop constraint if exists batches_meeting_link_check;

alter table public.batches
  add constraint batches_meeting_link_check check (
    meeting_link is null
    or meeting_link ~* '^https?://'
  );
