-- Store how many classes a payment covers and which month is paid through.

alter table public.admissions
  add column if not exists subject_sessions jsonb not null default '{}'::jsonb,
  add column if not exists subject_covered_through jsonb not null default '{}'::jsonb;

alter table public.tuition_payments
  add column if not exists coverage jsonb not null default '[]'::jsonb;
