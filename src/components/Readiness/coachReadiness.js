// Coach-side readiness data (signed-in coach; RLS allows only the coach).
import { supabase } from '../../supabaseClient';
import { evaluateReadiness, sessionLoad } from '../../data/readinessRules.js';

const DAY = 86400000;
export const isoAdd = (iso, n) => new Date(Date.parse(`${iso}T00:00:00Z`) + n * DAY).toISOString().slice(0, 10);
export const cairoToday = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Cairo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
export const weekStartOf = (iso) => {
  const dow = new Date(Date.parse(`${iso}T00:00:00Z`)).getUTCDay();
  return isoAdd(iso, -((dow + 1) % 7));
};

export async function fetchReadiness({ from, to, athleteId } = {}) {
  let q = supabase.from('track_readiness').select('*').gte('date', from).lte('date', to);
  if (athleteId) q = q.eq('athlete_id', athleteId);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

export async function fetchOverrides({ from, to, athleteId } = {}) {
  let q = supabase.from('track_readiness_overrides').select('*').gte('date', from).lte('date', to);
  if (athleteId) q = q.eq('athlete_id', athleteId);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

export async function saveOverride(athleteId, date, color, note) {
  const { error } = await supabase
    .from('track_readiness_overrides')
    .upsert({ athlete_id: athleteId, date, color, note: note?.trim() || null, updated_at: new Date().toISOString() }, { onConflict: 'athlete_id,date' });
  if (error) throw error;
}

// Removes only the coach's override for that day (the check-in itself is kept).
export async function clearOverride(athleteId, date) {
  const { error } = await supabase.from('track_readiness_overrides').delete().eq('athlete_id', athleteId).eq('date', date);
  if (error) throw error;
}

export async function markCommentSeen(rowId) {
  const { error } = await supabase.from('track_readiness').update({ coach_seen_at: new Date().toISOString() }).eq('id', rowId);
  if (error) throw error;
}

// Colour for one athlete on one day, with the coach override on top.
export function readinessFor(rows, overrides, athleteId, date) {
  const mine = rows.filter((r) => r.athlete_id === athleteId);
  const entry = mine.find((r) => r.date === date) || null;
  const auto = evaluateReadiness(entry, mine);
  const override = overrides.find((o) => o.athlete_id === athleteId && o.date === date) || null;
  return {
    entry,
    auto,
    override,
    color: override ? override.color : auto.color,
    reasons: override ? [`Coach: ${override.note || 'override'}`, ...auto.reasons.map((r) => `Auto: ${r}`)] : auto.reasons,
    hasNewComment: !!(entry?.athlete_note && !entry?.coach_seen_at),
  };
}

export function weeklySrpe(rows, athleteId, weekStart) {
  const end = isoAdd(weekStart, 6);
  return rows
    .filter((r) => r.athlete_id === athleteId && r.date >= weekStart && r.date <= end)
    .reduce((sum, r) => sum + sessionLoad(r), 0);
}
