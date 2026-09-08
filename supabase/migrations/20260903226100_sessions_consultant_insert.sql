-- Allow student consultants to create sessions when recording tuition payments.

drop policy if exists "sessions_insert_staff" on public.sessions;

create policy "sessions_insert_staff_or_consultant"
  on public.sessions
  for insert
  to authenticated
  with check (private.is_staff_or_consultant());
