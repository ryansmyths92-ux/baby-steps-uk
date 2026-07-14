-- Tracks whether a user has completed the onboarding wizard.
alter table public.profiles add column onboarded_at timestamptz;
