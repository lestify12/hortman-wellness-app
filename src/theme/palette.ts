/**
 * Velora Clinics — brand palette.
 *
 * These six values are the master brand reference. Nothing in the app should
 * hard-code a colour string; every surface, border and glyph resolves back to
 * one of these tokens (or a derived alpha of one).
 */

export const brand = {
  deepEmerald: '#0D3B34',
  emerald: '#1F5C4D',
  sage: '#B7C6B8',
  gold: '#D4AF37',
  warmIvory: '#F7F3EE',
  champagne: '#EDE6DC',
} as const;

/** Derived tints/shades. Kept explicit so the luxury range stays intentional. */
export const scale = {
  emerald900: '#07241F',
  emerald800: brand.deepEmerald,
  emerald700: '#134A40',
  emerald600: brand.emerald,
  emerald500: '#2F7362',
  emerald400: '#4C8E7C',
  emerald300: '#7FAE9E',

  sage300: brand.sage,
  sage200: '#CBD7CB',
  sage100: '#DFE6DE',

  gold600: '#A8862A',
  gold500: brand.gold,
  gold400: '#DFC163',
  gold300: '#EBD79B',

  ivory: brand.warmIvory,
  ivoryLift: '#FDFBF8',
  champagne: brand.champagne,
  champagneDeep: '#E1D7C9',
} as const;

/** Alpha helper — brand colours at controlled opacity, no magic rgba() strings. */
export function alpha(hex: string, amount: number): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const a = Math.max(0, Math.min(1, amount));
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/**
 * Semantic colour roles. Screens and components consume these, never `brand.*`
 * directly, so a future dark/clinic-specific theme is a single swap here.
 */
export const colors = {
  // Surfaces
  canvas: scale.ivory,
  surface: scale.ivoryLift,
  surfaceMuted: scale.champagne,
  surfaceInverse: brand.deepEmerald,
  surfaceInverseElevated: scale.emerald700,

  // Text
  textPrimary: brand.deepEmerald,
  textSecondary: alpha(brand.deepEmerald, 0.66),
  textTertiary: alpha(brand.deepEmerald, 0.42),
  textOnDark: scale.ivory,
  textOnDarkMuted: alpha(scale.ivory, 0.68),
  textGold: scale.gold600,

  // Lines & accents
  hairline: alpha(brand.deepEmerald, 0.09),
  hairlineStrong: alpha(brand.deepEmerald, 0.16),
  hairlineOnDark: alpha(scale.ivory, 0.14),
  accent: brand.gold,
  accentSoft: alpha(brand.gold, 0.14),
  sage: brand.sage,
  sageSoft: alpha(brand.sage, 0.28),

  // Feedback — deliberately desaturated to stay inside the luxury range
  success: '#2F7362',
  successSoft: alpha('#2F7362', 0.12),
  warning: '#B08347',
  warningSoft: alpha('#B08347', 0.14),
  danger: '#9C4A3C',
  dangerSoft: alpha('#9C4A3C', 0.12),

  // Utility
  overlay: alpha(scale.emerald900, 0.55),
  transparent: 'transparent',
} as const;

/** Gradient presets — the marble/emerald washes used across hero surfaces. */
export const gradients = {
  emeraldDepth: [scale.emerald900, brand.deepEmerald, scale.emerald700] as const,
  emeraldSheen: [brand.deepEmerald, scale.emerald600] as const,
  ivoryMarble: [scale.ivoryLift, scale.ivory, scale.champagne] as const,
  champagneMarble: [scale.champagne, scale.ivory, scale.champagneDeep] as const,
  goldLeaf: [scale.gold300, brand.gold, scale.gold600] as const,
  glassOnDark: [alpha(scale.ivory, 0.16), alpha(scale.ivory, 0.04)] as const,
};

export type ColorToken = keyof typeof colors;
