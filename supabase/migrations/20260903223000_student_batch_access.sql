-- Let allocated students (and their parents) read batch details and tutor names.
-- Uses security definer helpers so batches / batch_students policies do not recurse.

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
revoke all on function private.can_read_batch_tutor_profile(uuid) from public;
grant execute on function private.can_read_allocated_batch(bigint) to authenticated;
grant execute on function private.can_read_batch_tutor_profile(uuid) to authenticated;

create policy "batches_select_allocated_student"
  on public.batches
  for select
  to authenticated
  using (private.can_read_allocated_batch(id));

create policy "profiles_select_batch_tutor_for_student"
  on public.profiles
  for select
  to authenticated
  using (private.can_read_batch_tutor_profile(id));
