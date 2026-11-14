/**
 * Button — primary, secondary, and text variants.
 *
 * Design rules (spec §3.3): real hierarchy, no emoji, Lucide icons only.
 * The loading state replaces children with a spinner so width stays stable.
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
  AccessibilityRole,
} from 'react-native';
import { colors, typography, spacing, radii, durations } from '../theme';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

type Variant = 'primary' | 'secondary' | 'text' | 'danger';
type Size    = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?:   Variant;
  size?:      Size;
  disabled?:  boolean;
  loading?:   boolean;
  fullWidth?: boolean;
  accessibilityLabel?: string;
  leftIcon?:  React.ReactNode;
  rightIcon?: React.ReactNode;
  style?:     ViewStyle;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function Button({
  label,
  onPress,
  variant    = 'primary',
  size       = 'md',
  disabled   = false,
  loading    = false,
  fullWidth  = false,
  accessibilityLabel,
  leftIcon,
  rightIcon,
  style,
}: ButtonProps): React.JSX.Element {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.97, { duration: durations.fast });
  };
  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: durations.fast });
  };

  const isDisabled = disabled || loading;

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      activeOpacity={0.85}
      accessibilityRole={'button' as AccessibilityRole}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        animStyle,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'danger'
            ? colors.textInverse
            : colors.primary}
        />
      ) : (
        <View style={styles.inner}>
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          <Text
            style={[
              styles.label,
              styles[`label_${variant}`],
              styles[`labelSize_${size}`],
            ]}
            numberOfLines={1}
          >
            {label}
          </Text>
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </View>
      )}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.md,
    alignItems:  'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconLeft:  { marginRight: spacing['2'] },
  iconRight: { marginLeft:  spacing['2'] },
  fullWidth: { width: '100%' },

  // ── Variants ──────────────────────────────────────────────────────────
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  text: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
  },
  danger: {
    backgroundColor: colors.error,
  },

  // ── Sizes ─────────────────────────────────────────────────────────────
  size_sm: { height: 36, paddingHorizontal: spacing['4'] },
  size_md: { height: 48, paddingHorizontal: spacing['6'] },
  size_lg: { height: 56, paddingHorizontal: spacing['8'] },

  // ── Disabled ──────────────────────────────────────────────────────────
  disabled: { opacity: 0.45 },

  // ── Label text ────────────────────────────────────────────────────────
  label: {
    fontFamily: typography.fontFamilySemiBold,
    letterSpacing: typography.trackingWide,
  },
  label_primary:   { color: colors.textInverse },
  label_secondary: { color: colors.primary },
  label_text:      { color: colors.primary },
  label_danger:    { color: colors.textInverse },

  labelSize_sm: { fontSize: typography.sizeSm },
  labelSize_md: { fontSize: typography.sizeMd },
  labelSize_lg: { fontSize: typography.sizeLg },
} as Record<string, TextStyle | ViewStyle>);
