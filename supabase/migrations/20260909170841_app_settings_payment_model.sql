-- Superadmin payment model: one-time (current) vs Stripe subscription (GCC).
-- India stays on the current UPI flow until Razorpay is added.

create or replace function private.is_superadmin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role::text = 'superadmin'
  );
$$;

revoke all on function private.is_superadmin() from public;
grant execute on function private.is_superadmin() to authenticated;

create table if not exists public.app_settings (
  id smallint primary key default 1 check (id = 1),
  payment_model text not null default 'one_time'
    check (payment_model in ('one_time', 'subscription')),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null
);

alter table public.tuition_payments
  add column if not exists provider_subscription_id text;

create index if not exists tuition_payments_subscription_id_idx
  on public.tuition_payments (provider_subscription_id);

insert into public.app_settings (id, payment_model)
values (1, 'one_time')
on conflict (id) do nothing;

create trigger app_settings_set_updated_at
  before update on public.app_settings
  for each row
  execute function public.set_updated_at();

alter table public.app_settings enable row level security;
alter table public.app_settings force row level security;

create policy "app_settings_select_staff"
  on public.app_settings
  for select
  to authenticated
  using (private.is_staff());

create policy "app_settings_update_superadmin"
  on public.app_settings
  for update
  to authenticated
  using (private.is_superadmin())
  with check (private.is_superadmin());

grant select, update on table public.app_settings to authenticated;
