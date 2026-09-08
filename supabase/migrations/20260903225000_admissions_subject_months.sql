-- Track paid tuition months per subject and let students read their admission.

alter table public.admissions
  add column if not exists subject_months jsonb not null default '{}'::jsonb;

update public.admissions
set subject_months = (
  select coalesce(jsonb_object_agg(subject, 1), '{}'::jsonb)
  from jsonb_array_elements_text(subjects) as subject
)
where subject_months = '{}'::jsonb
  and jsonb_array_length(subjects) > 0;

create policy "admissions_select_student"
  on public.admissions
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.students s
      where s.id = student_id
        and s.user_id = (select auth.uid())
    )
  );
