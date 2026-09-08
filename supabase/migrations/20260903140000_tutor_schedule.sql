-- Tutor preferred work schedule (weekly availability slots).

alter table public.tutors
  add column if not exists timezone text not null default 'Asia/Kolkata';

create table public.tutor_schedule_slots (
  id bigint generated always as identity primary key,
  tutor_id uuid not null references public.tutors (id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (start_time < end_time),
  check (extract(minute from start_time)::int % 30 = 0),
  check (extract(minute from end_time)::int % 30 = 0),
  check (end_time - start_time >= interval '30 minutes')
);

create index tutor_schedule_slots_tutor_id_idx
  on public.tutor_schedule_slots (tutor_id);

create index tutor_schedule_slots_day_idx
  on public.tutor_schedule_slots (tutor_id, day_of_week, start_time);

create trigger tutor_schedule_slots_set_updated_at
  before update on public.tutor_schedule_slots
  for each row execute function public.set_updated_at();

alter table public.tutor_schedule_slots enable row level security;
alter table public.tutor_schedule_slots force row level security;

create policy "tutor_schedule_slots_select"
  on public.tutor_schedule_slots
  for select
  to authenticated
  using (
    tutor_id = (select auth.uid())
    or private.is_staff_or_consultant()
  );

create policy "tutor_schedule_slots_insert_own"
  on public.tutor_schedule_slots
  for insert
  to authenticated
  with check (tutor_id = (select auth.uid()));

create policy "tutor_schedule_slots_update_own"
  on public.tutor_schedule_slots
  for update
  to authenticated
  using (tutor_id = (select auth.uid()))
  with check (tutor_id = (select auth.uid()));

create policy "tutor_schedule_slots_delete_own"
  on public.tutor_schedule_slots
  for delete
  to authenticated
  using (tutor_id = (select auth.uid()));

grant select, insert, update, delete on table public.tutor_schedule_slots to authenticated;
