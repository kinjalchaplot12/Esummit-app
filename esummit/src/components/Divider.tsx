/**
 * Divider — thin horizontal rule using the theme border colour.
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing } from '../theme';

interface DividerProps {
  style?: ViewStyle;
  vertical?: number; // vertical margin (default spacing['6'])
}

export function Divider({ style, vertical = spacing['6'] }: DividerProps): React.JSX.Element {
  return (
    <View
      style={[styles.line, { marginVertical: vertical }, style]}
      accessibilityRole="none"
      importantForAccessibility="no"
    />
  );
}

const styles = StyleSheet.create({
  line: {
    height:          StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    width:           '100%',
  },
});
