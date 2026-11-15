/**
 * Typography tokens.
 * Space Grotesk → headings and numbers. Inter → body copy.
 * Font files are loaded in app/_layout.tsx via @expo-google-fonts.
 */

export const fontFamily = {
  // Headings / numbers
  heading: 'SpaceGrotesk_700Bold',
  headingSemiBold: 'SpaceGrotesk_600SemiBold',
  headingMedium: 'SpaceGrotesk_500Medium',
  // Body
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
} as const;

export const fontSize = {
  xxs: 10,
  xs: 12,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  '5xl': 40,
} as const;

export const lineHeight = {
  tight: 1.2,
  snug: 1.35,
  normal: 1.5,
  relaxed: 1.65,
} as const;

export const letterSpacing = {
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  widest: 1.5,
} as const;

/** Legacy shape used by pre-existing screens. Prefer the tokens above. */
export const typography = {
  fontFamilyRegular: fontFamily.body,
  fontFamilyMedium: fontFamily.bodyMedium,
  fontFamilySemiBold: fontFamily.bodySemiBold,
  fontFamilyBold: fontFamily.heading,

  size3xs: fontSize.xxs,
  size2xs: 11,
  sizeXs: fontSize.xs,
  sizeSm: fontSize.sm,
  sizeBase: fontSize.base,
  sizeMd: fontSize.md,
  sizeLg: fontSize.lg,
  sizeXl: fontSize.xl,
  size2xl: fontSize['2xl'],
  size3xl: fontSize['3xl'],
  size4xl: fontSize['4xl'],
  size5xl: fontSize['5xl'],

  lineHeightTight: lineHeight.tight,
  lineHeightSnug: lineHeight.snug,
  lineHeightNormal: lineHeight.normal,
  lineHeightRelaxed: lineHeight.relaxed,

  trackingTight: letterSpacing.tight,
  trackingNormal: letterSpacing.normal,
  trackingWide: letterSpacing.wide,
  trackingWidest: letterSpacing.widest,
} as const;
