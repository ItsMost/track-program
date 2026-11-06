# Coach login setup (do these in order)

Follow the steps in order so you never lock yourself out. Until step 6 the
tables stay open exactly as they are today, and the app keeps working the
whole time.

## 1. Create the coach account (Supabase dashboard)
1. Open https://supabase.com/dashboard/project/koakdlbwsjekmtiunfhr/auth/users
2. Click **Add user**, then **Create new user**.
3. Enter your coach email and a strong password, and tick **Auto Confirm User**.
4. Click **Create user**.

## 2. Stop anyone else from signing up
1. Open **Authentication → Sign In / Providers**.
2. Turn **Allow new users to sign up** off, then click **Save**.
   Other people could not see the data anyway: the policies only allow the
   account listed in `track_coaches`.

## 3. Deploy the new app version
1. Merge the PRs in order: #3, #4, #5, then the coach-login PR.
2. Wait for Vercel to finish deploying `main`.

## 4. Sign in on the live site
1. Open https://track-program.vercel.app. You should now see **Coach sign-in**.
2. Sign in with the account from step 1. The planner opens with all your data.
   If it doesn't, stop here and tell Claude. Nothing has been locked yet.

## 5. Finish anything that still uses the publishable key
The one-off notes translation script uses the publishable key, so run it
before step 6.

## 6. Lock the tables (run the migration)
1. Open `supabase/migrations/20261106120000_track_coach_only_rls.sql` and
   replace `COACH_EMAIL` with your coach email.
2. Open **SQL Editor → New query** in the Supabase dashboard, paste the whole
   file, and click **Run**.
   - If it says the email doesn't exist, nothing was changed. Fix the email
     or finish step 1 first.
3. Refresh the live site. You should still be signed in and see your data.

## 7. Prove the publishable key is blocked
From the project folder (needs `.env` or `.env.off`):

```bash
RUN_LIVE_RLS=1 npm run test:rls
```

All tests should pass: every SELECT, INSERT, UPDATE and DELETE with the
publishable key returns "permission denied".

As a second check, open the site in a private window. It shows **Coach
sign-in** and loads no data.

## If something goes wrong
- **Forgot the password:** open **Authentication → Users → … → Send password
  recovery**, or set a new password there.
- **Need the old open access back:** the rollback SQL is at the bottom of the
  migration file.
