// Dates for the athlete portal. Weeks run Saturday-Friday in Africa/Cairo time.
const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Cairo', year: 'numeric', month: '2-digit', day: '2-digit' });

export const cairoToday = (now = new Date()) => fmt.format(now); // "YYYY-MM-DD"

const toUTC = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};
const toISO = (date) => date.toISOString().slice(0, 10);

export const addDays = (iso, n) => {
  const d = toUTC(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return toISO(d);
};

// Saturday of the week containing iso
export const weekStartOf = (iso) => {
  const dow = toUTC(iso).getUTCDay(); // Sun 0 ... Sat 6
  return addDays(iso, -((dow + 1) % 7));
};

export const weekDays = (startIso) => Array.from({ length: 7 }, (_, i) => addDays(startIso, i));

export const dayName = (iso) =>
  new Intl.DateTimeFormat('en-GB', { weekday: 'long', timeZone: 'UTC' }).format(toUTC(iso));

export const shortDate = (iso) =>
  new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(toUTC(iso));
