-- Debts: Step 2 snowball. Ordering is computed at query time
-- (ORDER BY balance ASC WHERE include_in_snowball) rather than stored.
create table public.debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  balance numeric(12, 2) not null check (balance >= 0),
  min_payment numeric(12, 2) not null default 0,
  interest_rate numeric(5, 2) default 0,
  include_in_snowball boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.debts enable row level security;

create policy "Users can view own debts"
  on public.debts for select
  using (auth.uid() = user_id);

create policy "Admins can view all debts"
  on public.debts for select
  using (public.is_admin());

create policy "Users can manage own debts"
  on public.debts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Accounts: emergency fund, savings, investment, pension, other.
create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  type text not null check (type in ('emergency_fund', 'savings', 'investment', 'pension', 'other')),
  balance numeric(12, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.accounts enable row level security;

create policy "Users can view own accounts"
  on public.accounts for select
  using (auth.uid() = user_id);

create policy "Admins can view all accounts"
  on public.accounts for select
  using (public.is_admin());

create policy "Users can manage own accounts"
  on public.accounts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
