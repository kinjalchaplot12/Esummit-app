/**
 * LoadingState — centred spinner with optional label.
 * Used when data is first fetching (not refreshing).
 */

import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../theme';

interface LoadingStateProps {
  label?: string;
}

export function LoadingState({ label = 'Loading...' }: LoadingStateProps): React.JSX.Element {
  return (
    <View style={styles.container} accessibilityRole="progressbar" accessibilityLabel={label}>
      <ActivityIndicator size="large" color={colors.primary} />
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    gap:            spacing['4'],
    padding:        spacing['8'],
  },
  label: {
    fontFamily:  typography.fontFamilyMedium,
    fontSize:    typography.sizeSm,
    color:       colors.textTertiary,
    textAlign:   'center',
  },
});
