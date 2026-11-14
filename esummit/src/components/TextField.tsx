/**
 * TextField — labelled text input with error state and password-reveal toggle.
 *
 * Spec §6: password fields must support reveal. Error state is clearly distinct.
 * Accessibility: label is announced, error is linked with accessibilityHint.
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  Animated,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { colors, typography, spacing, radii } from '../theme';

interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label:        string;
  error?:       string;
  hint?:        string;
  isPassword?:  boolean;
  containerStyle?: ViewStyle;
}

export function TextField({
  label,
  error,
  hint,
  isPassword = false,
  containerStyle,
  ...inputProps
}: TextFieldProps): React.JSX.Element {
  const [revealed, setRevealed]   = useState(false);
  const focusAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    Animated.timing(focusAnim, {
      toValue: 1,
      duration: 180,
      useNativeDriver: false,
    }).start();
    inputProps.onFocus?.({} as never);
  };

  const handleBlur = () => {
    Animated.timing(focusAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
    inputProps.onBlur?.({} as never);
  };

  const borderColor = focusAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [
      error ? colors.error : colors.border,
      error ? colors.error : colors.primary,
    ],
  });

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label} accessibilityRole="none">
        {label}
      </Text>

      <Animated.View style={[styles.inputWrapper, { borderColor }]}>
        <TextInput
          {...inputProps}
          style={styles.input}
          secureTextEntry={isPassword && !revealed}
          placeholderTextColor={colors.textTertiary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          accessibilityLabel={label}
          accessibilityHint={error ?? hint}
          aria-invalid={!!error}
          selectionColor={colors.primary}
          cursorColor={colors.primary}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setRevealed((v) => !v)}
            accessibilityLabel={revealed ? 'Hide password' : 'Show password'}
            accessibilityRole="button"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.revealButton}
          >
            {revealed
              ? <EyeOff size={18} color={colors.textTertiary} strokeWidth={1.75} />
              : <Eye    size={18} color={colors.textTertiary} strokeWidth={1.75} />
            }
          </TouchableOpacity>
        )}
      </Animated.View>

      {error ? (
        <Text style={styles.error} accessibilityRole="alert" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing['5'],
  },
  label: {
    fontFamily:   typography.fontFamilyMedium,
    fontSize:     typography.sizeSm,
    color:        colors.textSecondary,
    marginBottom: spacing['2'],
    letterSpacing: typography.trackingWide,
    textTransform: 'uppercase',
  },
  inputWrapper: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius:    radii.md,
    borderWidth:     1.5,
    paddingHorizontal: spacing['4'],
    height:          52,
  },
  input: {
    flex:            1,
    fontFamily:      typography.fontFamilyRegular,
    fontSize:        typography.sizeMd,
    color:           colors.textPrimary,
    height:          '100%',
    paddingVertical: 0,
  },
  revealButton: {
    marginLeft: spacing['2'],
    padding:    spacing['1'],
  },
  error: {
    fontFamily:  typography.fontFamilyRegular,
    fontSize:    typography.sizeXs,
    color:       colors.error,
    marginTop:   spacing['2'],
  },
  hint: {
    fontFamily:  typography.fontFamilyRegular,
    fontSize:    typography.sizeXs,
    color:       colors.textTertiary,
    marginTop:   spacing['2'],
  },
});
