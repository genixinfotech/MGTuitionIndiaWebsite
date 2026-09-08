-- Dedicated quality_managers table (one row per QM account, linked to auth profile).

create table public.quality_managers (
  id uuid primary key references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index quality_managers_created_at_idx
  on public.quality_managers (created_at desc);

alter table public.quality_managers enable row level security;
alter table public.quality_managers force row level security;

insert into public.quality_managers (id, created_at, updated_at)
select id, created_at, updated_at
from public.profiles
where role::text = 'quality-manager'
on conflict (id) do nothing;

create or replace function public.sync_quality_manager_record()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role::text = 'quality-manager' then
    insert into public.quality_managers (id, created_at, updated_at)
    values (new.id, coalesce(new.created_at, now()), coalesce(new.updated_at, now()))
    on conflict (id) do update set updated_at = now();
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_sync_quality_manager_record on public.profiles;

create trigger profiles_sync_quality_manager_record
  after insert or update of role on public.profiles
  for each row
  execute function public.sync_quality_manager_record();

create or replace function private.is_quality_manager()
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
      and role::text = 'quality-manager'
  );
$$;

create policy "quality_managers_select_own_or_staff"
  on public.quality_managers
  for select
  to authenticated
  using (id = (select auth.uid()) or private.is_staff_or_consultant());

grant select on table public.quality_managers to authenticated;

revoke execute on function public.sync_quality_manager_record() from public, anon, authenticated;
revoke all on function private.is_quality_manager() from public;
grant execute on function private.is_quality_manager() to authenticated;
