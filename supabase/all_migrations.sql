-- ===== 0001_profiles.sql =====
-- Profiles: 1:1 with auth.users, carries role + currency.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  role text not null default 'client' check (role in ('client', 'admin')),
  currency text not null default 'GBP',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- SECURITY DEFINER so admin-role checks don't recurse into profiles' own RLS.
create function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin());

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Prevent users from granting themselves admin via the update policy above.
-- Server-side admin promotion uses the service role key, which bypasses RLS
-- and this trigger entirely.
create function public.prevent_role_self_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role <> old.role and auth.role() <> 'service_role' then
    raise exception 'Only an admin action can change a profile role.';
  end if;
  return new;
end;
$$;

create trigger trg_prevent_role_self_escalation
  before update on public.profiles
  for each row execute function public.prevent_role_self_escalation();

-- Auto-create a profile row when a new auth user signs up.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger trg_handle_new_user
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ===== 0002_baby_steps.sql =====
-- Static reference data: the 7 UK-adapted Baby Steps.
-- Keep in sync with src/lib/baby-steps.ts.
create table public.baby_steps (
  number smallint primary key check (number between 1 and 7),
  title text not null,
  description text not null
);

alter table public.baby_steps enable row level security;

create policy "Authenticated users can read baby steps"
  on public.baby_steps for select
  using (auth.role() = 'authenticated');

insert into public.baby_steps (number, title, description) values
  (1, '£1,000 starter emergency fund', 'Save a starter cushion before you attack debt, so a flat tyre doesn''t become a new credit card.'),
  (2, 'Debt snowball', 'Pay off all non-mortgage debt, smallest balance first. Student loans are excluded by default.'),
  (3, 'Full emergency fund', 'Build your emergency fund up to 3-6 months of essential expenses.'),
  (4, 'Invest 15% for retirement', 'Invest 15% of household income via your workplace pension and a SIPP or ISA top-up.'),
  (5, 'Children''s future fund', 'Save for your children''s future with a Junior ISA or Junior SIPP.'),
  (6, 'Pay off the mortgage early', 'Throw everything extra at your mortgage until it''s gone.'),
  (7, 'Build wealth and give', 'Grow your wealth and give generously - you''ve earned the freedom.');


-- ===== 0003_user_progress.sql =====
-- Per-user, per-step progress. The user's "current step" is derived in the
-- app as the lowest-numbered step that isn't complete, rather than stored
-- redundantly here.
create table public.user_progress (
  user_id uuid not null references public.profiles (id) on delete cascade,
  step_number smallint not null references public.baby_steps (number),
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'complete')),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, step_number)
);

alter table public.user_progress enable row level security;

create policy "Users can view own progress"
  on public.user_progress for select
  using (auth.uid() = user_id);

create policy "Admins can view all progress"
  on public.user_progress for select
  using (public.is_admin());

create policy "Users can insert own progress"
  on public.user_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update own progress"
  on public.user_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Seed all 7 steps as not_started for a new user, step 1 as in_progress.
create function public.handle_new_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_progress (user_id, step_number, status)
  select new.id, number, case when number = 1 then 'in_progress' else 'not_started' end
  from public.baby_steps;
  return new;
end;
$$;

create trigger trg_handle_new_profile
  after insert on public.profiles
  for each row execute function public.handle_new_profile();


-- ===== 0004_debts_accounts.sql =====
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


-- ===== 0005_balance_history.sql =====
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


-- ===== 0006_achievements.sql =====
-- Static achievement definitions + per-user unlocks.
create table public.achievements (
  code text primary key,
  title text not null,
  description text not null,
  icon text not null
);

alter table public.achievements enable row level security;

create policy "Authenticated users can read achievements"
  on public.achievements for select
  using (auth.role() = 'authenticated');

insert into public.achievements (code, title, description, icon) values
  ('first_pound_saved', 'First Steps', 'You started your Baby Steps journey.', '🌱'),
  ('step_1_complete', 'Emergency Ready', 'Completed Step 1: £1,000 starter emergency fund.', '🛟'),
  ('first_debt_paid', 'Snowball Started', 'Paid off your first debt.', '❄️'),
  ('debt_free', 'Debt Free', 'Completed Step 2: paid off all non-mortgage debt.', '🎉'),
  ('step_3_complete', 'Fully Funded', 'Built your full 3-6 month emergency fund.', '🏰'),
  ('step_4_complete', 'Future Secured', 'Investing 15% for retirement.', '📈'),
  ('step_5_complete', 'Legacy Builder', 'Started saving for your children''s future.', '🎓'),
  ('mortgage_free', 'Mortgage Free', 'Completed Step 6: paid off your mortgage.', '🏠'),
  ('step_7_complete', 'Wealth Builder', 'Reached Step 7: building wealth and giving generously.', '👑'),
  ('three_month_streak', 'Consistency Counts', 'Updated your balances 3 months running.', '🔥');

create table public.user_achievements (
  user_id uuid not null references public.profiles (id) on delete cascade,
  achievement_code text not null references public.achievements (code),
  unlocked_at timestamptz not null default now(),
  primary key (user_id, achievement_code)
);

alter table public.user_achievements enable row level security;

create policy "Users can view own achievements"
  on public.user_achievements for select
  using (auth.uid() = user_id);

create policy "Admins can view all user achievements"
  on public.user_achievements for select
  using (public.is_admin());

create policy "Users can insert own achievements"
  on public.user_achievements for insert
  with check (auth.uid() = user_id);


