-- Dedicated parents table (one row per parent account, linked to auth profile).

create table public.parents (
  id uuid primary key references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index parents_created_at_idx on public.parents (created_at desc);

alter table public.parents enable row level security;
alter table public.parents force row level security;

insert into public.parents (id, created_at, updated_at)
select id, created_at, updated_at
from public.profiles
where role::text = 'parent'
on conflict (id) do nothing;

create or replace function public.sync_parent_record()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role::text = 'parent' then
    insert into public.parents (id, created_at, updated_at)
    values (new.id, coalesce(new.created_at, now()), coalesce(new.updated_at, now()))
    on conflict (id) do update set updated_at = now();
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_sync_parent_record on public.profiles;

create trigger profiles_sync_parent_record
  after insert or update of role on public.profiles
  for each row
  execute function public.sync_parent_record();

create policy "parents_select_own_or_staff"
  on public.parents
  for select
  to authenticated
  using (id = (select auth.uid()) or private.is_staff_or_consultant());

grant select on table public.parents to authenticated;
