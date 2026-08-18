-- Assessment PDF storage, recommended tuition subjects, and parent admissions.

alter table public.assessment_requests
  add column if not exists report_path text,
  add column if not exists weak_subjects jsonb not null default '[]'::jsonb;

create table if not exists public.student_subjects (
  id bigint generated always as identity primary key,
  student_id bigint not null references public.students (id) on delete cascade,
  subject text not null,
  monthly_rate integer not null,
  created_at timestamptz not null default now(),
  unique (student_id, subject)
);

create index if not exists student_subjects_student_id_idx
  on public.student_subjects (student_id);

create type public.admission_status as enum ('unpaid', 'paid');

create table if not exists public.admissions (
  id bigint generated always as identity primary key,
  student_id bigint not null unique references public.students (id) on delete cascade,
  parent_id uuid not null references public.profiles (id) on delete cascade,
  amount integer not null,
  status public.admission_status not null default 'unpaid',
  subjects jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create index if not exists admissions_parent_id_idx on public.admissions (parent_id);

alter table public.student_subjects enable row level security;
alter table public.student_subjects force row level security;
alter table public.admissions enable row level security;
alter table public.admissions force row level security;

create policy "student_subjects_select_own_or_ops"
  on public.student_subjects
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.students s
      where s.id = student_id
        and (
          s.parent_id = (select auth.uid())
          or s.user_id = (select auth.uid())
          or private.is_staff_or_consultant()
        )
    )
  );

create policy "student_subjects_write_ops"
  on public.student_subjects
  for all
  to authenticated
  using (private.is_staff_or_consultant())
  with check (private.is_staff_or_consultant());

create policy "admissions_select_own_or_ops"
  on public.admissions
  for select
  to authenticated
  using (
    parent_id = (select auth.uid())
    or private.is_staff_or_consultant()
  );

create policy "admissions_insert_parent"
  on public.admissions
  for insert
  to authenticated
  with check (
    parent_id = (select auth.uid())
    and exists (
      select 1
      from public.students s
      where s.id = student_id
        and s.parent_id = (select auth.uid())
    )
  );

create policy "admissions_update_parent_or_ops"
  on public.admissions
  for update
  to authenticated
  using (
    parent_id = (select auth.uid())
    or private.is_staff_or_consultant()
  )
  with check (
    parent_id = (select auth.uid())
    or private.is_staff_or_consultant()
  );

grant select, insert, update, delete on table public.student_subjects to authenticated;
grant select, insert, update on table public.admissions to authenticated;
grant usage, select on all sequences in schema public to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('assessment-reports', 'assessment-reports', false, 10485760, array['application/pdf'])
on conflict (id) do nothing;

drop policy if exists "assessment_reports_insert" on storage.objects;
drop policy if exists "assessment_reports_update" on storage.objects;
drop policy if exists "assessment_reports_select" on storage.objects;

create policy "assessment_reports_insert"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'assessment-reports'
    and private.is_staff_or_consultant()
  );

create policy "assessment_reports_update"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'assessment-reports'
    and private.is_staff_or_consultant()
  )
  with check (
    bucket_id = 'assessment-reports'
    and private.is_staff_or_consultant()
  );

create policy "assessment_reports_select"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'assessment-reports'
    and (
      private.is_staff_or_consultant()
      or exists (
        select 1
        from public.assessment_requests r
        where r.report_path = name
          and r.parent_id = (select auth.uid())
      )
    )
  );
