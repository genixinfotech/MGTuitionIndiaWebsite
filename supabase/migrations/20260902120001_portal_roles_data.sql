-- Migrate legacy roles and refresh internal-role helpers.

update public.profiles
set role = 'admin'
where role::text = 'staff';

update public.profiles
set role = 'student-consultant'
where role::text = 'student_consultant';

update public.profiles
set role = 'hr-manager'
where role::text = 'hr';

create or replace function private.is_internal_role(role_name text)
returns boolean
language sql
immutable
as $$
  select role_name in (
    'superadmin',
    'admin',
    'subject-expert',
    'marketing-manager',
    'hr-manager',
    'accounts',
    'quality-manager',
    'student-consultant',
    'staff'
  );
$$;

create or replace function private.is_staff()
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
      and private.is_internal_role(role::text)
  );
$$;

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
      and role::text in ('student-consultant', 'student_consultant')
  );
$$;

create or replace function private.is_staff_or_consultant()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select private.is_staff() or private.is_student_consultant();
$$;

revoke all on function private.is_internal_role(text) from public;
grant execute on function private.is_internal_role(text) to authenticated;
