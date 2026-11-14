/**
 * ErrorState — shown when a data fetch fails.
 * Always shows a "Try again" button so users are never stuck.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { colors, typography, spacing } from '../theme';
import { Button } from './Button';

interface ErrorStateProps {
  title?:   string;
  message?: string;
  onRetry:  () => void;
}

export function ErrorState({
  title   = 'Something went wrong',
  message,
  onRetry,
}: ErrorStateProps): React.JSX.Element {
  return (
    <View style={styles.container} accessibilityRole="alert">
      <AlertCircle size={40} color={colors.error} strokeWidth={1.5} />
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
      <Button
        label="Try again"
        onPress={onRetry}
        variant="secondary"
        style={styles.button}
        accessibilityLabel="Retry loading"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    padding:        spacing['8'],
    gap:            spacing['3'],
  },
  title: {
    fontFamily:  typography.fontFamilySemiBold,
    fontSize:    typography.sizeLg,
    color:       colors.textPrimary,
    textAlign:   'center',
  },
  message: {
    fontFamily:  typography.fontFamilyRegular,
    fontSize:    typography.sizeBase,
    color:       colors.textSecondary,
    textAlign:   'center',
    lineHeight:  typography.sizeBase * typography.lineHeightNormal,
  },
  button: {
    marginTop: spacing['4'],
    minWidth:  180,
  },
});
