import {
  addDays,
  addWeeks,
  addMonths,
  addYears,
  parseISO,
  format,
  isAfter,
  isBefore,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { de } from 'date-fns/locale';
import { CalendarEvent } from '@/types/calendar';

/** Expand recurring events into individual instances within [rangeStart, rangeEnd]. */
export function expandEvents(
  events: CalendarEvent[],
  rangeStart: string,
  rangeEnd: string
): CalendarEvent[] {
  const result: CalendarEvent[] = [];

  for (const event of events) {
    if (!event.recurrence || event.recurrence === 'none') {
      const eventEnd = (event.endDate && event.endDate > event.date) ? event.endDate : event.date;
      if (eventEnd >= rangeStart && event.date <= rangeEnd) {
        result.push(event);
      }
      continue;
    }

    let current = parseISO(event.date);
    const recEnd = event.recurrenceEndDate
      ? parseISO(event.recurrenceEndDate)
      : addYears(current, 2);
    const viewEnd = parseISO(rangeEnd);
    const viewStart = parseISO(rangeStart);

    let safety = 0;
    while (!isAfter(current, recEnd) && !isAfter(current, viewEnd) && safety < 1000) {
      safety++;
      if (!isBefore(current, viewStart)) {
        result.push({ ...event, date: format(current, 'yyyy-MM-dd') });
      }
      switch (event.recurrence) {
        case 'daily': current = addDays(current, 1); break;
        case 'weekly': current = addWeeks(current, 1); break;
        case 'monthly': current = addMonths(current, 1); break;
        case 'yearly': current = addYears(current, 1); break;
        default: current = addYears(current, 100);
      }
    }
  }

  return result;
}

/** Returns all dates between start and end (inclusive) as "YYYY-MM-DD" strings. */
export function dateRange(startDate: string, endDate: string): string[] {
  const result: string[] = [];
  let current = parseISO(startDate);
  const end = parseISO(endDate);
  while (!isAfter(current, end)) {
    result.push(format(current, 'yyyy-MM-dd'));
    current = addDays(current, 1);
  }
  return result;
}

/** Monday-based week start for a given date. */
export function getWeekStart(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 });
}

/** Monday-based week end for a given date. */
export function getWeekEnd(date: Date): Date {
  return endOfWeek(date, { weekStartsOn: 1 });
}

/** Format a date as "YYYY-MM-DD". */
export function toDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/** Convert "HH:MM" to total minutes since midnight. */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}
