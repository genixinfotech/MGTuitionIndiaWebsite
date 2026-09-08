-- Curriculum (syllabi, grades, subjects) and per-subject assessment requests.
-- Replaces the previously split 20260903170000 + 20260903180000 migrations.

-- ---------------------------------------------------------------------------
-- Assessment requests: one open row per student + subject
-- ---------------------------------------------------------------------------

alter table public.assessment_requests
  add column if not exists subject text,
  add column if not exists assigned_expert_id uuid references public.profiles (id) on delete set null;

update public.assessment_requests
set subject = 'General'
where subject is null;

alter table public.assessment_requests
  alter column subject set default 'General',
  alter column subject set not null;

drop index if exists public.assessment_requests_one_open_per_student;

create unique index if not exists assessment_requests_one_open_per_student_subject
  on public.assessment_requests (student_id, subject)
  where status in ('new', 'contacted', 'scheduled');

create index if not exists assessment_requests_subject_idx
  on public.assessment_requests (subject);

create index if not exists assessment_requests_assigned_expert_id_idx
  on public.assessment_requests (assigned_expert_id);

create or replace function private.is_subject_expert()
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
      and role::text = 'subject-expert'
  );
$$;

revoke all on function private.is_subject_expert() from public;
grant execute on function private.is_subject_expert() to authenticated;

drop policy if exists "assessment_requests_select_assigned_expert" on public.assessment_requests;

create policy "assessment_requests_select_assigned_expert"
  on public.assessment_requests
  for select
  to authenticated
  using (assigned_expert_id = (select auth.uid()));

drop policy if exists "assessment_requests_update_assigned_expert" on public.assessment_requests;

create policy "assessment_requests_update_assigned_expert"
  on public.assessment_requests
  for update
  to authenticated
  using (assigned_expert_id = (select auth.uid()))
  with check (assigned_expert_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Curriculum
-- ---------------------------------------------------------------------------

create table public.syllabi (
  id smallint generated always as identity primary key,
  name text not null unique,
  code text not null unique,
  sort_order smallint not null unique,
  created_at timestamptz not null default now()
);

create table public.grades (
  id smallint generated always as identity primary key,
  label text not null unique,
  sort_order smallint not null unique,
  created_at timestamptz not null default now()
);

create table public.subjects (
  id smallint generated always as identity primary key,
  name text not null unique,
  sort_order smallint not null,
  created_at timestamptz not null default now()
);

create table public.syllabus_grade_subjects (
  syllabus_id smallint not null references public.syllabi (id) on delete cascade,
  grade_id smallint not null references public.grades (id) on delete cascade,
  subject_id smallint not null references public.subjects (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (syllabus_id, grade_id, subject_id)
);

create index syllabus_grade_subjects_grade_id_idx
  on public.syllabus_grade_subjects (grade_id);

create index syllabus_grade_subjects_subject_id_idx
  on public.syllabus_grade_subjects (subject_id);

alter table public.syllabi enable row level security;
alter table public.grades enable row level security;
alter table public.subjects enable row level security;
alter table public.syllabus_grade_subjects enable row level security;

alter table public.syllabi force row level security;
alter table public.grades force row level security;
alter table public.subjects force row level security;
alter table public.syllabus_grade_subjects force row level security;

create policy "syllabi_select_public"
  on public.syllabi
  for select
  to anon, authenticated
  using (true);

create policy "grades_select_public"
  on public.grades
  for select
  to anon, authenticated
  using (true);

create policy "subjects_select_public"
  on public.subjects
  for select
  to anon, authenticated
  using (true);

create policy "syllabus_grade_subjects_select_public"
  on public.syllabus_grade_subjects
  for select
  to anon, authenticated
  using (true);

grant select on table public.syllabi to anon, authenticated;
grant select on table public.grades to anon, authenticated;
grant select on table public.subjects to anon, authenticated;
grant select on table public.syllabus_grade_subjects to anon, authenticated;

insert into public.syllabi (name, code, sort_order)
values
  ('CBSE', 'cbse', 1),
  ('ICSE / ISC', 'icse', 2),
  ('IGCSE Syllabus', 'igcse', 3),
  ('Other State Board', 'other', 4);

insert into public.grades (label, sort_order)
values
  ('Class 4', 4),
  ('Class 5', 5),
  ('Class 6', 6),
  ('Class 7', 7),
  ('Class 8', 8),
  ('Class 9', 9),
  ('Class 10', 10),
  ('Class 11', 11),
  ('Class 12', 12);

insert into public.subjects (name, sort_order)
values
  ('Mathematics', 1),
  ('English', 2),
  ('Science', 3),
  ('Social Science', 4),
  ('Physics', 5),
  ('Chemistry', 6),
  ('Biology', 7),
  ('History', 8),
  ('Geography', 9),
  ('Economics', 10),
  ('Accountancy', 11);

-- CBSE + ICSE: Class 4–8 combined Science / Social Science
insert into public.syllabus_grade_subjects (syllabus_id, grade_id, subject_id)
select sy.id, g.id, s.id
from public.syllabi sy
cross join public.grades g
cross join public.subjects s
where sy.code in ('cbse', 'icse', 'other')
  and g.sort_order between 4 and 8
  and s.name in ('Mathematics', 'English', 'Science', 'Social Science');

-- CBSE + ICSE: Class 9–10 split sciences / humanities
insert into public.syllabus_grade_subjects (syllabus_id, grade_id, subject_id)
select sy.id, g.id, s.id
from public.syllabi sy
cross join public.grades g
cross join public.subjects s
where sy.code in ('cbse', 'icse', 'other')
  and g.sort_order between 9 and 10
  and s.name in ('Mathematics', 'English', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography');

-- CBSE + ICSE: Class 11–12 senior secondary
insert into public.syllabus_grade_subjects (syllabus_id, grade_id, subject_id)
select sy.id, g.id, s.id
from public.syllabi sy
cross join public.grades g
cross join public.subjects s
where sy.code in ('cbse', 'icse', 'other')
  and g.sort_order between 11 and 12
  and s.name in (
    'Mathematics',
    'English',
    'Physics',
    'Chemistry',
    'Biology',
    'History',
    'Geography',
    'Economics',
    'Accountancy'
  );

-- IGCSE: Classes 6–8 (combined Science; no separate Social Science label in lower years)
insert into public.syllabus_grade_subjects (syllabus_id, grade_id, subject_id)
select sy.id, g.id, s.id
from public.syllabi sy
cross join public.grades g
cross join public.subjects s
where sy.code = 'igcse'
  and g.sort_order between 6 and 8
  and s.name in ('Mathematics', 'English', 'Science');

-- IGCSE: Classes 9–10
insert into public.syllabus_grade_subjects (syllabus_id, grade_id, subject_id)
select sy.id, g.id, s.id
from public.syllabi sy
cross join public.grades g
cross join public.subjects s
where sy.code = 'igcse'
  and g.sort_order between 9 and 10
  and s.name in ('Mathematics', 'English', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'Economics');

-- IGCSE: Classes 11–12
insert into public.syllabus_grade_subjects (syllabus_id, grade_id, subject_id)
select sy.id, g.id, s.id
from public.syllabi sy
cross join public.grades g
cross join public.subjects s
where sy.code = 'igcse'
  and g.sort_order between 11 and 12
  and s.name in (
    'Mathematics',
    'English',
    'Physics',
    'Chemistry',
    'Biology',
    'History',
    'Geography',
    'Economics'
  );
