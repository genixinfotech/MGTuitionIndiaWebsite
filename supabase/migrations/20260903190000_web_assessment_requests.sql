-- Website assessment requests from the public booking form (no account required).
-- One row per student + subject; separate from portal assessment_requests.

create table public.web_assessment_requests (
  id bigint generated always as identity primary key,
  parent_name text not null,
  student_name text not null,
  email text not null,
  phone text,
  board text not null,
  grade text not null,
  subject text not null,
  status public.assessment_status not null default 'new',
  assigned_expert_id uuid references public.profiles (id) on delete set null,
  notes text,
  referral text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index web_assessment_requests_created_at_idx
  on public.web_assessment_requests (created_at desc);

create index web_assessment_requests_status_idx
  on public.web_assessment_requests (status);

create index web_assessment_requests_email_idx
  on public.web_assessment_requests (email);

create index web_assessment_requests_assigned_expert_id_idx
  on public.web_assessment_requests (assigned_expert_id);

create unique index web_assessment_requests_one_open_per_student_subject
  on public.web_assessment_requests (email, student_name, subject)
  where status in ('new', 'contacted', 'scheduled');

create trigger web_assessment_requests_set_updated_at
  before update on public.web_assessment_requests
  for each row execute function public.set_updated_at();

alter table public.web_assessment_requests enable row level security;
alter table public.web_assessment_requests force row level security;

create policy "web_assessment_requests_select_ops_or_expert"
  on public.web_assessment_requests
  for select
  to authenticated
  using (
    private.is_staff_or_consultant()
    or assigned_expert_id = (select auth.uid())
  );

create policy "web_assessment_requests_update_ops"
  on public.web_assessment_requests
  for update
  to authenticated
  using (private.is_staff_or_consultant())
  with check (private.is_staff_or_consultant());

create policy "web_assessment_requests_update_assigned_expert"
  on public.web_assessment_requests
  for update
  to authenticated
  using (assigned_expert_id = (select auth.uid()))
  with check (assigned_expert_id = (select auth.uid()));

grant select, update on table public.web_assessment_requests to authenticated;
grant usage, select on all sequences in schema public to authenticated;
