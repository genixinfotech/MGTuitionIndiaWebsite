-- Monthly tuition catalog. India rows are INR; GCC rows are USD.
-- Each region project can store both; the app loads rows for the active Region.

create table if not exists public.tuition_plans (
  id bigint generated always as identity primary key,
  region text not null check (region in ('India', 'GCC')),
  currency text not null check (currency in ('INR', 'USD')),
  grade_number smallint not null check (grade_number between 4 and 12),
  grade_label text not null,
  sessions_min integer not null check (sessions_min > 0),
  sessions_max integer not null check (sessions_max >= sessions_min),
  monthly_rate numeric(10, 2) not null check (monthly_rate >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (region, grade_number)
);

create index if not exists tuition_plans_region_idx on public.tuition_plans (region);

alter table public.tuition_plans enable row level security;
alter table public.tuition_plans force row level security;

create trigger tuition_plans_set_updated_at
  before update on public.tuition_plans
  for each row
  execute function public.set_updated_at();

create policy "tuition_plans_select_public"
  on public.tuition_plans
  for select
  to anon, authenticated
  using (true);

create policy "tuition_plans_write_staff"
  on public.tuition_plans
  for all
  to authenticated
  using (private.is_staff_or_consultant())
  with check (private.is_staff_or_consultant());

grant select on table public.tuition_plans to anon, authenticated;
grant insert, update, delete on table public.tuition_plans to authenticated;
grant usage, select on all sequences in schema public to authenticated;

insert into public.tuition_plans (
  region, currency, grade_number, grade_label, sessions_min, sessions_max, monthly_rate
)
values
  ('India', 'INR', 4, '4th Grade/Class', 8, 8, 2500),
  ('India', 'INR', 5, '5th Grade/Class', 8, 8, 2500),
  ('India', 'INR', 6, '6th Grade/Class', 8, 8, 2500),
  ('India', 'INR', 7, '7th Grade/Class', 8, 8, 2500),
  ('India', 'INR', 8, '8th Grade/Class', 8, 8, 3000),
  ('India', 'INR', 9, '9th Grade/Class', 8, 8, 3000),
  ('India', 'INR', 10, '10th Grade/Class', 12, 12, 3500),
  ('India', 'INR', 11, '11th Grade/Class', 12, 12, 3500),
  ('India', 'INR', 12, '12th Grade/Class', 12, 12, 3500),
  ('GCC', 'USD', 4, '4th Grade/Class', 8, 8, 35),
  ('GCC', 'USD', 5, '5th Grade/Class', 8, 8, 35),
  ('GCC', 'USD', 6, '6th Grade/Class', 8, 8, 35),
  ('GCC', 'USD', 7, '7th Grade/Class', 8, 8, 35),
  ('GCC', 'USD', 8, '8th Grade/Class', 8, 8, 40),
  ('GCC', 'USD', 9, '9th Grade/Class', 8, 8, 40),
  ('GCC', 'USD', 10, '10th Grade/Class', 12, 12, 60),
  ('GCC', 'USD', 11, '11th Grade/Class', 12, 12, 60),
  ('GCC', 'USD', 12, '12th Grade/Class', 12, 12, 60)
on conflict (region, grade_number) do update
set
  currency = excluded.currency,
  grade_label = excluded.grade_label,
  sessions_min = excluded.sessions_min,
  sessions_max = excluded.sessions_max,
  monthly_rate = excluded.monthly_rate;
