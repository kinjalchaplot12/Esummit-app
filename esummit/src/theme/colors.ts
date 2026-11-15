/**
 * Color tokens — the ONLY place hex values may appear.
 * Screens and components must import from here (via `src/theme`).
 */

export const palette = {
  black: '#0d0d0d',
  card: '#1a1a1a',
  cardBorder: '#2a2a2a',
  muted: '#a3a3a3',
  white: '#ffffff',
  primary: '#764bd1',
  accent: '#af58c8',
  dim: '#6b6b6b',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
} as const;

export const colors = {
  // Surfaces
  background: palette.black,
  card: palette.card,
  cardBorder: palette.cardBorder,

  // Text
  text: palette.white,
  textMuted: palette.muted,
  textDim: palette.dim,

  // Brand
  primary: palette.primary,
  accent: palette.accent,
  onPrimary: palette.white,
  onAccent: palette.white,
  primarySoft: 'rgba(118, 75, 209, 0.16)',
  accentSoft: 'rgba(175, 88, 200, 0.16)',

  // Status
  success: palette.success,
  successSoft: 'rgba(34, 197, 94, 0.14)',
  warning: palette.warning,
  warningSoft: 'rgba(245, 158, 11, 0.14)',
  error: palette.error,
  errorSoft: 'rgba(239, 68, 68, 0.14)',
  info: palette.info,
  infoSoft: 'rgba(59, 130, 246, 0.14)',

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.6)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  glass: 'rgba(255, 255, 255, 0.12)',
  transparent: 'transparent',

  // ── Legacy aliases (used by pre-existing auth screens) ─────────────────
  surface: palette.card,
  surfaceElevated: palette.card,
  border: palette.cardBorder,
  borderSubtle: palette.cardBorder,
  textPrimary: palette.white,
  textSecondary: palette.muted,
  textTertiary: palette.muted,
  textDisabled: palette.dim,
  textInverse: palette.white,
  primaryHover: palette.accent,
  primaryLight: 'rgba(118, 75, 209, 0.16)',
  primarySubtle: 'rgba(118, 75, 209, 0.08)',
  successBg: 'rgba(34, 197, 94, 0.14)',
  warningBg: 'rgba(245, 158, 11, 0.14)',
  errorBg: 'rgba(239, 68, 68, 0.14)',
  infoBg: 'rgba(59, 130, 246, 0.14)',
  tabActive: palette.white,
  tabInactive: palette.muted,
  tabBg: palette.card,
  tabBorder: palette.cardBorder,
} as const;

/** Google "G" mark colours — fixed by Google's sign-in branding guidelines. */
export const googleColors = {
  red: '#EA4335',
  blue: '#4285F4',
  yellow: '#FBBC05',
  green: '#34A853',
} as const;

/** Brand gradient — use ONLY on the pass card. 135deg = top-left → bottom-right. */
export const brandGradient = {
  colors: [palette.primary, palette.accent] as const,
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
} as const;
