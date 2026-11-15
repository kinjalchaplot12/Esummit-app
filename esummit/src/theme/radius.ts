/** Corner radii. Cards 20–24, inputs 14, buttons fully rounded (pill). */
export const radius = {
  sm: 8,
  md: 12,
  input: 14,
  card: 20,
  cardLg: 24,
  tabBar: 24,
  pill: 9999,
} as const;

/** Legacy names used by pre-existing screens. Prefer `radius`. */
export const radii = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;
