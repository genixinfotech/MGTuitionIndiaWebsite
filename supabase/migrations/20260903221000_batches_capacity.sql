-- Follow-up for databases that already ran an earlier 20260903220000_batches.sql.
-- Adds student capacity columns and repoints quality_manager_id to quality_managers when needed.

alter table public.batches
  add column if not exists min_students smallint,
  add column if not exists max_students smallint;

update public.batches
set
  min_students = coalesce(min_students, 6),
  max_students = coalesce(max_students, 8)
where min_students is null
   or max_students is null;

alter table public.batches
  alter column min_students set default 6,
  alter column max_students set default 8;

alter table public.batches
  alter column min_students set not null,
  alter column max_students set not null;

alter table public.batches
  drop constraint if exists batches_min_students_check;

alter table public.batches
  add constraint batches_min_students_check check (min_students > 0);

alter table public.batches
  drop constraint if exists batches_max_students_check;

alter table public.batches
  add constraint batches_max_students_check check (max_students >= min_students);

-- Ensure QM rows exist before repointing the foreign key.
insert into public.quality_managers (id, created_at, updated_at)
select p.id, p.created_at, p.updated_at
from public.profiles p
where p.id in (
  select distinct b.quality_manager_id
  from public.batches b
)
on conflict (id) do nothing;

do $$
declare
  fk_name text;
begin
  if not exists (
    select 1
    from pg_class
    where relname = 'quality_managers'
      and relnamespace = 'public'::regnamespace
  ) then
    return;
  end if;

  select con.conname
  into fk_name
  from pg_constraint con
  join pg_class rel on rel.oid = con.conrelid
  join pg_attribute att on att.attrelid = con.conrelid and att.attnum = any (con.conkey)
  join pg_class frel on frel.oid = con.confrelid
  where rel.relname = 'batches'
    and rel.relnamespace = 'public'::regnamespace
    and att.attname = 'quality_manager_id'
    and con.contype = 'f'
    and frel.relname = 'profiles';

  if fk_name is not null then
    execute format('alter table public.batches drop constraint %I', fk_name);
    alter table public.batches
      add constraint batches_quality_manager_id_fkey
      foreign key (quality_manager_id)
      references public.quality_managers (id)
      on delete restrict;
  end if;
end $$;
