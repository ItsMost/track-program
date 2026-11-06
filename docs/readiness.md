# Readiness colours, Today page and test history

## Tuning the colours
All thresholds are in `src/data/readinessRules.js` (`READINESS_RULES`).

- **Baseline:** the average of the athlete's last 4 values before that day.
  With fewer than 3 earlier check-ins the colour is **Baseline** (grey).
  The reasons, for example pain, are still listed.
- **Green:** CMJ and sprint are at baseline or better, soreness ≤ 3 and pain < 3.
  - CMJ down 0–5% still counts as "at baseline".
  - Sprint up to 2% slower still counts as "at baseline".
- **Yellow:** any one of these:
  - CMJ down 5–10%
  - sprint 2–3% slower
  - soreness 4–5
- **Red:** any one of these:
  - CMJ down more than 10%
  - ankle or hamstring pain ≥ 3
  - sprint more than 3% slower

  Red wins over yellow.
- **Sprint comparisons:** a sprint is compared only with earlier results of
  the same test (10 m, Fly 20, Fly 30, Other).
- **sRPE:** RPE × minutes (AU). The weekly sRPE adds up Saturday to Friday.

## Coach
- **Today** (heart icon in the left bar) shows every athlete for one day:
  - The colour and the reason, for example "CMJ -8%".
  - The full check-in.
  - sRPE today and this week.
  - The athlete's comment, marked **New** until you click **Mark read**.
  - It's sorted red → yellow → baseline → green → no check-in.
- **Override colour:** sets green, yellow or red with a note for that day.
  "Auto" removes the override; the check-in itself is never deleted.
- **Planner week:**
  - Each day header shows the athlete's colour, the session sRPE and their
    comment, with a **New** marker.
  - The header shows the week's sRPE next to the training load.
- **Test history:** opens charts for CMJ, 10 m, flying 30 m (and flying 20 m
  if used), broad jump and weekly sRPE.
  - The shaded band is the athlete's own baseline: mean ± 1 SD of the last
    4 results.
  - The dashed line is the value in the athlete's profile.

## Athlete
- The **Progress** tab shows the same charts for their own data only. It
  reads them through `get_my_history(code)`, never from the tables directly.
- The **How did it feel?** box is in the check-in and at the end of the gym
  timer. A new or changed comment shows as **New** to the coach.

## Database
`supabase/migrations/20261106140000_track_readiness_dashboard.sql`
(run it after the athlete-portal migration):
- New columns on `track_readiness`:
  - `broad_jump_m`
  - `coach_seen_at`
  - `fly30` added as a sprint test
- New coach-only table `track_readiness_overrides`.
- `submit_checkin` now takes a broad jump value too, and resets "seen"
  when the note changes.
- New `get_my_history(code, from)` for the athlete's charts.
