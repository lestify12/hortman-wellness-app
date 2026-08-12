import { Platform, TextStyle } from 'react-native';

/**
 * Velora type system.
 *
 * Display / headings — Cormorant Garamond (elegant high-contrast serif).
 * Body / UI          — Jost (clean geometric sans, wide tracking at small sizes).
 *
 * Font family keys are the names registered in `useVeloraFonts`.
 */
export const fontFamily = {
  serif: 'CormorantGaramond_400Regular',
  serifMedium: 'CormorantGaramond_500Medium',
  serifSemiBold: 'CormorantGaramond_600SemiBold',
  serifLight: 'CormorantGaramond_300Light',
  serifItalic: 'CormorantGaramond_400Regular_Italic',
  sans: 'Jost_400Regular',
  sansMedium: 'Jost_500Medium',
  sansSemiBold: 'Jost_600SemiBold',
  sansLight: 'Jost_300Light',
} as const;

/**
 * Fallbacks used before fonts resolve, so the first paint never shows Roboto
 * on a screen that is meant to read as a serif.
 */
export const systemSerif = Platform.select({
  ios: 'Times New Roman',
  android: 'serif',
  default: 'serif',
}) as string;

type Variant = Pick<
  TextStyle,
  'fontFamily' | 'fontSize' | 'lineHeight' | 'letterSpacing' | 'textTransform'
>;

export const typeScale = {
  /** Reserved for the splash monogram lockup. */
  displayXL: {
    fontFamily: fontFamily.serifLight,
    fontSize: 48,
    lineHeight: 54,
    letterSpacing: 1.5,
  },
  display: {
    fontFamily: fontFamily.serifLight,
    fontSize: 38,
    lineHeight: 44,
    letterSpacing: 0.6,
  },
  h1: {
    fontFamily: fontFamily.serif,
    fontSize: 30,
    lineHeight: 38,
    letterSpacing: 0.2,
  },
  h2: {
    fontFamily: fontFamily.serif,
    fontSize: 24,
    lineHeight: 31,
    letterSpacing: 0.2,
  },
  h3: {
    fontFamily: fontFamily.serifMedium,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: 0.2,
  },
  h4: {
    fontFamily: fontFamily.serifSemiBold,
    fontSize: 17,
    lineHeight: 23,
    letterSpacing: 0.2,
  },
  /** All-caps gold/emerald eyebrow above section headings. */
  eyebrow: {
    fontFamily: fontFamily.sansMedium,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
  },
  bodyLg: {
    fontFamily: fontFamily.sans,
    fontSize: 16,
    lineHeight: 25,
    letterSpacing: 0.1,
  },
  body: {
    fontFamily: fontFamily.sans,
    fontSize: 14.5,
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  bodySm: {
    fontFamily: fontFamily.sans,
    fontSize: 13,
    lineHeight: 19,
    letterSpacing: 0.1,
  },
  label: {
    fontFamily: fontFamily.sansMedium,
    fontSize: 13,
    lineHeight: 17,
    letterSpacing: 0.4,
  },
  caption: {
    fontFamily: fontFamily.sans,
    fontSize: 11.5,
    lineHeight: 16,
    letterSpacing: 0.3,
  },
  button: {
    fontFamily: fontFamily.sansMedium,
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  /** Numerals in progress rings, stats and price blocks. */
  metric: {
    fontFamily: fontFamily.serifLight,
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: 0,
  },
} satisfies Record<string, Variant>;

export type TypeVariant = keyof typeof typeScale;
