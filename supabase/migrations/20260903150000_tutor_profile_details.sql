-- Tutor professional profile: bank, PAN, specializations, experience, qualifications.

create type public.tutor_verification_status as enum ('pending', 'verified', 'rejected');

create table public.tutor_bank_details (
  tutor_id uuid primary key references public.tutors (id) on delete cascade,
  bank_name text,
  account_holder_name text,
  account_number text,
  ifsc_code text,
  branch text,
  verification_status public.tutor_verification_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tutor_pan_details (
  tutor_id uuid primary key references public.tutors (id) on delete cascade,
  name_on_pan text,
  date_of_birth date,
  pan_number text,
  verification_status public.tutor_verification_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tutor_specializations (
  id bigint generated always as identity primary key,
  tutor_id uuid not null references public.tutors (id) on delete cascade,
  subject text not null,
  grade_range text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tutor_teaching_experience (
  id bigint generated always as identity primary key,
  tutor_id uuid not null references public.tutors (id) on delete cascade,
  organization text not null,
  role_title text not null,
  start_date date,
  end_date date,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date is null or start_date is null or end_date >= start_date)
);

create table public.tutor_qualifications (
  id bigint generated always as identity primary key,
  tutor_id uuid not null references public.tutors (id) on delete cascade,
  degree_title text not null,
  institution text not null,
  year_from smallint,
  year_to smallint,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (year_to is null or year_from is null or year_to >= year_from)
);

create index tutor_specializations_tutor_id_idx on public.tutor_specializations (tutor_id, sort_order);
create index tutor_teaching_experience_tutor_id_idx on public.tutor_teaching_experience (tutor_id, sort_order);
create index tutor_qualifications_tutor_id_idx on public.tutor_qualifications (tutor_id, sort_order);

create trigger tutor_bank_details_set_updated_at
  before update on public.tutor_bank_details
  for each row execute function public.set_updated_at();

create trigger tutor_pan_details_set_updated_at
  before update on public.tutor_pan_details
  for each row execute function public.set_updated_at();

create trigger tutor_specializations_set_updated_at
  before update on public.tutor_specializations
  for each row execute function public.set_updated_at();

create trigger tutor_teaching_experience_set_updated_at
  before update on public.tutor_teaching_experience
  for each row execute function public.set_updated_at();

create trigger tutor_qualifications_set_updated_at
  before update on public.tutor_qualifications
  for each row execute function public.set_updated_at();

create or replace function public.tutor_verification_reset_on_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not private.is_staff_or_consultant() then
    new.verification_status := 'pending';
  end if;
  return new;
end;
$$;

create trigger tutor_bank_details_reset_verification
  before update on public.tutor_bank_details
  for each row
  when (
    old.bank_name is distinct from new.bank_name
    or old.account_holder_name is distinct from new.account_holder_name
    or old.account_number is distinct from new.account_number
    or old.ifsc_code is distinct from new.ifsc_code
    or old.branch is distinct from new.branch
  )
  execute function public.tutor_verification_reset_on_change();

create trigger tutor_pan_details_reset_verification
  before update on public.tutor_pan_details
  for each row
  when (
    old.name_on_pan is distinct from new.name_on_pan
    or old.date_of_birth is distinct from new.date_of_birth
    or old.pan_number is distinct from new.pan_number
  )
  execute function public.tutor_verification_reset_on_change();

alter table public.tutor_bank_details enable row level security;
alter table public.tutor_pan_details enable row level security;
alter table public.tutor_specializations enable row level security;
alter table public.tutor_teaching_experience enable row level security;
alter table public.tutor_qualifications enable row level security;

alter table public.tutor_bank_details force row level security;
alter table public.tutor_pan_details force row level security;
alter table public.tutor_specializations force row level security;
alter table public.tutor_teaching_experience force row level security;
alter table public.tutor_qualifications force row level security;

-- Bank details
create policy "tutor_bank_details_select"
  on public.tutor_bank_details for select to authenticated
  using (tutor_id = (select auth.uid()) or private.is_staff_or_consultant());

create policy "tutor_bank_details_insert_own"
  on public.tutor_bank_details for insert to authenticated
  with check (tutor_id = (select auth.uid()));

create policy "tutor_bank_details_update_own"
  on public.tutor_bank_details for update to authenticated
  using (tutor_id = (select auth.uid()))
  with check (tutor_id = (select auth.uid()));

create policy "tutor_bank_details_update_staff"
  on public.tutor_bank_details for update to authenticated
  using (private.is_staff_or_consultant())
  with check (private.is_staff_or_consultant());

-- PAN details
create policy "tutor_pan_details_select"
  on public.tutor_pan_details for select to authenticated
  using (tutor_id = (select auth.uid()) or private.is_staff_or_consultant());

create policy "tutor_pan_details_insert_own"
  on public.tutor_pan_details for insert to authenticated
  with check (tutor_id = (select auth.uid()));

create policy "tutor_pan_details_update_own"
  on public.tutor_pan_details for update to authenticated
  using (tutor_id = (select auth.uid()))
  with check (tutor_id = (select auth.uid()));

create policy "tutor_pan_details_update_staff"
  on public.tutor_pan_details for update to authenticated
  using (private.is_staff_or_consultant())
  with check (private.is_staff_or_consultant());

-- Specializations
create policy "tutor_specializations_select"
  on public.tutor_specializations for select to authenticated
  using (tutor_id = (select auth.uid()) or private.is_staff_or_consultant());

create policy "tutor_specializations_insert_own"
  on public.tutor_specializations for insert to authenticated
  with check (tutor_id = (select auth.uid()));

create policy "tutor_specializations_update_own"
  on public.tutor_specializations for update to authenticated
  using (tutor_id = (select auth.uid()))
  with check (tutor_id = (select auth.uid()));

create policy "tutor_specializations_delete_own"
  on public.tutor_specializations for delete to authenticated
  using (tutor_id = (select auth.uid()));

-- Teaching experience
create policy "tutor_teaching_experience_select"
  on public.tutor_teaching_experience for select to authenticated
  using (tutor_id = (select auth.uid()) or private.is_staff_or_consultant());

create policy "tutor_teaching_experience_insert_own"
  on public.tutor_teaching_experience for insert to authenticated
  with check (tutor_id = (select auth.uid()));

create policy "tutor_teaching_experience_update_own"
  on public.tutor_teaching_experience for update to authenticated
  using (tutor_id = (select auth.uid()))
  with check (tutor_id = (select auth.uid()));

create policy "tutor_teaching_experience_delete_own"
  on public.tutor_teaching_experience for delete to authenticated
  using (tutor_id = (select auth.uid()));

-- Qualifications
create policy "tutor_qualifications_select"
  on public.tutor_qualifications for select to authenticated
  using (tutor_id = (select auth.uid()) or private.is_staff_or_consultant());

create policy "tutor_qualifications_insert_own"
  on public.tutor_qualifications for insert to authenticated
  with check (tutor_id = (select auth.uid()));

create policy "tutor_qualifications_update_own"
  on public.tutor_qualifications for update to authenticated
  using (tutor_id = (select auth.uid()))
  with check (tutor_id = (select auth.uid()));

create policy "tutor_qualifications_delete_own"
  on public.tutor_qualifications for delete to authenticated
  using (tutor_id = (select auth.uid()));

grant select, insert, update, delete on table public.tutor_bank_details to authenticated;
grant select, insert, update, delete on table public.tutor_pan_details to authenticated;
grant select, insert, update, delete on table public.tutor_specializations to authenticated;
grant select, insert, update, delete on table public.tutor_teaching_experience to authenticated;
grant select, insert, update, delete on table public.tutor_qualifications to authenticated;

grant usage, select on all sequences in schema public to authenticated;
