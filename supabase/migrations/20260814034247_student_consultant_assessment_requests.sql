-- Student-consultant role and assessment requests from enrolled students.

alter type public.app_role add value if not exists 'student_consultant';

create type public.assessment_status as enum (
  'new',
  'contacted',
  'scheduled',
  'completed',
  'cancelled'
);

create table public.assessment_requests (
  id bigint generated always as identity primary key,
  student_id bigint not null references public.students (id) on delete cascade,
  parent_id uuid not null references public.profiles (id) on delete cascade,
  requested_by uuid not null references auth.users (id) on delete cascade,
  status public.assessment_status not null default 'new',
  preferred_date date,
  preferred_time time,
  notes text,
  report text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index assessment_requests_created_at_idx
  on public.assessment_requests (created_at desc);

create index assessment_requests_status_idx
  on public.assessment_requests (status);

create index assessment_requests_student_id_idx
  on public.assessment_requests (student_id);

create index assessment_requests_parent_id_idx
  on public.assessment_requests (parent_id);

create unique index assessment_requests_one_open_per_student
  on public.assessment_requests (student_id)
  where status in ('new', 'contacted', 'scheduled');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger assessment_requests_set_updated_at
  before update on public.assessment_requests
  for each row execute function public.set_updated_at();

revoke execute on function public.set_updated_at() from public, anon, authenticated;

create or replace function private.is_student_consultant()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role::text = 'student_consultant'
  );
$$;

revoke all on function private.is_student_consultant() from public;
grant execute on function private.is_student_consultant() to authenticated;

create or replace function private.is_staff_or_consultant()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role::text in ('staff', 'student_consultant')
  );
$$;

revoke all on function private.is_staff_or_consultant() from public;
grant execute on function private.is_staff_or_consultant() to authenticated;

alter table public.assessment_requests enable row level security;
alter table public.assessment_requests force row level security;

create policy "assessment_requests_insert_parent"
  on public.assessment_requests
  for insert
  to authenticated
  with check (
    parent_id = (select auth.uid())
    and requested_by = (select auth.uid())
    and exists (
      select 1
      from public.students s
      where s.id = student_id
        and s.parent_id = (select auth.uid())
    )
  );

create policy "assessment_requests_select_own_or_ops"
  on public.assessment_requests
  for select
  to authenticated
  using (
    parent_id = (select auth.uid())
    or private.is_staff_or_consultant()
  );

create policy "assessment_requests_update_ops"
  on public.assessment_requests
  for update
  to authenticated
  using (private.is_staff_or_consultant())
  with check (private.is_staff_or_consultant());

drop policy if exists "profiles_select_own_or_staff" on public.profiles;

create policy "profiles_select_own_or_staff"
  on public.profiles
  for select
  to authenticated
  using (
    id = (select auth.uid())
    or private.is_staff_or_consultant()
  );

drop policy if exists "students_select_own_or_staff" on public.students;

create policy "students_select_own_or_staff"
  on public.students
  for select
  to authenticated
  using (
    parent_id = (select auth.uid())
    or user_id = (select auth.uid())
    or private.is_staff_or_consultant()
  );

grant select, insert on table public.assessment_requests to authenticated;
grant update on table public.assessment_requests to authenticated;
grant usage, select on all sequences in schema public to authenticated;
