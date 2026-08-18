alter table public.students
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists school_name text;
