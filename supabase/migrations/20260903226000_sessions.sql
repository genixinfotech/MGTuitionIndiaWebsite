-- Per-student class sessions created when allocated to a batch.

create type public.session_status as enum ('scheduled', 'completed', 'cancelled');

create table public.sessions (
  id bigint generated always as identity primary key,
  batch_id bigint not null references public.batches (id) on delete cascade,
  student_id bigint not null references public.students (id) on delete cascade,
  session_date date not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status public.session_status not null default 'scheduled',
  attended boolean,
  recording_link text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (batch_id, student_id, session_date),
  check (recording_link is null or recording_link ~* '^https?://')
);

create index sessions_student_id_idx on public.sessions (student_id);
create index sessions_batch_id_idx on public.sessions (batch_id);
create index sessions_batch_date_idx on public.sessions (batch_id, session_date);
create index sessions_status_idx on public.sessions (status);
create index sessions_ends_at_idx on public.sessions (ends_at);

create trigger sessions_set_updated_at
  before update on public.sessions
  for each row execute function public.set_updated_at();

-- Mark past sessions as completed.
create or replace function public.refresh_session_statuses()
returns void
language sql
security definer
set search_path = public
as $$
  update public.sessions
  set status = 'completed'
  where status = 'scheduled'
    and ends_at < now();
$$;

revoke all on function public.refresh_session_statuses() from public;
grant execute on function public.refresh_session_statuses() to authenticated;

create or replace function private.can_read_session(session_row_id bigint)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.sessions s
    join public.students st on st.id = s.student_id
    where s.id = session_row_id
      and (
        st.user_id = (select auth.uid())
        or st.parent_id = (select auth.uid())
      )
  )
  or exists (
    select 1
    from public.sessions s
    where s.id = session_row_id
      and private.is_batch_tutor_or_qm(s.batch_id)
  )
  or private.is_staff();
$$;

create or replace function private.can_manage_session(session_row_id bigint)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.sessions s
    join public.batches b on b.id = s.batch_id
    where s.id = session_row_id
      and b.tutor_id = (select auth.uid())
  )
  or private.is_staff();
$$;

revoke all on function private.can_read_session(bigint) from public;
revoke all on function private.can_manage_session(bigint) from public;
grant execute on function private.can_read_session(bigint) to authenticated;
grant execute on function private.can_manage_session(bigint) to authenticated;

alter table public.sessions enable row level security;
alter table public.sessions force row level security;

create policy "sessions_select_reader"
  on public.sessions
  for select
  to authenticated
  using (private.can_read_session(id));

create policy "sessions_insert_staff"
  on public.sessions
  for insert
  to authenticated
  with check (private.is_staff());

create policy "sessions_update_tutor_or_staff"
  on public.sessions
  for update
  to authenticated
  using (private.can_manage_session(id))
  with check (private.can_manage_session(id));

create policy "sessions_delete_staff"
  on public.sessions
  for delete
  to authenticated
  using (private.is_staff());

grant select, insert, update, delete on table public.sessions to authenticated;
