-- Balance snapshots over time, powering trend charts. Polymorphic reference
-- to accounts/debts (no FK, since source_id can point to either table).
create table public.balance_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  source_type text not null check (source_type in ('account', 'debt')),
  source_id uuid not null,
  balance numeric(12, 2) not null,
  recorded_at timestamptz not null default now()
);

create index idx_balance_history_user_recorded on public.balance_history (user_id, recorded_at);

alter table public.balance_history enable row level security;

create policy "Users can view own balance history"
  on public.balance_history for select
  using (auth.uid() = user_id);

create policy "Admins can view all balance history"
  on public.balance_history for select
  using (public.is_admin());

create policy "Users can insert own balance history"
  on public.balance_history for insert
  with check (auth.uid() = user_id);
