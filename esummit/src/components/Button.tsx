/**
 * Button — pill-shaped. Variants: primary, secondary (outline), ghost/text, danger.
 * Keeps the original prop API so existing screens continue to work.
 * The loading state swaps the label for a spinner so the width stays stable.
 */

import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { colors, durations, fontFamily, fontSize, minTouchTarget, radius, spacing } from '../theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'text' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  accessibilityLabel?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  accessibilityLabel,
  leftIcon,
  rightIcon,
  style,
}: ButtonProps): React.JSX.Element {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const isDisabled = disabled || loading;
  const filled = variant === 'primary' || variant === 'danger';

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withTiming(0.97, { duration: durations.fast });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: durations.fast });
      }}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      hitSlop={size === 'sm' ? 6 : 0}
      style={[
        styles.base,
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        animStyle,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={filled ? colors.onPrimary : colors.primary} />
      ) : (
        <View style={styles.inner}>
          {leftIcon ? <View style={styles.iconLeft}>{leftIcon}</View> : null}
          <Text
            numberOfLines={1}
            style={[styles.label, labelSizeStyles[size], { color: labelColor[variant] }]}
          >
            {label}
          </Text>
          {rightIcon ? <View style={styles.iconRight}>{rightIcon}</View> : null}
        </View>
      )}
    </AnimatedPressable>
  );
}

const labelColor: Record<Variant, string> = {
  primary: colors.onPrimary,
  danger: colors.onPrimary,
  secondary: colors.text,
  ghost: colors.text,
  text: colors.primary,
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    minHeight: minTouchTarget,
  },
  inner: { flexDirection: 'row', alignItems: 'center' },
  iconLeft: { marginRight: spacing['2'] },
  iconRight: { marginLeft: spacing['2'] },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.45 },
  label: { fontFamily: fontFamily.bodySemiBold },
});

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: colors.primary },
  danger: { backgroundColor: colors.error },
  secondary: {
    backgroundColor: colors.transparent,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  ghost: { backgroundColor: colors.card },
  text: { backgroundColor: colors.transparent },
});

const sizeStyles = StyleSheet.create({
  sm: { height: minTouchTarget, paddingHorizontal: spacing['4'] },
  md: { height: 50, paddingHorizontal: spacing['6'] },
  lg: { height: 56, paddingHorizontal: spacing['8'] },
});

const labelSizeStyles = StyleSheet.create({
  sm: { fontSize: fontSize.sm },
  md: { fontSize: fontSize.base },
  lg: { fontSize: fontSize.md },
});
