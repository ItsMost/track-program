-- ============================================================================
-- Track Lab: coach-only access to every track_* table
-- ----------------------------------------------------------------------------
-- DO NOT RUN until:
--   1. The coach account exists in Supabase Auth (see docs/coach-login-setup.md).
--   2. The new app version with the coach login is deployed and you can sign in.
--   3. COACH_EMAIL below is replaced with that account's email.
--   4. The one-off notes translation script has finished (it uses the anon key).
--
-- What it does (track_* tables only; no other app's tables are touched):
--   - creates track_coaches (which Auth users count as the coach)
--   - creates track_is_coach() used by every policy
--   - drops every existing policy on track_* tables (the "anonymous full
--     access" ones) and replaces them with coach-only policies
--   - enables RLS on track_workouts (it had RLS off)
--   - revokes all table privileges from anon, so the publishable key alone
--     cannot read or change anything
-- No rows in track_* tables are changed or deleted.
-- The whole script runs in one transaction: if any step fails, nothing changes.
-- ============================================================================

begin;

-- 1. Coach registry -----------------------------------------------------------
create table if not exists public.track_coaches (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.track_coaches enable row level security;
revoke all on public.track_coaches from anon, authenticated;

-- 2. Register the coach (guard: refuse to continue if the account is missing) --
do $$
declare
  coach_email constant text := 'COACH_EMAIL';  -- <-- replace with your coach login email
  coach_id uuid;
begin
  if coach_email = 'COACH_EMAIL' then
    raise exception 'Replace COACH_EMAIL with the coach account email before running.';
  end if;
  select id into coach_id from auth.users where lower(email) = lower(coach_email);
  if coach_id is null then
    raise exception 'No Supabase Auth user with email %. Create the coach account first.', coach_email;
  end if;
  insert into public.track_coaches (user_id) values (coach_id) on conflict do nothing;
end $$;

-- 3. Helper used by the policies ----------------------------------------------
create or replace function public.track_is_coach()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.track_coaches where user_id = auth.uid());
$$;
revoke all on function public.track_is_coach() from public, anon;
grant execute on function public.track_is_coach() to authenticated;

-- 4. Replace policies on every track_* data table ------------------------------
do $$
declare
  t text;
  p record;
  data_tables text[] := array[
    'track_athletes',
    'track_athlete_workouts',
    'track_library_drills',
    'track_week_templates',
    'track_macro_programs',
    'track_workouts'
  ];
begin
  foreach t in array data_tables loop
    -- drop existing policies (e.g. "Allow anonymous full access to ...")
    for p in select policyname from pg_policies where schemaname = 'public' and tablename = t loop
      execute format('drop policy %I on public.%I', p.policyname, t);
    end loop;

    execute format('alter table public.%I enable row level security', t);

    execute format(
      'create policy %I on public.%I for all to authenticated using (public.track_is_coach()) with check (public.track_is_coach())',
      'Coach full access to ' || t, t
    );

    -- the publishable / anon key gets no table privileges at all
    execute format('revoke all on public.%I from anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
  end loop;
end $$;

commit;

-- ============================================================================
-- Rollback (only if you need the old open access back):
--   begin;
--   do $$ declare t text; begin
--     foreach t in array array['track_athletes','track_athlete_workouts','track_library_drills',
--                              'track_week_templates','track_macro_programs','track_workouts'] loop
--       execute format('drop policy if exists %I on public.%I', 'Coach full access to ' || t, t);
--       execute format('grant select, insert, update, delete on public.%I to anon', t);
--       execute format('create policy %I on public.%I for all using (true) with check (true)',
--                      'Allow anonymous full access to ' || t, t);
--     end loop; end $$;
--   commit;
-- ============================================================================
