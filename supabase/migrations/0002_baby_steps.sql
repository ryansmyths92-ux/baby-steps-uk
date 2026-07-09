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
