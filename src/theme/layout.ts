import { Dimensions, PixelRatio, Platform } from 'react-native';

/** 4pt base grid — generous by default, per the brand's spacing language. */
export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 56,
  giant: 72,
} as const;

export const radius = {
  none: 0,
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 26,
  xxl: 34,
  pill: 999,
} as const;

/**
 * Soft, low-contrast elevation. Luxury surfaces lift off the ivory canvas
 * without ever reading as a Material drop shadow.
 */
export const elevation = {
  none: Platform.select({
    ios: { shadowColor: 'transparent', shadowOpacity: 0 },
    default: { elevation: 0 },
  }),
  soft: Platform.select({
    ios: {
      shadowColor: '#0D3B34',
      shadowOpacity: 0.06,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 6 },
    },
    android: { elevation: 2 },
    default: {},
  }),
  medium: Platform.select({
    ios: {
      shadowColor: '#0D3B34',
      shadowOpacity: 0.1,
      shadowRadius: 22,
      shadowOffset: { width: 0, height: 10 },
    },
    android: { elevation: 5 },
    default: {},
  }),
  lifted: Platform.select({
    ios: {
      shadowColor: '#07241F',
      shadowOpacity: 0.16,
      shadowRadius: 32,
      shadowOffset: { width: 0, height: 16 },
    },
    android: { elevation: 10 },
    default: {},
  }),
} as const;

export const hairlineWidth = Math.max(0.5, 1 / PixelRatio.get());

const { width, height } = Dimensions.get('window');

/**
 * Reference frame is a 390pt-wide handset (iPhone 14/15). `scaleWidth` keeps
 * hero artwork proportional on small and large screens without stretching type.
 */
const BASE_WIDTH = 390;

export const screen = {
  width,
  height,
  isCompact: width < 360,
  isTablet: width >= 768,
};

export function scaleWidth(size: number): number {
  const ratio = Math.min(Math.max(width / BASE_WIDTH, 0.86), 1.28);
  return Math.round(size * ratio);
}

/** Horizontal gutter — wider on tablets so content never runs edge to edge. */
export const gutter = screen.isTablet ? spacing.xxxl : spacing.xl;

/** Max readable content width; centres the column on tablets. */
export const contentMaxWidth = 640;

export const layout = {
  gutter,
  contentMaxWidth,
  tabBarHeight: 72,
  headerHeight: 56,
  cardMinHeight: 96,
};

/**
 * Bottom padding scrollable tab screens must reserve so their last card clears
 * the floating tab bar. The bar is absolutely positioned, so RN cannot infer it.
 */
export const tabScrollInset = layout.tabBarHeight + spacing.xxl + spacing.base;
