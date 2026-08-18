alter table public.assessment_requests
  add column if not exists preferred_date date,
  add column if not exists preferred_time time;
