// Proves the publishable (anon) key alone cannot read or change any track_* table.
// Talks to the LIVE project from .env (or .env.off). Run after the RLS migration:
//   npm run test:rls
//
// It never creates or changes data, even if access were open:
//  - SELECT only reads (limit 1)
//  - UPDATE / DELETE target an id that cannot exist
//  - INSERT uses an athlete_id that cannot exist, so an open table would reject it
//    with a foreign-key error instead of saving it
// After the migration every call must fail with "permission denied" (42501).
import fs from 'node:fs';
import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const envFile = ['.env', '.env.off'].find((f) => fs.existsSync(f));
const env = envFile
  ? Object.fromEntries(
      fs.readFileSync(envFile, 'utf8').split(/\r?\n/)
        .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
        .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
    )
  : {};
const anon = createClient(env.VITE_SUPABASE_URL || 'http://invalid', env.VITE_SUPABASE_ANON_KEY || 'none', {
  auth: { persistSession: false, autoRefreshToken: false },
});

const TABLES = ['track_athletes', 'track_athlete_workouts', 'track_library_drills', 'track_week_templates', 'track_macro_programs', 'track_workouts', 'track_coaches', 'track_readiness', 'track_athlete_codes', 'track_code_attempts'];
const IMPOSSIBLE_ID = '__rls_probe_does_not_exist__';
// An id that cannot exist, in each table's id type (text / bigint / uuid).
const PROBE = {
  track_week_templates: ['id', -1],
  track_workouts: ['id', -1],
  track_coaches: ['user_id', '00000000-0000-0000-0000-000000000000'],
  track_readiness: ['id', -1],
  track_athlete_codes: ['athlete_id', IMPOSSIBLE_ID],
  track_code_attempts: ['id', -1],
};
const probe = (table) => PROBE[table] || ['id', IMPOSSIBLE_ID];
const denied = (error) => !!error && (error.code === '42501' || /permission denied/i.test(error.message || ''));

// Opt-in only, so it never hits the live project by accident.
const LIVE = process.env.RUN_LIVE_RLS === '1' && !!envFile;

describe.skipIf(!LIVE)('anon / publishable key is blocked on track_* tables', () => {
  for (const table of TABLES) {
    it(`${table}: SELECT is denied`, async () => {
      const { data, error } = await anon.from(table).select('*').limit(1);
      expect(denied(error), `expected permission denied, got ${error?.code} ${error?.message} with ${data?.length ?? 0} rows`).toBe(true);
    });

    it(`${table}: UPDATE is denied`, async () => {
      const { error } = await anon.from(table).update(table === 'track_code_attempts' ? { attempted_at: new Date().toISOString() } : { created_at: new Date().toISOString() }).eq(...probe(table));
      expect(denied(error), `got ${error?.code} ${error?.message}`).toBe(true);
    });

    it(`${table}: DELETE is denied`, async () => {
      const { error } = await anon.from(table).delete().eq(...probe(table));
      expect(denied(error), `got ${error?.code} ${error?.message}`).toBe(true);
    });
  }

  it('track_athlete_workouts: INSERT is denied', async () => {
    const { error } = await anon.from('track_athlete_workouts').insert({
      athlete_id: IMPOSSIBLE_ID,
      workout_date: '1900-01-01',
      drills: [],
    });
    expect(denied(error), `got ${error?.code} ${error?.message}`).toBe(true);
  });

  it('track_is_coach() is not callable with the anon key', async () => {
    const { error } = await anon.rpc('track_is_coach');
    expect(!!error).toBe(true);
  });
});
