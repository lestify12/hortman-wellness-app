/**
 * Date formatting.
 *
 * All app-facing strings go through here so the locale and the "12 Aug" style
 * are decided in one place. Uses `Intl` (available in Hermes on SDK 54).
 */

const LOCALE = 'en-GB';

export function formatDate(iso: string, style: 'short' | 'medium' | 'long' = 'medium'): string {
  const d = new Date(iso);
  const options: Intl.DateTimeFormatOptions =
    style === 'short'
      ? { day: 'numeric', month: 'short' }
      : style === 'long'
        ? { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
        : { day: 'numeric', month: 'short', year: 'numeric' };
  return new Intl.DateTimeFormat(LOCALE, options).format(d);
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat(LOCALE, { hour: '2-digit', minute: '2-digit' }).format(
    new Date(iso),
  );
}

export function formatWeekday(iso: string, short = true): string {
  return new Intl.DateTimeFormat(LOCALE, { weekday: short ? 'short' : 'long' }).format(
    new Date(iso),
  );
}

export function formatDayOfMonth(iso: string): string {
  return new Date(iso).getDate().toString();
}

export function formatMonthYear(iso: string): string {
  return new Intl.DateTimeFormat(LOCALE, { month: 'long', year: 'numeric' }).format(new Date(iso));
}

/** "In 3 days" / "Tomorrow" / "2 weeks ago" — used on cards and threads. */
export function formatRelative(iso: string): string {
  const target = new Date(iso).getTime();
  const now = Date.now();
  const diffMs = target - now;
  const diffMinutes = Math.round(diffMs / 60000);
  const absMinutes = Math.abs(diffMinutes);

  if (absMinutes < 1) return 'Just now';
  if (absMinutes < 60) {
    return diffMinutes > 0 ? `In ${absMinutes} min` : `${absMinutes} min ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  const absHours = Math.abs(diffHours);
  if (absHours < 24) {
    return diffHours > 0
      ? `In ${absHours} hour${absHours === 1 ? '' : 's'}`
      : `${absHours} hour${absHours === 1 ? '' : 's'} ago`;
  }

  const diffDays = Math.round(diffHours / 24);
  const absDays = Math.abs(diffDays);
  if (absDays === 1) return diffDays > 0 ? 'Tomorrow' : 'Yesterday';
  if (absDays < 7) return diffDays > 0 ? `In ${absDays} days` : `${absDays} days ago`;

  const diffWeeks = Math.round(absDays / 7);
  if (absDays < 30) {
    return diffDays > 0
      ? `In ${diffWeeks} week${diffWeeks === 1 ? '' : 's'}`
      : `${diffWeeks} week${diffWeeks === 1 ? '' : 's'} ago`;
  }

  const diffMonths = Math.round(absDays / 30);
  if (absDays < 365) {
    return diffDays > 0
      ? `In ${diffMonths} month${diffMonths === 1 ? '' : 's'}`
      : `${diffMonths} month${diffMonths === 1 ? '' : 's'} ago`;
  }

  const diffYears = Math.round(absDays / 365);
  return diffDays > 0 ? `In ${diffYears}y` : `${diffYears}y ago`;
}

/** Compact stamp for message threads: time today, weekday this week, else date. */
export function formatMessageStamp(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return formatTime(iso);

  const days = Math.abs(now.getTime() - d.getTime()) / 86400000;
  if (days < 7) return formatWeekday(iso);
  return formatDate(iso, 'short');
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} hr` : `${hours} hr ${rest} min`;
}

/** Greeting used on the home dashboard. */
export function greetingForNow(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function isFuture(iso: string): boolean {
  return new Date(iso).getTime() > Date.now();
}
