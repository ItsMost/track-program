-- ============================================================================
-- Track Lab Phase C: readiness colours, coach Today page, athlete comments,
-- test history charts.
-- ----------------------------------------------------------------------------
-- Run after 20261106130000_track_athlete_portal.sql. Only track_* objects;
-- existing rows are kept (new columns start empty).
-- ============================================================================

begin;

-- 1. track_readiness: broad jump, Fly 30 test, "coach has read the comment" ------
alter table public.track_readiness
  add column if not exists broad_jump_m numeric(4,2) check (broad_jump_m > 0 and broad_jump_m < 5),
  add column if not exists coach_seen_at timestamptz;

do $$
declare c record;
begin
  -- replace the sprint_test check so it also allows 'fly30'
  for c in
    select conname from pg_constraint
     where conrelid = 'public.track_readiness'::regclass and contype = 'c'
       and pg_get_constraintdef(oid) ilike '%sprint_test%'
  loop
    execute format('alter table public.track_readiness drop constraint %I', c.conname);
  end loop;
  alter table public.track_readiness
    add constraint track_readiness_sprint_test_check
    check (sprint_test in ('10m', 'fly20', 'fly30', 'other'));
end $$;

-- 2. Coach colour override (one per athlete per day) -----------------------------
create table if not exists public.track_readiness_overrides (
  athlete_id text not null references public.track_athletes(id) on delete cascade,
  date date not null,
  color text not null check (color in ('green', 'yellow', 'red')),
  note text check (char_length(note) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (athlete_id, date)
);
alter table public.track_readiness_overrides enable row level security;
revoke all on public.track_readiness_overrides from anon;
create policy "Coach full access to track_readiness_overrides" on public.track_readiness_overrides
  for all to authenticated using (public.track_is_coach()) with check (public.track_is_coach());
grant select, insert, update, delete on public.track_readiness_overrides to authenticated;

-- 3. submit_checkin with broad jump; a new or changed note shows as "new" to the coach
drop function if exists public.submit_checkin(text, date, int, int, int, int, numeric, text, numeric, int, int, text);

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
  p_athlete_note text default null,
  p_broad_jump_m numeric default null
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
  v_note text := nullif(trim(p_athlete_note), '');
  v_row public.track_readiness;
begin
  if v_id = 'RATE_LIMITED' then return jsonb_build_object('ok', false, 'error', 'rate_limited'); end if;
  if v_id is null then return jsonb_build_object('ok', false, 'error', 'invalid_code'); end if;
  if p_date is null or p_date not in (v_today, v_today - 1) then
    return jsonb_build_object('ok', false, 'error', 'date_not_allowed');
  end if;

  insert into public.track_readiness as r (
    athlete_id, date, sleep, soreness, ankle_pain, hamstring_pain, cmj_cm,
    sprint_test, sprint_time_s, session_rpe, session_minutes, athlete_note, broad_jump_m
  ) values (
    v_id, p_date, p_sleep, p_soreness, p_ankle_pain, p_hamstring_pain, p_cmj_cm,
    p_sprint_test, p_sprint_time_s, p_session_rpe, p_session_minutes, v_note, p_broad_jump_m
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
    broad_jump_m = coalesce(excluded.broad_jump_m, r.broad_jump_m),
    athlete_note = coalesce(excluded.athlete_note, r.athlete_note),
    coach_seen_at = case
      when excluded.athlete_note is not null and excluded.athlete_note is distinct from r.athlete_note then null
      else r.coach_seen_at end,
    updated_at = now()
  returning * into v_row;

  return jsonb_build_object('ok', true, 'checkin', to_jsonb(v_row) - 'athlete_id' - 'id' - 'coach_seen_at');
exception when check_violation then
  return jsonb_build_object('ok', false, 'error', 'value_out_of_range');
end $$;

-- 4. Athlete's own test history (charts) -----------------------------------------
create or replace function public.get_my_history(p_code text, p_from date)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare v_id text := public.track_resolve_code(p_code); v_rows jsonb; a public.track_athletes;
begin
  if v_id = 'RATE_LIMITED' then return jsonb_build_object('ok', false, 'error', 'rate_limited'); end if;
  if v_id is null then return jsonb_build_object('ok', false, 'error', 'invalid_code'); end if;
  select coalesce(jsonb_agg(jsonb_build_object(
           'date', r.date, 'cmj_cm', r.cmj_cm, 'sprint_test', r.sprint_test,
           'sprint_time_s', r.sprint_time_s, 'broad_jump_m', r.broad_jump_m,
           'session_rpe', r.session_rpe, 'session_minutes', r.session_minutes) order by r.date), '[]'::jsonb)
    into v_rows
    from public.track_readiness r
   where r.athlete_id = v_id and r.date between coalesce(p_from, '1900-01-01') and public.track_cairo_today();
  select * into a from public.track_athletes where id = v_id;
  return jsonb_build_object(
    'ok', true,
    'checkins', v_rows,
    'profile', jsonb_build_object(
      'cmj', coalesce(a.cmj, a.vertical_jump), 'accel_10m', a.accel_10m,
      'fly_30m', a.fly_30m, 'broad_jump', coalesce(a.broad_jump, a.standing_long_jump))
  );
end $$;

-- 5. get_my_checkins no longer exposes coach_seen_at ------------------------------
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
  select coalesce(jsonb_agg(to_jsonb(r) - 'athlete_id' - 'id' - 'coach_seen_at' order by r.date), '[]'::jsonb)
    into v_rows
    from public.track_readiness r
   where r.athlete_id = v_id and r.date between p_from and least(p_to, public.track_cairo_today());
  return jsonb_build_object('ok', true, 'checkins', v_rows);
end $$;

-- 6. Permissions ---------------------------------------------------------------------
revoke all on function public.submit_checkin(text, date, int, int, int, int, numeric, text, numeric, int, int, text, numeric) from public;
revoke all on function public.get_my_history(text, date) from public;
grant execute on function public.submit_checkin(text, date, int, int, int, int, numeric, text, numeric, int, int, text, numeric) to anon, authenticated;
grant execute on function public.get_my_history(text, date) to anon, authenticated;

commit;
