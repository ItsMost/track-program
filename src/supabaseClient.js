import { createClient } from '@supabase/supabase-js';
import { INITIAL_ATHLETES, INITIAL_LIBRARY } from './data/constants.js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const useRealSupabase = 
  supabaseUrl && 
  typeof supabaseUrl === 'string' &&
  (supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://')) &&
  supabaseAnonKey && 
  supabaseAnonKey !== 'your_supabase_anon_key' &&
  supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY';

class MockSupabaseQuery {
  constructor(table) {
    this.table = table;
    const localData = localStorage.getItem(`db_${table}`);
    this.data = localData ? JSON.parse(localData) : [];

    // Pre-populate with realistic mock records if database is empty or outdated
    if (this.data.length === 0 || (table === 'track_library_drills' && this.data.length < INITIAL_LIBRARY.drills.length)) {
      if (table === 'track_athletes' || table === 'agilitylap_athletes') {
        this.data = INITIAL_ATHLETES.map(a => ({
          id: a.id,
          name: a.name,
          birth_year: a.birthYear,
          weight: a.weight,
          height: a.height,
          body_fat: a.bodyFat,
          vertical_jump: a.verticalJump,
          standing_long_jump: a.standingLongJump,
          squat_jump: a.squatJump,
          clean: a.clean,
          half_squat: a.halfSquat,
          quarter_squat: a.quarterSquat,
          full_squat: a.fullSquat,
          bench: a.bench,
          deadlift: a.deadlift,
          created_at: new Date().toISOString()
        }));
        localStorage.setItem(`db_${table}`, JSON.stringify(this.data));
      } else if (table === 'track_library_drills') {
        this.data = INITIAL_LIBRARY.drills.map(d => ({
          ...d,
          created_at: new Date().toISOString()
        }));
        localStorage.setItem(`db_${table}`, JSON.stringify(this.data));
      } else if (table === 'track_week_templates') {
        this.data = INITIAL_LIBRARY.templates.map(t => ({
          id: t.id,
          template_name: t.title,
          template_type: t.type,
          drills: t.drills,
          created_at: new Date().toISOString()
        }));
        localStorage.setItem(`db_${table}`, JSON.stringify(this.data));
      }
    }

    this.currentFilter = () => true;
    this.currentSort = null;
    this.operation = null; // Holds pending operations like insert, update, upsert, delete
  }

  select(fields) {
    // Chainable select
    return this;
  }

  order(column, { ascending = true } = {}) {
    this.currentSort = (a, b) => {
      let valA = a[column];
      let valB = b[column];
      if (column === 'created_at') {
        valA = valA ? new Date(valA).getTime() : 0;
        valB = valB ? new Date(valB).getTime() : 0;
      }
      if (valA < valB) return ascending ? -1 : 1;
      if (valA > valB) return ascending ? 1 : -1;
      return 0;
    };
    return this;
  }

  eq(column, value) {
    const prevFilter = this.currentFilter;
    this.currentFilter = (item) => prevFilter(item) && String(item[column]) === String(value);
    return this;
  }

  gte(column, value) {
    const prevFilter = this.currentFilter;
    this.currentFilter = (item) => prevFilter(item) && item[column] >= value;
    return this;
  }

  lte(column, value) {
    const prevFilter = this.currentFilter;
    this.currentFilter = (item) => prevFilter(item) && item[column] <= value;
    return this;
  }

  save() {
    localStorage.setItem(`db_${this.table}`, JSON.stringify(this.data));
  }

  insert(record) {
    this.operation = {
      type: 'insert',
      records: Array.isArray(record) ? record : [record]
    };
    return this;
  }

  update(updates) {
    this.operation = {
      type: 'update',
      updates
    };
    return this;
  }

  upsert(record, options = {}) {
    this.operation = {
      type: 'upsert',
      records: Array.isArray(record) ? record : [record],
      onConflict: options.onConflict
    };
    return this;
  }

  delete() {
    this.operation = {
      type: 'delete'
    };
    return this;
  }

  // Promise-compatible thenable interface to execute lazily
  then(onfulfilled, onrejected) {
    let resultData = [];
    
    if (this.operation) {
      const op = this.operation;
      
      if (op.type === 'insert') {
        const inserted = op.records.map(r => ({
          id: r.id || `id-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
          created_at: new Date().toISOString(),
          ...r
        }));
        this.data.push(...inserted);
        this.save();
        resultData = inserted;
        
      } else if (op.type === 'update') {
        let updatedItems = [];
        this.data = this.data.map(item => {
          if (this.currentFilter(item)) {
            const newItem = { ...item, ...op.updates };
            updatedItems.push(newItem);
            return newItem;
          }
          return item;
        });
        this.save();
        resultData = updatedItems;
        
      } else if (op.type === 'upsert') {
        const insertedOrUpdated = [];
        op.records.forEach(r => {
          const conflictKeys = op.onConflict ? op.onConflict.split(',') : [];
          let index = -1;
          if (conflictKeys.length > 0) {
            index = this.data.findIndex(item => {
              return conflictKeys.every(k => String(item[k]) === String(r[k]));
            });
          } else {
            index = this.data.findIndex(item => String(item.id) === String(r.id));
          }

          const updatedRecord = { ...r };
          if (!updatedRecord.id) {
            updatedRecord.id = `id-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
          }
          if (!updatedRecord.created_at) {
            updatedRecord.created_at = new Date().toISOString();
          }

          if (index !== -1) {
            this.data[index] = { ...this.data[index], ...updatedRecord };
            insertedOrUpdated.push(this.data[index]);
          } else {
            this.data.push(updatedRecord);
            insertedOrUpdated.push(updatedRecord);
          }
        });
        this.save();
        resultData = insertedOrUpdated;
        
      } else if (op.type === 'delete') {
        let deletedItems = [];
        this.data = this.data.filter(item => {
          if (this.currentFilter(item)) {
            deletedItems.push(item);
            return false;
          }
          return true;
        });
        this.save();
        resultData = deletedItems;
      }
    } else {
      // Standard Select Query
      let filtered = this.data.filter(this.currentFilter);
      if (this.currentSort) {
        filtered.sort(this.currentSort);
      }
      resultData = filtered;
    }

    return Promise.resolve({ data: resultData, error: null }).then(onfulfilled, onrejected);
  }
}

// ---------------------------------------------------------------------------
// Local mock of the athlete-portal RPCs (offline testing only). Mirrors the
// SQL functions in supabase/migrations/20261106130000_track_athlete_portal.sql.
// Codes are kept in plain text here because this data never leaves the browser.
// ---------------------------------------------------------------------------
const mockRead = (key) => {
  try { return JSON.parse(localStorage.getItem(`db_${key}`) || '[]'); } catch { return []; }
};
const mockWrite = (key, rows) => {
  try { localStorage.setItem(`db_${key}`, JSON.stringify(rows)); } catch { /* storage blocked */ }
};
const cairoTodayIso = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Cairo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const isoAdd = (iso, n) => {
  const [y, m, d] = iso.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return t.toISOString().slice(0, 10);
};
const isoWeekStart = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return isoAdd(iso, -((dow + 1) % 7));
};
const normalizeCode = (c) => String(c || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
const mockResolve = (code) => {
  const c = normalizeCode(code);
  const rows = mockRead('track_athlete_codes');
  const row = rows.find((r) => r.code === c);
  if (!row) return null;
  row.last_used_at = new Date().toISOString();
  mockWrite('track_athlete_codes', rows);
  return row.athlete_id;
};
const CHECKIN_FIELDS = ['sleep', 'soreness', 'ankle_pain', 'hamstring_pain', 'cmj_cm', 'sprint_test', 'sprint_time_s', 'session_rpe', 'session_minutes', 'athlete_note', 'broad_jump_m'];

const mockRpc = async (fn, args = {}) => {
  const ok = (data) => ({ data: { ok: true, ...data }, error: null });
  const fail = (code) => ({ data: { ok: false, error: code }, error: null });
  const today = cairoTodayIso();

  if (fn === 'track_is_coach') return { data: true, error: null };

  if (fn === 'track_set_athlete_code') {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const bytes = crypto.getRandomValues(new Uint8Array(8));
    const code = Array.from(bytes, (b) => alphabet[b % 32]).join('');
    const rows = mockRead('track_athlete_codes').filter((r) => r.athlete_id !== args.p_athlete_id);
    rows.push({ athlete_id: args.p_athlete_id, code, created_at: new Date().toISOString(), last_used_at: null });
    mockWrite('track_athlete_codes', rows);
    return { data: code, error: null };
  }
  if (fn === 'track_athlete_code_status') {
    const row = mockRead('track_athlete_codes').find((r) => r.athlete_id === args.p_athlete_id);
    return { data: row ? { has_code: true, created_at: row.created_at, last_used_at: row.last_used_at } : { has_code: false }, error: null };
  }

  const athleteId = mockResolve(args.p_code);
  if (['get_my_profile', 'get_my_week', 'submit_checkin', 'get_my_checkins', 'get_my_history'].includes(fn)) {
    await new Promise((r) => setTimeout(r, athleteId ? 150 : 1000));
    if (!athleteId) return fail('invalid_code');
  }

  if (fn === 'get_my_profile') {
    const a = mockRead('track_athletes').find((x) => x.id === athleteId) || INITIAL_ATHLETES.find((x) => x.id === athleteId);
    const athlete = {
      id: athleteId, name: a?.name || 'Athlete', weight: a?.weight ?? null,
      fullSquat: a?.full_squat ?? a?.fullSquat ?? null, halfSquat: a?.half_squat ?? a?.halfSquat ?? null,
      quarterSquat: a?.quarter_squat ?? a?.quarterSquat ?? null, clean: a?.clean ?? null,
      bench: a?.bench ?? null, deadlift: a?.deadlift ?? null,
    };
    return ok({ athlete, today, current_week_start: isoWeekStart(today) });
  }
  if (fn === 'get_my_week') {
    const start = isoWeekStart(args.p_week_start);
    const limit = isoAdd(isoWeekStart(today), 6);
    if (start > limit) return ok({ week_start: start, workouts: [] });
    const end = [isoAdd(start, 6), limit].sort()[0];
    const workouts = mockRead('track_athlete_workouts')
      .filter((w) => w.athlete_id === athleteId && w.workout_date >= start && w.workout_date <= end)
      .sort((a, b) => (a.workout_date < b.workout_date ? -1 : 1))
      .map((w) => ({ workout_date: w.workout_date, workout_title: w.workout_title, drills: w.drills }));
    return ok({ week_start: start, workouts });
  }
  if (fn === 'submit_checkin') {
    if (![today, isoAdd(today, -1)].includes(args.p_date)) return fail('date_not_allowed');
    const rows = mockRead('track_readiness');
    let row = rows.find((r) => r.athlete_id === athleteId && r.date === args.p_date);
    if (!row) {
      row = { id: `rd-${Date.now()}-${Math.floor(Math.random() * 100000)}`, athlete_id: athleteId, date: args.p_date, created_at: new Date().toISOString() };
      rows.push(row);
    }
    // a new or changed note shows as "new" to the coach
    const newNote = args.p_athlete_note ? String(args.p_athlete_note).trim() : '';
    if (newNote && newNote !== row.athlete_note) row.coach_seen_at = null;
    CHECKIN_FIELDS.forEach((f) => {
      const v = args[`p_${f}`];
      if (v !== undefined && v !== null && v !== '') row[f] = v;
    });
    row.updated_at = new Date().toISOString();
    mockWrite('track_readiness', rows);
    const { athlete_id: _omit, coach_seen_at: _seen, ...checkin } = row;
    return ok({ checkin });
  }
  if (fn === 'get_my_checkins') {
    const to = [args.p_to, today].sort()[0];
    const checkins = mockRead('track_readiness')
      .filter((r) => r.athlete_id === athleteId && r.date >= args.p_from && r.date <= to)
      .sort((a, b) => (a.date < b.date ? -1 : 1))
      .map(({ athlete_id: _omit, coach_seen_at: _seen, ...rest }) => rest);
    return ok({ checkins });
  }
  if (fn === 'get_my_history') {
    const from = args.p_from || '1900-01-01';
    const checkins = mockRead('track_readiness')
      .filter((r) => r.athlete_id === athleteId && r.date >= from && r.date <= today)
      .sort((a, b) => (a.date < b.date ? -1 : 1))
      .map((r) => ({
        date: r.date, cmj_cm: r.cmj_cm ?? null, sprint_test: r.sprint_test ?? null,
        sprint_time_s: r.sprint_time_s ?? null, broad_jump_m: r.broad_jump_m ?? null,
        session_rpe: r.session_rpe ?? null, session_minutes: r.session_minutes ?? null,
      }));
    const a = mockRead('track_athletes').find((x) => x.id === athleteId) || {};
    return ok({
      checkins,
      profile: {
        cmj: a.cmj ?? a.vertical_jump ?? null, accel_10m: a.accel_10m ?? null,
        fly_30m: a.fly_30m ?? null, broad_jump: a.broad_jump ?? a.standing_long_jump ?? null,
      },
    });
  }
  return { data: null, error: { message: `Unknown function ${fn}` } };
};

const mockSupabase = {
  from(table) {
    return new MockSupabaseQuery(table);
  },
  rpc(fn, args) {
    return mockRpc(fn, args);
  }
};

export const supabase = useRealSupabase ? createClient(supabaseUrl, supabaseAnonKey) : mockSupabase;
export const isRealSupabase = !!useRealSupabase;
