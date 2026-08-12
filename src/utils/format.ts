import type { Treatment, TreatmentCategory } from '@/types/models';

/** "AED 1,450" — grouped, no decimals (all Velora prices are whole units). */
export function formatCurrency(amount: number, currency: string): string {
  return `${currency} ${amount.toLocaleString('en-GB', { maximumFractionDigits: 0 })}`;
}

export function formatPoints(points: number): string {
  return points.toLocaleString('en-GB');
}

export const CATEGORY_LABELS: Record<TreatmentCategory, string> = {
  aesthetics: 'Aesthetics',
  skin: 'Skin',
  wellness: 'Wellness',
  longevity: 'Longevity',
  body: 'Body',
};

/** Maps a treatment accent onto the marble variant used for its hero. */
export function accentToMarble(accent: Treatment['accent']): 'emerald' | 'ivory' | 'champagne' {
  switch (accent) {
    case 'emerald':
      return 'emerald';
    case 'gold':
    case 'champagne':
      return 'champagne';
    case 'sage':
    default:
      return 'ivory';
  }
}

export function initialsFrom(firstName: string, lastName: string): string {
  return `${firstName.trim()[0] ?? ''}${lastName.trim()[0] ?? ''}`.toUpperCase();
}

/** Truncates on a word boundary so card copy never breaks mid-word. */
export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : max).trimEnd()}…`;
}
