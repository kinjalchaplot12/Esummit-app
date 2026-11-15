/** Chip — selectable filter pill (day / category filters). */

import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fontFamily, fontSize, minTouchTarget, radius, spacing } from '../theme';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
}

export function Chip({ label, selected = false, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[styles.chip, selected && styles.selected]}
    >
      <Text style={[styles.label, { color: selected ? colors.onPrimary : colors.textMuted }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: minTouchTarget - 6,
    paddingHorizontal: spacing['4'],
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  label: { fontFamily: fontFamily.bodyMedium, fontSize: fontSize.sm },
});
