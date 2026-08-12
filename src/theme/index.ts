export { alpha, brand, colors, gradients, scale } from './palette';
export type { ColorToken } from './palette';
export { fontFamily, systemSerif, typeScale } from './typography';
export type { TypeVariant } from './typography';
export {
  contentMaxWidth,
  elevation,
  gutter,
  hairlineWidth,
  layout,
  radius,
  scaleWidth,
  screen,
  spacing,
  tabScrollInset,
} from './layout';

import { colors, gradients } from './palette';
import { elevation, layout, radius, spacing } from './layout';
import { typeScale } from './typography';

/** Convenience aggregate for components that want one import. */
export const theme = {
  colors,
  gradients,
  spacing,
  radius,
  elevation,
  layout,
  type: typeScale,
} as const;

export type Theme = typeof theme;
