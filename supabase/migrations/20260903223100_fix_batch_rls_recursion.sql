-- Fix infinite RLS recursion between batches and batch_students introduced when
-- batches_select_allocated_student was added (batch_students policy already reads batches).

create or replace function private.can_read_allocated_batch(batch_row_id bigint)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.batch_students bs
    join public.students s on s.id = bs.student_id
    where bs.batch_id = batch_row_id
      and (
        s.user_id = (select auth.uid())
        or s.parent_id = (select auth.uid())
      )
  );
$$;

create or replace function private.is_batch_tutor_or_qm(batch_row_id bigint)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.batches b
    where b.id = batch_row_id
      and (
        b.quality_manager_id = (select auth.uid())
        or b.tutor_id = (select auth.uid())
      )
  );
$$;

create or replace function private.can_read_batch_tutor_profile(profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.batch_students bs
    join public.students s on s.id = bs.student_id
    join public.batches b on b.id = bs.batch_id
    where b.tutor_id = profile_id
      and (
        s.user_id = (select auth.uid())
        or s.parent_id = (select auth.uid())
      )
  );
$$;

revoke all on function private.can_read_allocated_batch(bigint) from public;
revoke all on function private.is_batch_tutor_or_qm(bigint) from public;
revoke all on function private.can_read_batch_tutor_profile(uuid) from public;
grant execute on function private.can_read_allocated_batch(bigint) to authenticated;
grant execute on function private.is_batch_tutor_or_qm(bigint) to authenticated;
grant execute on function private.can_read_batch_tutor_profile(uuid) to authenticated;

drop policy if exists "batches_select_allocated_student" on public.batches;

create policy "batches_select_allocated_student"
  on public.batches
  for select
  to authenticated
  using (private.can_read_allocated_batch(id));

drop policy if exists "batch_students_select_staff_or_assigned" on public.batch_students;

create policy "batch_students_select_staff_or_assigned"
  on public.batch_students
  for select
  to authenticated
  using (
    private.is_staff()
    or private.is_batch_tutor_or_qm(batch_id)
    or exists (
      select 1
      from public.students s
      where s.id = student_id
        and (
          s.user_id = (select auth.uid())
          or s.parent_id = (select auth.uid())
        )
    )
  );

drop policy if exists "profiles_select_batch_tutor_for_student" on public.profiles;

create policy "profiles_select_batch_tutor_for_student"
  on public.profiles
  for select
  to authenticated
  using (private.can_read_batch_tutor_profile(id));
