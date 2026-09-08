-- Tuition batches named after subject heroes (Nobel laureates and science icons).

create table public.batches (
  id bigint generated always as identity primary key,
  name text not null,
  hero_full_name text not null,
  subject text not null,
  syllabus text not null,
  grade text not null,
  start_date date not null,
  days_of_week smallint[] not null default '{}'::smallint[],
  start_time text not null,
  end_time text not null,
  quality_manager_id uuid not null references public.quality_managers (id) on delete restrict,
  tutor_id uuid not null references public.tutors (id) on delete restrict,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (cardinality(days_of_week) > 0),
  check (days_of_week <@ array[0, 1, 2, 3, 4, 5, 6]::smallint[])
);

create unique index batches_name_unique_idx on public.batches (lower(name));
create index batches_subject_idx on public.batches (subject);
create index batches_syllabus_grade_idx on public.batches (syllabus, grade);
create index batches_tutor_id_idx on public.batches (tutor_id);
create index batches_quality_manager_id_idx on public.batches (quality_manager_id);

create trigger batches_set_updated_at
  before update on public.batches
  for each row execute function public.set_updated_at();

alter table public.batches enable row level security;
alter table public.batches force row level security;

create policy "batches_select_staff_or_assigned"
  on public.batches
  for select
  to authenticated
  using (
    private.is_staff()
    or quality_manager_id = (select auth.uid())
    or tutor_id = (select auth.uid())
  );

create policy "batches_write_staff"
  on public.batches
  for all
  to authenticated
  using (private.is_staff())
  with check (private.is_staff());

grant select, insert, update, delete on table public.batches to authenticated;
