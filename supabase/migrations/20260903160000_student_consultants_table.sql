-- Dedicated student_consultants table (one row per consultant account, linked to auth profile).
-- Also normalizes legacy profile role value student_consultant -> student-consultant.

alter type public.app_role add value if not exists 'student-consultant';

update public.profiles
set role = 'student-consultant'
where role::text = 'student_consultant';

create table public.student_consultants (
  id uuid primary key references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index student_consultants_created_at_idx
  on public.student_consultants (created_at desc);

alter table public.student_consultants enable row level security;
alter table public.student_consultants force row level security;

insert into public.student_consultants (id, created_at, updated_at)
select id, created_at, updated_at
from public.profiles
where role::text = 'student-consultant'
on conflict (id) do nothing;

create or replace function public.normalize_profile_role()
returns trigger
language plpgsql
as $$
begin
  if new.role::text = 'student_consultant' then
    new.role := 'student-consultant'::public.app_role;
  elsif new.role::text = 'staff' then
    new.role := 'admin'::public.app_role;
  elsif new.role::text = 'hr' then
    new.role := 'hr-manager'::public.app_role;
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_normalize_role on public.profiles;

create trigger profiles_normalize_role
  before insert or update of role on public.profiles
  for each row
  execute function public.normalize_profile_role();

create or replace function public.sync_student_consultant_record()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role::text = 'student-consultant' then
    insert into public.student_consultants (id, created_at, updated_at)
    values (new.id, coalesce(new.created_at, now()), coalesce(new.updated_at, now()))
    on conflict (id) do update set updated_at = now();
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_sync_student_consultant_record on public.profiles;

create trigger profiles_sync_student_consultant_record
  after insert or update of role on public.profiles
  for each row
  execute function public.sync_student_consultant_record();

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
      and role::text = 'student-consultant'
  );
$$;

create policy "student_consultants_select_own_or_staff"
  on public.student_consultants
  for select
  to authenticated
  using (id = (select auth.uid()) or private.is_staff_or_consultant());

grant select on table public.student_consultants to authenticated;

revoke execute on function public.normalize_profile_role() from public, anon, authenticated;
revoke execute on function public.sync_student_consultant_record() from public, anon, authenticated;
