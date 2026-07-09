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
