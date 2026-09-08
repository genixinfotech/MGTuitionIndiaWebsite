-- Allow student consultants and staff to create admission records when verifying payment.

create policy "admissions_insert_staff"
  on public.admissions
  for insert
  to authenticated
  with check (private.is_staff_or_consultant());
