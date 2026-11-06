-- ============================================================================
-- Track Lab Phase B: athlete portal (access codes, readiness, code-checked RPCs)
-- ----------------------------------------------------------------------------
-- DO NOT RUN before 20261106120000_track_coach_only_rls.sql (needs
-- track_is_coach()). Touches only new track_* objects; no existing rows change.
--
-- Athletes never query tables. They call SECURITY DEFINER functions with their
-- 8-character code; only a bcrypt hash of the code is stored (pgcrypto).
-- Weeks run Saturday-Friday in Africa/Cairo time.
-- ============================================================================

begin;

create extension if not exists pgcrypto with schema extensions;

-- 1. Tables --------------------------------------------------------------------
create table if not exists public.track_athlete_codes (
  athlete_id text primary key references public.track_athletes(id) on delete cascade,
  code_hash text not null,
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);

create table if not exists public.track_readiness (
  id bigint generated always as identity primary key,
  athlete_id text not null references public.track_athletes(id) on delete cascade,
  date date not null,
  sleep smallint check (sleep between 1 and 5),
  soreness smallint check (soreness between 1 and 5),
  ankle_pain smallint check (ankle_pain between 0 and 10),
  hamstring_pain smallint check (hamstring_pain between 0 and 10),
  cmj_cm numeric(5,1) check (cmj_cm > 0 and cmj_cm < 120),
  sprint_test text check (sprint_test in ('10m', 'fly20', 'other')),
  sprint_time_s numeric(5,2) check (sprint_time_s > 0 and sprint_time_s < 60),
  session_rpe smallint check (session_rpe between 0 and 10),
  session_minutes smallint check (session_minutes between 0 and 600),
  athlete_note text check (char_length(athlete_note) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (athlete_id, date)
);
create index if not exists idx_track_readiness_athlete_date on public.track_readiness(athlete_id, date);

-- wrong-code tracking for rate limiting
create table if not exists public.track_code_attempts (
  id bigint generated always as identity primary key,
  client text not null,
  attempted_at timestamptz not null default now()
);
create index if not exists idx_track_code_attempts_client on public.track_code_attempts(client, attempted_at);

-- 2. RLS: coach-only on the new tables, nothing for anon -------------------------
do $$
declare t text;
begin
  foreach t in array array['track_athlete_codes', 'track_readiness', 'track_code_attempts'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon', t);
  end loop;
end $$;

create policy "Coach full access to track_readiness" on public.track_readiness
  for all to authenticated using (public.track_is_coach()) with check (public.track_is_coach());
grant select, insert, update, delete on public.track_readiness to authenticated;
-- codes and attempts: no policies at all (only the functions below touch them)
revoke all on public.track_athlete_codes from authenticated;
revoke all on public.track_code_attempts from authenticated;

-- 3. Helpers (internal, not callable by anon) -------------------------------------
create or replace function public.track_cairo_today()
returns date language sql stable as $$
  select (now() at time zone 'Africa/Cairo')::date;
$$;

-- Saturday of the week that contains d (weeks run Saturday-Friday)
create or replace function public.track_week_start(d date)
returns date language sql immutable as $$
  select d - ((extract(dow from d)::int + 1) % 7);
$$;

create or replace function public.track_normalize_code(p_code text)
returns text language sql immutable as $$
  select upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
$$;

-- Resolve a code to an athlete id. Wrong codes are logged and delayed; after 10
-- wrong codes from one client in 15 minutes every attempt is refused.
create or replace function public.track_resolve_code(p_code text)
returns text
language plpgsql
volatile
security definer
set search_path = public, extensions
as $$
declare
  v_code text := public.track_normalize_code(p_code);
  v_client text := coalesce(
    split_part(coalesce(current_setting('request.headers', true)::json ->> 'x-forwarded-for', ''), ',', 1),
    ''
  );
  v_failures int;
  r record;
begin
  if v_client = '' then v_client := 'unknown'; end if;

  delete from public.track_code_attempts where attempted_at < now() - interval '1 day';
  select count(*) into v_failures from public.track_code_attempts
    where client = v_client and attempted_at > now() - interval '15 minutes';
  if v_failures >= 10 then
    return 'RATE_LIMITED';
  end if;

  if length(v_code) = 8 then
    for r in select athlete_id, code_hash from public.track_athlete_codes loop
      if r.code_hash = crypt(v_code, r.code_hash) then
        update public.track_athlete_codes set last_used_at = now() where athlete_id = r.athlete_id;
        return r.athlete_id;
      end if;
    end loop;
  end if;

  insert into public.track_code_attempts (client) values (v_client);
  perform pg_sleep(1);
  return null;
end $$;

-- 4. Coach: generate / reset a code (returned once, only the hash is stored) ------
create or replace function public.track_set_athlete_code(p_athlete_id text)
returns text
language plpgsql
volatile
security definer
set search_path = public, extensions
as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- no 0/O, 1/I
  v_code text := '';
  v_bytes bytea := gen_random_bytes(8);
  i int;
begin
  if not public.track_is_coach() then
    raise exception 'Only the coach can set athlete codes.' using errcode = '42501';
  end if;
  if not exists (select 1 from public.track_athletes where id = p_athlete_id) then
    raise exception 'Athlete not found.';
  end if;
  for i in 0..7 loop
    v_code := v_code || substr(alphabet, (get_byte(v_bytes, i) % 32) + 1, 1);
  end loop;
  insert into public.track_athlete_codes (athlete_id, code_hash, created_at, last_used_at)
    values (p_athlete_id, crypt(v_code, gen_salt('bf', 8)), now(), null)
    on conflict (athlete_id) do update
      set code_hash = excluded.code_hash, created_at = now(), last_used_at = null;
  return v_code;
end $$;

create or replace function public.track_athlete_code_status(p_athlete_id text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select case when not public.track_is_coach() then null else
    coalesce(
      (select jsonb_build_object('has_code', true, 'created_at', created_at, 'last_used_at', last_used_at)
         from public.track_athlete_codes where athlete_id = p_athlete_id),
      jsonb_build_object('has_code', false)
    ) end;
$$;

-- 5. Athlete RPCs (anon may call these; each checks the code) --------------------
create or replace function public.get_my_profile(p_code text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare v_id text := public.track_resolve_code(p_code); a public.track_athletes;
begin
  if v_id = 'RATE_LIMITED' then return jsonb_build_object('ok', false, 'error', 'rate_limited'); end if;
  if v_id is null then return jsonb_build_object('ok', false, 'error', 'invalid_code'); end if;
  select * into a from public.track_athletes where id = v_id;
  return jsonb_build_object(
    'ok', true,
    -- the athlete's own body weight and 1RMs, so the gym timer can show kg
    'athlete', jsonb_build_object(
      'id', v_id, 'name', a.name, 'weight', a.weight,
      'fullSquat', a.full_squat, 'halfSquat', a.half_squat, 'quarterSquat', a.quarter_squat,
      'clean', a.clean, 'bench', a.bench, 'deadlift', a.deadlift),
    'today', public.track_cairo_today(),
    'current_week_start', public.track_week_start(public.track_cairo_today())
  );
end $$;

-- Workouts of one week, never after the end of the current week (Cairo time).
create or replace function public.get_my_week(p_code text, p_week_start date)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_id text := public.track_resolve_code(p_code);
  v_start date := public.track_week_start(p_week_start);
  v_limit date := public.track_week_start(public.track_cairo_today()) + 6;
  v_rows jsonb;
begin
  if v_id = 'RATE_LIMITED' then return jsonb_build_object('ok', false, 'error', 'rate_limited'); end if;
  if v_id is null then return jsonb_build_object('ok', false, 'error', 'invalid_code'); end if;
  if v_start > v_limit then
    return jsonb_build_object('ok', true, 'week_start', v_start, 'workouts', '[]'::jsonb);
  end if;
  select coalesce(jsonb_agg(jsonb_build_object(
           'workout_date', w.workout_date,
           'workout_title', w.workout_title,
           'drills', w.drills) order by w.workout_date), '[]'::jsonb)
    into v_rows
    from public.track_athlete_workouts w
   where w.athlete_id = v_id
     and w.workout_date between v_start and least(v_start + 6, v_limit);
  return jsonb_build_object('ok', true, 'week_start', v_start, 'workouts', v_rows);
end $$;

-- Insert or update the athlete's own check-in for today or yesterday (Cairo).
-- Null arguments keep the stored value, so the gym timer can send only RPE,
-- minutes and a note.
create or replace function public.submit_checkin(
  p_code text,
  p_date date,
  p_sleep int default null,
  p_soreness int default null,
  p_ankle_pain int default null,
  p_hamstring_pain int default null,
  p_cmj_cm numeric default null,
  p_sprint_test text default null,
  p_sprint_time_s numeric default null,
  p_session_rpe int default null,
  p_session_minutes int default null,
  p_athlete_note text default null
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_id text := public.track_resolve_code(p_code);
  v_today date := public.track_cairo_today();
  v_row public.track_readiness;
begin
  if v_id = 'RATE_LIMITED' then return jsonb_build_object('ok', false, 'error', 'rate_limited'); end if;
  if v_id is null then return jsonb_build_object('ok', false, 'error', 'invalid_code'); end if;
  if p_date is null or p_date not in (v_today, v_today - 1) then
    return jsonb_build_object('ok', false, 'error', 'date_not_allowed');
  end if;

  insert into public.track_readiness as r (
    athlete_id, date, sleep, soreness, ankle_pain, hamstring_pain, cmj_cm,
    sprint_test, sprint_time_s, session_rpe, session_minutes, athlete_note
  ) values (
    v_id, p_date, p_sleep, p_soreness, p_ankle_pain, p_hamstring_pain, p_cmj_cm,
    p_sprint_test, p_sprint_time_s, p_session_rpe, p_session_minutes, nullif(trim(p_athlete_note), '')
  )
  on conflict (athlete_id, date) do update set
    sleep = coalesce(excluded.sleep, r.sleep),
    soreness = coalesce(excluded.soreness, r.soreness),
    ankle_pain = coalesce(excluded.ankle_pain, r.ankle_pain),
    hamstring_pain = coalesce(excluded.hamstring_pain, r.hamstring_pain),
    cmj_cm = coalesce(excluded.cmj_cm, r.cmj_cm),
    sprint_test = coalesce(excluded.sprint_test, r.sprint_test),
    sprint_time_s = coalesce(excluded.sprint_time_s, r.sprint_time_s),
    session_rpe = coalesce(excluded.session_rpe, r.session_rpe),
    session_minutes = coalesce(excluded.session_minutes, r.session_minutes),
    athlete_note = coalesce(excluded.athlete_note, r.athlete_note),
    updated_at = now()
  returning * into v_row;

  return jsonb_build_object('ok', true, 'checkin', to_jsonb(v_row) - 'athlete_id' - 'id');
exception when check_violation then
  return jsonb_build_object('ok', false, 'error', 'value_out_of_range');
end $$;

create or replace function public.get_my_checkins(p_code text, p_from date, p_to date)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare v_id text := public.track_resolve_code(p_code); v_rows jsonb;
begin
  if v_id = 'RATE_LIMITED' then return jsonb_build_object('ok', false, 'error', 'rate_limited'); end if;
  if v_id is null then return jsonb_build_object('ok', false, 'error', 'invalid_code'); end if;
  select coalesce(jsonb_agg(to_jsonb(r) - 'athlete_id' - 'id' order by r.date), '[]'::jsonb)
    into v_rows
    from public.track_readiness r
   where r.athlete_id = v_id and r.date between p_from and least(p_to, public.track_cairo_today());
  return jsonb_build_object('ok', true, 'checkins', v_rows);
end $$;

-- 6. Execute permissions --------------------------------------------------------
revoke all on function public.track_resolve_code(text) from public, anon, authenticated;
revoke all on function public.track_cairo_today() from public, anon;
revoke all on function public.track_week_start(date) from public, anon;
revoke all on function public.track_normalize_code(text) from public, anon;
revoke all on function public.track_set_athlete_code(text) from public, anon;
revoke all on function public.track_athlete_code_status(text) from public, anon;
grant execute on function public.track_set_athlete_code(text) to authenticated;
grant execute on function public.track_athlete_code_status(text) to authenticated;
grant execute on function public.track_cairo_today() to authenticated;
grant execute on function public.track_week_start(date) to authenticated;

revoke all on function public.get_my_profile(text) from public;
revoke all on function public.get_my_week(text, date) from public;
revoke all on function public.submit_checkin(text, date, int, int, int, int, numeric, text, numeric, int, int, text) from public;
revoke all on function public.get_my_checkins(text, date, date) from public;
grant execute on function public.get_my_profile(text) to anon, authenticated;
grant execute on function public.get_my_week(text, date) to anon, authenticated;
grant execute on function public.submit_checkin(text, date, int, int, int, int, numeric, text, numeric, int, int, text) to anon, authenticated;
grant execute on function public.get_my_checkins(text, date, date) to anon, authenticated;

commit;

-- Rollback: drop the functions above, then
--   drop table public.track_code_attempts; drop table public.track_athlete_codes;
--   drop table public.track_readiness;  (only if no readiness data needs keeping)
