/** Spacing scale (4pt grid). Keys are multiples of 4. */
export const spacing = {
  px: 1,
  '0': 0,
  '1': 4,
  '2': 8,
  '3': 12,
  '4': 16,
  '5': 20,
  '6': 24,
  '7': 28,
  '8': 32,
  '9': 36,
  '10': 40,
  '12': 48,
  '16': 64,
  '20': 80,
  '24': 96,
} as const;

/** Horizontal padding for main screens. */
export const screenPadding = spacing['5'];

/** Minimum touch target size (Apple HIG / Material). */
export const minTouchTarget = 44;

/** Height of the floating tab bar, plus its bottom offset. Screens pad their scroll content by this. */
export const tabBarHeight = 68;
export const tabBarBottomOffset = 12;
export const tabBarClearance = tabBarHeight + tabBarBottomOffset + spacing['6'];
