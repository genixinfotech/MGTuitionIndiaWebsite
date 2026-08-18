-- Auth profiles, form leads, and students — foundation for the parent portal and staff CRM.

create schema if not exists private;

create type public.app_role as enum ('parent', 'tutor', 'staff');
create type public.enquiry_kind as enum ('trial', 'contact', 'tutor');
create type public.enquiry_status as enum ('new', 'contacted', 'enrolled', 'closed');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  email text not null,
  phone text,
  role public.app_role not null default 'parent',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.enquiries (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users (id) on delete set null,
  kind public.enquiry_kind not null,
  name text not null,
  email text not null,
  phone text,
  payload jsonb not null default '{}'::jsonb,
  status public.enquiry_status not null default 'new',
  created_at timestamptz not null default now()
);

create table public.students (
  id bigint generated always as identity primary key,
  parent_id uuid not null references public.profiles (id) on delete cascade,
  full_name text not null,
  board text,
  grade text,
  notes text,
  created_at timestamptz not null default now()
);

create index enquiries_created_at_idx on public.enquiries (created_at desc);
create index enquiries_user_id_idx on public.enquiries (user_id);
create index enquiries_status_idx on public.enquiries (status);
create index students_parent_id_idx on public.students (parent_id);

alter table public.profiles enable row level security;
alter table public.enquiries enable row level security;
alter table public.students enable row level security;
alter table public.profiles force row level security;
alter table public.enquiries force row level security;
alter table public.students force row level security;

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
    where id = auth.uid()
      and role = 'staff'
  );
$$;

revoke all on function private.is_staff() from public;
grant execute on function private.is_staff() to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.email, ''),
    'parent'
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
revoke execute on function public.protect_profile_role() from public, anon, authenticated;

create policy "profiles_select_own_or_staff"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid() or private.is_staff());

create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "enquiries_insert_public"
  on public.enquiries
  for insert
  to anon, authenticated
  with check (user_id is null or user_id = auth.uid());

create policy "enquiries_select_own_or_staff"
  on public.enquiries
  for select
  to authenticated
  using (user_id = auth.uid() or private.is_staff());

create policy "enquiries_update_staff"
  on public.enquiries
  for update
  to authenticated
  using (private.is_staff())
  with check (private.is_staff());

create policy "students_select_own_or_staff"
  on public.students
  for select
  to authenticated
  using (parent_id = auth.uid() or private.is_staff());

create policy "students_insert_own"
  on public.students
  for insert
  to authenticated
  with check (parent_id = auth.uid() or private.is_staff());

create policy "students_update_own_or_staff"
  on public.students
  for update
  to authenticated
  using (parent_id = auth.uid() or private.is_staff())
  with check (parent_id = auth.uid() or private.is_staff());

create policy "students_delete_own_or_staff"
  on public.students
  for delete
  to authenticated
  using (parent_id = auth.uid() or private.is_staff());

grant usage on schema public to anon, authenticated;
grant select, update on table public.profiles to authenticated;
grant insert on table public.enquiries to anon, authenticated;
grant select, update on table public.enquiries to authenticated;
grant select, insert, update, delete on table public.students to authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;
