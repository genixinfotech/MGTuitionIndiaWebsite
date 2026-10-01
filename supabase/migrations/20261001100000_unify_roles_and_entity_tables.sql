-- Unify profile.role as dashed text, keep parents/tutors/students,
-- and store every other team role in a single system_users table.

update public.profiles
set role = 'student-consultant'
where role::text in ('student_consultant');

update public.profiles
set role = 'admin'
where role::text = 'staff';

update public.profiles
set role = 'hr-manager'
where role::text = 'hr';

drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists profiles_normalize_role on public.profiles;
drop trigger if exists profiles_sync_parent_record on public.profiles;
drop trigger if exists profiles_sync_tutor_record on public.profiles;
drop trigger if exists profiles_sync_quality_manager_record on public.profiles;
drop trigger if exists profiles_sync_student_consultant_record on public.profiles;
drop trigger if exists profiles_sync_role_entity on public.profiles;
drop trigger if exists profiles_protect_role on public.profiles;

do $$
declare
  pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
  loop
    execute format('drop policy if exists %I on public.profiles', pol.policyname);
  end loop;
end;
$$;

drop function if exists public.handle_new_user();
drop function if exists public.normalize_profile_role();

alter table public.profiles alter column role drop default;

alter table public.profiles
  alter column role type text
  using (
    case role::text
      when 'student_consultant' then 'student-consultant'
      when 'staff' then 'admin'
      when 'hr' then 'hr-manager'
      else replace(role::text, '_', '-')
    end
  );

alter table public.profiles
  alter column role set default 'parent';

drop type if exists public.app_role;

create or replace function public.normalize_profile_role()
returns trigger
language plpgsql
as $$
declare
  normalized text;
begin
  normalized := replace(lower(coalesce(new.role, 'parent')), '_', '-');
  if normalized = 'hr' then
    normalized := 'hr-manager';
  elsif normalized = '' then
    normalized := 'parent';
  end if;
  new.role := normalized;
  return new;
end;
$$;

create trigger profiles_normalize_role
  before insert or update of role on public.profiles
  for each row
  execute function public.normalize_profile_role();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  assigned_role text := 'parent';
  role_text text;
begin
  role_text := replace(lower(coalesce(new.raw_app_meta_data->>'role', 'parent')), '_', '-');
  if role_text = 'hr' then
    role_text := 'hr-manager';
  elsif role_text = '' then
    role_text := 'parent';
  end if;
  assigned_role := role_text;

  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.email, ''),
    assigned_role
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.protect_profile_role()
returns trigger
language plpgsql
as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null then
    new.role := old.role;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_protect_role
  before update on public.profiles
  for each row execute function public.protect_profile_role();

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.normalize_profile_role() from public, anon, authenticated;
revoke execute on function public.protect_profile_role() from public, anon, authenticated;

drop policy if exists "profiles_select_own_or_staff" on public.profiles;
create policy "profiles_select_own_or_staff"
  on public.profiles
  for select
  to authenticated
  using (
    id = (select auth.uid())
    or private.is_staff_or_consultant()
    or (role = 'student-consultant' and private.is_parent())
  );

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

drop policy if exists "profiles_select_batch_tutor_for_student" on public.profiles;
do $$
begin
  if exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'private'
      and p.proname = 'can_read_batch_tutor_profile'
  ) then
    execute $policy$
      create policy "profiles_select_batch_tutor_for_student"
        on public.profiles
        for select
        to authenticated
        using (private.can_read_batch_tutor_profile(id))
    $policy$;
  end if;
end;
$$;

create table if not exists public.system_users (
  id uuid primary key references public.profiles (id) on delete cascade,
  role text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists system_users_role_idx on public.system_users (role);
create index if not exists system_users_created_at_idx on public.system_users (created_at desc);

alter table public.system_users enable row level security;
alter table public.system_users force row level security;

insert into public.system_users (id, role, created_at, updated_at)
select id, role, created_at, updated_at
from public.profiles
where role not in ('parent', 'tutor', 'student')
on conflict (id) do update
set role = excluded.role,
    updated_at = now();

do $$
begin
  if to_regclass('public.quality_managers') is not null then
    insert into public.system_users (id, role, created_at, updated_at)
    select qm.id, coalesce(p.role, 'quality-manager'), qm.created_at, qm.updated_at
    from public.quality_managers qm
    left join public.profiles p on p.id = qm.id
    on conflict (id) do nothing;
  end if;

  if to_regclass('public.student_consultants') is not null then
    insert into public.system_users (id, role, created_at, updated_at)
    select sc.id, coalesce(p.role, 'student-consultant'), sc.created_at, sc.updated_at
    from public.student_consultants sc
    left join public.profiles p on p.id = sc.id
    on conflict (id) do nothing;
  end if;
end;
$$;

create or replace function private.is_internal_role(role_name text)
returns boolean
language sql
immutable
as $$
  select replace(coalesce(role_name, ''), '_', '-') not in ('parent', 'tutor', 'student', '');
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
    from public.system_users
    where id = (select auth.uid())
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
    from public.system_users
    where id = (select auth.uid())
      and role = 'student-consultant'
  );
$$;

create or replace function private.is_staff_or_consultant()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select private.is_staff();
$$;

drop policy if exists "system_users_select_own_or_staff" on public.system_users;
create policy "system_users_select_own_or_staff"
  on public.system_users
  for select
  to authenticated
  using (
    id = (select auth.uid())
    or private.is_staff()
    or private.is_parent()
  );

grant select on table public.system_users to authenticated;

create or replace function public.sync_profile_role_entity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role = 'parent' then
    insert into public.parents (id, created_at, updated_at)
    values (new.id, coalesce(new.created_at, now()), coalesce(new.updated_at, now()))
    on conflict (id) do update set updated_at = now();
    delete from public.system_users where id = new.id;
  elsif new.role = 'tutor' then
    insert into public.tutors (id, created_at, updated_at)
    values (new.id, coalesce(new.created_at, now()), coalesce(new.updated_at, now()))
    on conflict (id) do update set updated_at = now();
    delete from public.system_users where id = new.id;
  elsif new.role = 'student' then
    delete from public.system_users where id = new.id;
  else
    insert into public.system_users (id, role, created_at, updated_at)
    values (new.id, new.role, coalesce(new.created_at, now()), coalesce(new.updated_at, now()))
    on conflict (id) do update
    set role = excluded.role,
        updated_at = now();
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_sync_role_entity on public.profiles;

create trigger profiles_sync_role_entity
  after insert or update of role on public.profiles
  for each row
  execute function public.sync_profile_role_entity();

revoke execute on function public.sync_profile_role_entity() from public, anon, authenticated;

insert into public.parents (id, created_at, updated_at)
select id, created_at, updated_at from public.profiles where role = 'parent'
on conflict (id) do nothing;

insert into public.tutors (id, created_at, updated_at)
select id, created_at, updated_at from public.profiles where role = 'tutor'
on conflict (id) do nothing;

do $$
declare
  fk_name text;
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'batches'
      and column_name = 'quality_manager_id'
  ) then
    for fk_name in
      select c.conname
      from pg_constraint c
      join pg_class rel on rel.oid = c.conrelid
      join pg_namespace nsp on nsp.oid = rel.relnamespace
      join pg_attribute att on att.attrelid = rel.oid and att.attnum = any (c.conkey)
      where nsp.nspname = 'public'
        and rel.relname = 'batches'
        and att.attname = 'quality_manager_id'
        and c.contype = 'f'
    loop
      execute format('alter table public.batches drop constraint if exists %I', fk_name);
    end loop;

    execute $sql$
      alter table public.batches
        add constraint batches_quality_manager_id_fkey
        foreign key (quality_manager_id)
        references public.system_users (id)
        on delete restrict
    $sql$;
  end if;
end;
$$;

drop table if exists public.superadmins;
drop table if exists public.admins;
drop table if exists public.subject_experts;
drop table if exists public.marketing_managers;
drop table if exists public.hr_managers;
drop table if exists public.accounts;
drop table if exists public.quality_managers;
drop table if exists public.student_consultants;
drop function if exists public.sync_quality_manager_record();
drop function if exists public.sync_student_consultant_record();
drop function if exists public.sync_parent_record();
drop function if exists public.sync_tutor_record();
