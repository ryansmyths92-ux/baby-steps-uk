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
