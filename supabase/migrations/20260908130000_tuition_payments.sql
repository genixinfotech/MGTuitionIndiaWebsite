-- Track region-specific gateway checkouts (Stripe for GCC; Razorpay later for India).

create type public.tuition_payment_provider as enum ('stripe', 'razorpay', 'manual');
create type public.tuition_payment_status as enum ('pending', 'paid', 'failed', 'cancelled');

create table public.tuition_payments (
  id bigint generated always as identity primary key,
  student_id bigint not null references public.students (id) on delete cascade,
  parent_id uuid not null references public.profiles (id) on delete cascade,
  provider public.tuition_payment_provider not null,
  status public.tuition_payment_status not null default 'pending',
  amount integer not null,
  currency text not null,
  subjects jsonb not null default '[]'::jsonb,
  renewal boolean not null default false,
  provider_session_id text,
  provider_payment_id text,
  receipt_url text,
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  unique (provider, provider_session_id)
);

create index tuition_payments_student_id_idx on public.tuition_payments (student_id);
create index tuition_payments_parent_id_idx on public.tuition_payments (parent_id);
create index tuition_payments_status_idx on public.tuition_payments (status);

alter table public.tuition_payments enable row level security;
alter table public.tuition_payments force row level security;

create policy "tuition_payments_select_own_or_staff"
  on public.tuition_payments
  for select
  to authenticated
  using (
    parent_id = (select auth.uid())
    or private.is_staff_or_consultant()
  );

grant select on table public.tuition_payments to authenticated;
