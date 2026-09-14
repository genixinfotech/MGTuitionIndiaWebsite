-- Prorata checkout stores dollars/rupees with cents (e.g. 0.83), not whole units.

alter table public.tuition_payments
  alter column amount type numeric(10, 2) using amount::numeric(10, 2);

alter table public.admissions
  alter column amount type numeric(10, 2) using amount::numeric(10, 2);

alter table public.student_subjects
  alter column monthly_rate type numeric(10, 2) using monthly_rate::numeric(10, 2);
