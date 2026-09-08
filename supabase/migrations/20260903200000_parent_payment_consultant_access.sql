-- Allow parents to view student consultant contact details for admission payments.

create or replace function private.is_parent()
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
      and role::text = 'parent'
  );
$$;

revoke all on function private.is_parent() from public;
grant execute on function private.is_parent() to authenticated;

drop policy if exists "student_consultants_select_own_or_staff" on public.student_consultants;

create policy "student_consultants_select_own_or_staff"
  on public.student_consultants
  for select
  to authenticated
  using (
    id = (select auth.uid())
    or private.is_staff_or_consultant()
    or private.is_parent()
  );

drop policy if exists "profiles_select_own_or_staff" on public.profiles;

create policy "profiles_select_own_or_staff"
  on public.profiles
  for select
  to authenticated
  using (
    id = (select auth.uid())
    or private.is_staff_or_consultant()
    or (role::text = 'student-consultant' and private.is_parent())
  );
