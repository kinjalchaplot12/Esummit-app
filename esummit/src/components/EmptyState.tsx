/**
 * EmptyState — shown when a list or screen has no content.
 * Icon is a Lucide icon node passed by the caller.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../theme';
import { Button } from './Button';

interface EmptyStateProps {
  icon?:   React.ReactNode;
  title:   string;
  body?:   string;
  action?: {
    label:   string;
    onPress: () => void;
  };
}

export function EmptyState({ icon, title, body, action }: EmptyStateProps): React.JSX.Element {
  return (
    <View style={styles.container} accessibilityRole="text">
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text style={styles.title}>{title}</Text>
      {body && <Text style={styles.body}>{body}</Text>}
      {action && (
        <Button
          label={action.label}
          onPress={action.onPress}
          variant="secondary"
          style={styles.button}
        />
      )}
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
  icon: {
    marginBottom: spacing['2'],
    opacity:      0.5,
  },
  title: {
    fontFamily:  typography.fontFamilySemiBold,
    fontSize:    typography.sizeLg,
    color:       colors.textPrimary,
    textAlign:   'center',
  },
  body: {
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
