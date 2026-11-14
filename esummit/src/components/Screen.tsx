/**
 * Screen — safe-area wrapper that every screen uses as its root.
 *
 * Handles:
 * - SafeAreaView edges
 * - Scroll vs static layout
 * - Background colour from theme
 * - Optional header title
 */

import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ViewStyle,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';

interface ScreenProps {
  children:       React.ReactNode;
  scroll?:        boolean;
  style?:         ViewStyle;
  contentStyle?:  ViewStyle;
  /** If true, wraps in KeyboardAvoidingView (for forms). */
  keyboardAware?: boolean;
  /** Edges to avoid; defaults to all. */
  edges?: Array<'top' | 'bottom' | 'left' | 'right'>;
}

export function Screen({
  children,
  scroll        = false,
  style,
  contentStyle,
  keyboardAware = false,
  edges         = ['top', 'bottom', 'left', 'right'],
}: ScreenProps): React.JSX.Element {
  const body = scroll ? (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.scrollContent, contentStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.inner, contentStyle]}>{children}</View>
  );

  const wrapped = keyboardAware ? (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {body}
    </KeyboardAvoidingView>
  ) : body;

  return (
    <SafeAreaView style={[styles.safe, style]} edges={edges}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      {wrapped}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex:            1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  inner: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing['6'],
    flexGrow: 1,
  },
});
