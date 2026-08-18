alter table public.assessment_requests
  add column if not exists report text;
