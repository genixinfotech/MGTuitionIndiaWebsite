-- Students allocated to tuition batches.

create table public.batch_students (
  id bigint generated always as identity primary key,
  batch_id bigint not null references public.batches (id) on delete cascade,
  student_id bigint not null references public.students (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (batch_id, student_id)
);

create index batch_students_batch_id_idx on public.batch_students (batch_id);
create index batch_students_student_id_idx on public.batch_students (student_id);

alter table public.batch_students enable row level security;
alter table public.batch_students force row level security;

create policy "batch_students_select_staff_or_assigned"
  on public.batch_students
  for select
  to authenticated
  using (
    private.is_staff()
    or exists (
      select 1
      from public.batches b
      where b.id = batch_id
        and (
          b.quality_manager_id = (select auth.uid())
          or b.tutor_id = (select auth.uid())
        )
    )
    or exists (
      select 1
      from public.students s
      where s.id = student_id
        and (s.parent_id = (select auth.uid()) or s.user_id = (select auth.uid()))
    )
  );

create policy "batch_students_write_staff"
  on public.batch_students
  for all
  to authenticated
  using (private.is_staff())
  with check (private.is_staff());

grant select, insert, update, delete on table public.batch_students to authenticated;
