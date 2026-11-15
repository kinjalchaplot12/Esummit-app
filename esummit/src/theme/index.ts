/**
 * E-Summit Design System — single entry point.
 *
 *   colors.ts   palette, semantic colors, brand gradient
 *   fonts.ts    Space Grotesk (headings, numbers) + Inter (body)
 *   spacing.ts  4pt spacing scale, touch target, tab bar sizes
 *   radius.ts   card / input / pill radii
 *
 * Screens import from `src/theme` only. No hex values outside colors.ts.
 */

import { colors, palette, brandGradient, googleColors } from './colors';
import { fontFamily, fontSize, lineHeight, letterSpacing, typography } from './fonts';
import {
  spacing,
  screenPadding,
  minTouchTarget,
  tabBarHeight,
  tabBarBottomOffset,
  tabBarClearance,
} from './spacing';
import { radius, radii } from './radius';

export {
  googleColors,
  colors,
  palette,
  brandGradient,
  fontFamily,
  fontSize,
  lineHeight,
  letterSpacing,
  typography,
  spacing,
  screenPadding,
  minTouchTarget,
  tabBarHeight,
  tabBarBottomOffset,
  tabBarClearance,
  radius,
  radii,
};

export const shadows = {
  sm: {
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 5,
  },
  lg: {
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 10,
  },
} as const;

export const durations = {
  fast: 150,
  normal: 250,
  slow: 400,
} as const;

export const zIndex = {
  base: 0,
  raised: 10,
  overlay: 20,
  modal: 30,
  toast: 40,
} as const;

const theme = {
  colors,
  brandGradient,
  fontFamily,
  fontSize,
  typography,
  spacing,
  radius,
  radii,
  shadows,
  durations,
  zIndex,
} as const;

export default theme;
