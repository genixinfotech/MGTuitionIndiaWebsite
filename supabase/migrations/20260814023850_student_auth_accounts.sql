alter type public.app_role add value if not exists 'student';

alter table public.students
  add column if not exists email text,
  add column if not exists user_id uuid unique references auth.users (id) on delete set null;

create index if not exists students_user_id_idx on public.students (user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  assigned_role public.app_role := 'parent';
begin
  if new.raw_app_meta_data->>'role' = 'student' then
    assigned_role := 'student';
  end if;

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

drop policy if exists "students_select_own_or_staff" on public.students;

create policy "students_select_own_or_staff"
  on public.students
  for select
  to authenticated
  using (
    parent_id = auth.uid()
    or user_id = auth.uid()
    or private.is_staff()
  );
