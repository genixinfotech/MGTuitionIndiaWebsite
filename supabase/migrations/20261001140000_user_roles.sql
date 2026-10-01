-- Editable user types for OneView → Users and Settings.

create or replace function private.is_superadmin()
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
      and replace(role::text, '_', '-') = 'superadmin'
  );
$$;

revoke all on function private.is_superadmin() from public;
grant execute on function private.is_superadmin() to authenticated;

create table if not exists public.user_roles (
  id bigint generated always as identity primary key,
  slug text not null unique,
  label text not null,
  kind text not null check (kind in ('account', 'system')),
  locked boolean not null default false,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_roles_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

create index if not exists user_roles_sort_order_idx on public.user_roles (sort_order, label);

insert into public.user_roles (slug, label, kind, locked, sort_order)
values
  ('superadmin', 'Superadmin', 'system', true, 10),
  ('admin', 'Admin', 'system', false, 20),
  ('subject-expert', 'Subject Expert', 'system', false, 30),
  ('marketing-manager', 'Marketing Manager', 'system', false, 40),
  ('hr-manager', 'HR Manager', 'system', false, 50),
  ('accounts', 'Accounts', 'system', false, 60),
  ('quality-manager', 'Quality Manager', 'system', false, 70),
  ('student-consultant', 'Student Consultant', 'system', false, 80),
  ('tutor', 'Tutor', 'account', true, 90),
  ('parent', 'Parent', 'account', true, 100),
  ('student', 'Student', 'account', true, 110)
on conflict (slug) do nothing;

drop trigger if exists user_roles_set_updated_at on public.user_roles;
create trigger user_roles_set_updated_at
  before update on public.user_roles
  for each row
  execute function public.set_updated_at();

create or replace function public.user_roles_protect()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' then
    if new.slug is distinct from old.slug then
      raise exception 'User type slug cannot be changed.';
    end if;
    if old.locked and (
      new.kind is distinct from old.kind
      or new.locked is distinct from old.locked
    ) then
      raise exception 'This user type is required and cannot be changed.';
    end if;
    return new;
  end if;

  if tg_op = 'DELETE' then
    if old.locked then
      raise exception 'This user type is required and cannot be removed.';
    end if;
    return old;
  end if;

  return null;
end;
$$;

drop trigger if exists user_roles_protect_upd on public.user_roles;
create trigger user_roles_protect_upd
  before update on public.user_roles
  for each row
  execute function public.user_roles_protect();

drop trigger if exists user_roles_protect_del on public.user_roles;
create trigger user_roles_protect_del
  before delete on public.user_roles
  for each row
  execute function public.user_roles_protect();

alter table public.user_roles enable row level security;
alter table public.user_roles force row level security;

drop policy if exists "user_roles_select_team" on public.user_roles;
create policy "user_roles_select_team"
  on public.user_roles
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles
      where id = (select auth.uid())
        and replace(role::text, '_', '-') not in ('parent', 'tutor', 'student')
    )
  );

drop policy if exists "user_roles_insert_superadmin" on public.user_roles;
create policy "user_roles_insert_superadmin"
  on public.user_roles
  for insert
  to authenticated
  with check (private.is_superadmin() and kind = 'system' and locked = false);

drop policy if exists "user_roles_update_superadmin" on public.user_roles;
create policy "user_roles_update_superadmin"
  on public.user_roles
  for update
  to authenticated
  using (private.is_superadmin())
  with check (private.is_superadmin());

drop policy if exists "user_roles_delete_superadmin" on public.user_roles;
create policy "user_roles_delete_superadmin"
  on public.user_roles
  for delete
  to authenticated
  using (private.is_superadmin() and locked = false);

grant select, insert, update, delete on table public.user_roles to authenticated;
grant usage, select on sequence public.user_roles_id_seq to authenticated;
