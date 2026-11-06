// Athlete portal calls. Every call goes through a code-checked RPC; the
// athlete never queries a table directly.
import { supabase } from '../supabaseClient';

const MESSAGES = {
  invalid_code: 'That code is not valid. Check it with your coach.',
  rate_limited: 'Too many wrong codes. Wait 15 minutes and try again.',
  date_not_allowed: 'You can only save a check-in for today or yesterday.',
  value_out_of_range: 'One of the values is out of range. Check the numbers and try again.',
};

export class PortalError extends Error {
  constructor(code, message) {
    super(message || MESSAGES[code] || 'Something went wrong. Try again.');
    this.code = code;
  }
}

const call = async (fn, args) => {
  let res;
  try {
    res = await supabase.rpc(fn, args);
  } catch {
    throw new PortalError('network', "Can't reach the server. Check your internet connection.");
  }
  const { data, error } = res;
  if (error) {
    if (/fetch|network/i.test(error.message || '')) {
      throw new PortalError('network', "Can't reach the server. Check your internet connection.");
    }
    throw new PortalError('server', error.message);
  }
  if (!data?.ok) throw new PortalError(data?.error || 'unknown');
  return data;
};

export const getMyProfile = (code) => call('get_my_profile', { p_code: code });
export const getMyWeek = (code, weekStart) => call('get_my_week', { p_code: code, p_week_start: weekStart });
export const getMyCheckins = (code, from, to) => call('get_my_checkins', { p_code: code, p_from: from, p_to: to });

// Only fields that are set are sent; the server keeps the others.
export const submitCheckin = (code, date, fields) => {
  const args = { p_code: code, p_date: date };
  Object.entries(fields || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') args[`p_${k}`] = v;
  });
  return call('submit_checkin', args);
};
