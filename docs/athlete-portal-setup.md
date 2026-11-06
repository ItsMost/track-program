# Athlete portal setup

The portal lives at **/athlete/**, for example https://track-program.vercel.app/athlete/.
Athletes sign in with an 8-character code. They never read tables directly:
every request goes through a code-checked database function.

## Order
1. Run the Phase A migration (`20261106120000_track_coach_only_rls.sql`)
   first. The portal functions use `track_is_coach()` from it.
2. Run `supabase/migrations/20261106130000_track_athlete_portal.sql` in
   **SQL Editor → New query → Run**. It only creates new `track_*` objects:
   - tables `track_athlete_codes`, `track_readiness` and `track_code_attempts`
   - the functions listed below

   No existing rows change.
3. Merge the athlete-portal PR and let Vercel deploy.

## Giving an athlete access
1. In the planner, open the athlete, then **View Athletic Metrics**, then
   **Athlete portal access**.
2. Click **Generate code**. The code is shown **once**. Click **Copy message
   with link and code** and send it to the athlete.
3. If the code leaks or the athlete changes phone, click **Reset code**. The
   old code stops working on every phone.

## What the athlete sees
- **Program:** this week and past weeks, read-only. Future weeks never show.
  A week runs Saturday to Friday, Cairo time.
- **Start session** on days with gym work. This opens the gym timer:
  - It goes set by set, and runs supersets back to back.
  - It counts down the rest from the exercise's Rest field. A rest like
    `2.5m / 3m` means rep rest / set rest.
  - It beeps and vibrates when rest ends, and keeps the screen on.
  - At the end it asks for session RPE and a "How did it feel?" note.
- **Check-in:** sleep, soreness, ankle and hamstring pain, CMJ, sprint test,
  session RPE, minutes and a note. It can be saved for today or yesterday only.
- **Add to Home Screen:**
  - iPhone: open /athlete/ in Safari, tap **Share**, then **Add to Home Screen**.
  - Android: open it in Chrome, tap **⋮**, then **Add to Home screen**.

## Security notes
- Only a bcrypt hash of each code is stored (pgcrypto).
- A wrong code waits 1 second before answering. After 10 wrong codes from
  one address in 15 minutes, every attempt is refused for 15 minutes.
- Athlete functions:

  | Function | Returns |
  |---|---|
  | `get_my_profile` | the athlete's name, weight and 1RMs |
  | `get_my_week` | that athlete's workouts, up to the end of the current week |
  | `submit_checkin` | inserts or updates their own row, today or yesterday only |
  | `get_my_checkins` | their own check-ins, up to today |

- Coach-only functions: `track_set_athlete_code` and
  `track_athlete_code_status`. Both check `track_is_coach()`.
