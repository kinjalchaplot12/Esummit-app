/**
 * Badge — small label for categories, status and counts.
 * Default tone is the accent color (tags / badges per design system).
 */

import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, fontFamily, fontSize, radius, spacing } from '../theme';

type Tone = 'accent' | 'primary' | 'neutral' | 'success' | 'warning' | 'error';

interface BadgeProps {
  label: string;
  tone?: Tone;
  /** Solid fill instead of a soft tint. */
  solid?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const toneMap: Record<Tone, { fg: string; soft: string }> = {
  accent: { fg: colors.accent, soft: colors.accentSoft },
  primary: { fg: colors.primary, soft: colors.primarySoft },
  neutral: { fg: colors.textMuted, soft: colors.cardBorder },
  success: { fg: colors.success, soft: colors.successSoft },
  warning: { fg: colors.warning, soft: colors.warningSoft },
  error: { fg: colors.error, soft: colors.errorSoft },
};

export function Badge({ label, tone = 'accent', solid = false, icon, style }: BadgeProps) {
  const t = toneMap[tone];
  return (
    <View style={[styles.base, { backgroundColor: solid ? t.fg : t.soft }, style]}>
      {icon}
      <Text style={[styles.label, { color: solid ? colors.text : t.fg }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing['1'],
    paddingHorizontal: spacing['2'] + 2,
    paddingVertical: spacing['1'],
    borderRadius: radius.pill,
  },
  label: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.xs,
  },
});
