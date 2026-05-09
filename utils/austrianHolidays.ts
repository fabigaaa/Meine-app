// ─── Österreichische Feiertage & Ereignisse ───────────────────────────

export interface AustrianHoliday {
  date: string;      // 'YYYY-MM-DD'
  name: string;
  isPublic: boolean; // true = gesetzlicher Feiertag
  emoji: string;
}

// Osterberechnung nach dem Gaußschen Algorithmus
function calculateEaster(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function shiftDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function fmt(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getAustrianHolidays(year: number): AustrianHoliday[] {
  const easter = calculateEaster(year);

  const holidays: AustrianHoliday[] = [
    // ── Gesetzliche Feiertage ─────────────────────────────────
    { date: `${year}-01-01`, name: 'Neujahr',                  isPublic: true,  emoji: '🎆' },
    { date: `${year}-01-06`, name: 'Heilige Drei Könige',      isPublic: true,  emoji: '⭐' },
    { date: fmt(shiftDays(easter, 1)),  name: 'Ostermontag',   isPublic: true,  emoji: '🐣' },
    { date: `${year}-05-01`, name: 'Tag der Arbeit',           isPublic: true,  emoji: '🔨' },
    { date: fmt(shiftDays(easter, 39)), name: 'Christi Himmelfahrt', isPublic: true, emoji: '✝️' },
    { date: fmt(shiftDays(easter, 50)), name: 'Pfingstmontag', isPublic: true,  emoji: '🕊️' },
    { date: fmt(shiftDays(easter, 60)), name: 'Fronleichnam',  isPublic: true,  emoji: '⛪' },
    { date: `${year}-08-15`, name: 'Mariä Himmelfahrt',        isPublic: true,  emoji: '🌸' },
    { date: `${year}-10-26`, name: 'Nationalfeiertag',         isPublic: true,  emoji: '🇦🇹' },
    { date: `${year}-11-01`, name: 'Allerheiligen',            isPublic: true,  emoji: '🕯️' },
    { date: `${year}-12-08`, name: 'Mariä Empfängnis',         isPublic: true,  emoji: '💙' },
    { date: `${year}-12-25`, name: 'Weihnachten',              isPublic: true,  emoji: '🎄' },
    { date: `${year}-12-26`, name: 'Stefanitag',               isPublic: true,  emoji: '🎁' },

    // ── Nicht-gesetzliche Feiertage & Gedenktage ────────────
    { date: fmt(shiftDays(easter, -2)), name: 'Karfreitag',    isPublic: false, emoji: '✝️' },
    { date: fmt(easter),                name: 'Ostersonntag',  isPublic: false, emoji: '🐣' },
    { date: fmt(shiftDays(easter, 49)), name: 'Pfingstsonntag',isPublic: false, emoji: '🕊️' },
    { date: `${year}-02-14`, name: 'Valentinstag',             isPublic: false, emoji: '❤️' },
    { date: `${year}-03-08`, name: 'Frauentag',                isPublic: false, emoji: '🌷' },
    { date: `${year}-10-31`, name: 'Halloween',                isPublic: false, emoji: '🎃' },
    { date: `${year}-11-11`, name: 'Martinstag',               isPublic: false, emoji: '🕯️' },
    { date: `${year}-12-06`, name: 'Nikolaus',                 isPublic: false, emoji: '🎅' },
    { date: `${year}-12-24`, name: 'Heiliger Abend',           isPublic: false, emoji: '⭐' },
    { date: `${year}-12-31`, name: 'Silvester',                isPublic: false, emoji: '🎆' },
  ];

  return holidays.sort((a, b) => a.date.localeCompare(b.date));
}

// ─── Cache ────────────────────────────────────────────────────────────

const cache: Record<number, AustrianHoliday[]> = {};

export function getCachedHolidays(year: number): AustrianHoliday[] {
  if (!cache[year]) cache[year] = getAustrianHolidays(year);
  return cache[year];
}

/** Feiertag für ein bestimmtes Datum (oder null) */
export function getHolidayForDate(date: string): AustrianHoliday | null {
  const year = parseInt(date.slice(0, 4), 10);
  return getCachedHolidays(year).find((h) => h.date === date) ?? null;
}

/** Alle Feiertage als Map date→holiday für schnellen Lookup */
export function getHolidayMap(years: number[]): Record<string, AustrianHoliday> {
  const map: Record<string, AustrianHoliday> = {};
  for (const y of years) {
    for (const h of getCachedHolidays(y)) {
      map[h.date] = h;
    }
  }
  return map;
}
