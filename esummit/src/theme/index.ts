/**
 * E-Summit Design System — single source of truth.
 *
 * All colors, typography, spacing, radii, and shadows live here.
 * Lines marked  PLACEHOLDER  use sensible dark defaults until the
 * final brand values are confirmed from the E-Summit UI prompt.
 *
 * To re-brand: update the tokens in this file only.
 */

// ─── Palette ──────────────────────────────────────────────────────────────────

/**
 * Raw palette. Prefer semantic tokens (colors.*) in components.
 * Only reference the raw palette inside this file.
 */
const palette = {
  // Brand — PLACEHOLDER (awaiting final E-Summit brand values)
  brand900: '#0A0A0F',   // near-black background
  brand850: '#0F0F1A',   // surface / card background
  brand800: '#141428',   // elevated surface
  brand700: '#1E1E38',   // border / separator
  brand600: '#2A2A50',   // muted border

  // Accent — PLACEHOLDER
  accent500: '#5B6EF5',  // primary interactive (buttons, links)
  accent400: '#7B8EFF',  // hover / pressed state
  accent300: '#9DABFF',  // light accent / icon tint
  accent200: '#C4CCFF',  // subtle accent background
  accent100: '#ECEEFF',  // lightest accent tint

  // Neutral
  neutral900: '#FFFFFF',
  neutral800: '#E8E8EE',
  neutral700: '#C0C0CC',
  neutral600: '#8888A0',
  neutral500: '#555570',
  neutral400: '#333348',
  neutral300: '#222235',
  neutral200: '#1A1A28',

  // Status
  success500: '#22C55E',
  success200: '#14532D',
  warning500: '#F59E0B',
  warning200: '#451A03',
  error500: '#EF4444',
  error200: '#450A0A',
  info500: '#3B82F6',
  info200: '#1E3A5F',
} as const;

// ─── Semantic color tokens ────────────────────────────────────────────────────

export const colors = {
  // Backgrounds
  background:       palette.brand900,
  surface:          palette.brand850,
  surfaceElevated:  palette.brand800,
  border:           palette.brand700,
  borderSubtle:     palette.brand600,

  // Text
  textPrimary:      palette.neutral900,
  textSecondary:    palette.neutral700,
  textTertiary:     palette.neutral600,
  textDisabled:     palette.neutral500,
  textInverse:      palette.brand900,

  // Interactive
  primary:          palette.accent500,
  primaryHover:     palette.accent400,
  primaryLight:     palette.accent200,
  primarySubtle:    palette.accent100,

  // Status
  success:          palette.success500,
  successBg:        palette.success200,
  warning:          palette.warning500,
  warningBg:        palette.warning200,
  error:            palette.error500,
  errorBg:          palette.error200,
  info:             palette.info500,
  infoBg:           palette.info200,

  // Tab bar
  tabActive:        palette.accent400,
  tabInactive:      palette.neutral600,
  tabBg:            palette.brand850,
  tabBorder:        palette.brand700,

  // Overlay / scrim
  overlay:          'rgba(0,0,0,0.6)',
  overlayLight:     'rgba(0,0,0,0.3)',
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────

export const typography = {
  // Font families — PLACEHOLDER (Inter via @expo-google-fonts/inter will be
  // added once fonts are set up; these fall back to system fonts for now)
  fontFamilyRegular:  'Inter-Regular',
  fontFamilyMedium:   'Inter-Medium',
  fontFamilySemiBold: 'Inter-SemiBold',
  fontFamilyBold:     'Inter-Bold',

  // Font sizes (sp — scales with OS accessibility settings)
  size3xs:  10,
  size2xs:  11,
  sizeXs:   12,
  sizeSm:   13,
  sizeBase: 15,
  sizeMd:   16,
  sizeLg:   18,
  sizeXl:   20,
  size2xl:  24,
  size3xl:  28,
  size4xl:  32,
  size5xl:  40,

  // Line heights
  lineHeightTight:   1.2,
  lineHeightSnug:    1.35,
  lineHeightNormal:  1.5,
  lineHeightRelaxed: 1.65,

  // Letter spacing
  trackingTight:  -0.5,
  trackingNormal:  0,
  trackingWide:    0.5,
  trackingWidest:  1.5,
} as const;

// ─── Spacing ──────────────────────────────────────────────────────────────────

export const spacing = {
  px:   1,
  '0':  0,
  '1':  4,
  '2':  8,
  '3':  12,
  '4':  16,
  '5':  20,
  '6':  24,
  '7':  28,
  '8':  32,
  '9':  36,
  '10': 40,
  '12': 48,
  '16': 64,
  '20': 80,
  '24': 96,
} as const;

// ─── Radii ────────────────────────────────────────────────────────────────────

export const radii = {
  none: 0,
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  '2xl': 24,
  full: 9999,
} as const;

// ─── Shadows ──────────────────────────────────────────────────────────────────

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 10,
  },
} as const;

// ─── Animation durations ──────────────────────────────────────────────────────

export const durations = {
  fast:   150,
  normal: 250,
  slow:   400,
} as const;

// ─── Z-index ─────────────────────────────────────────────────────────────────

export const zIndex = {
  base:    0,
  raised:  10,
  overlay: 20,
  modal:   30,
  toast:   40,
} as const;

// ─── Convenience re-export ───────────────────────────────────────────────────

const theme = {
  colors,
  typography,
  spacing,
  radii,
  shadows,
  durations,
  zIndex,
} as const;

export default theme;
