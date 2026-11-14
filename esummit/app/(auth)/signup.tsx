/**
 * Signup screen (spec §5.3)
 *
 * Handles:
 * - User registration (name, email, password, confirmPassword)
 * - Password criteria visual validation indicators (8+ chars, uppercase, lowercase, digit)
 * - Confirm password match check
 * - Google Sign-In and Apple Sign-In
 * - Navigation to verify-pending or onboarding
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Screen, Button, TextField } from '../../src/components';
import { colors, typography, spacing, radii } from '../../src/theme';
import { ArrowLeft, AlertCircle, Check, X } from 'lucide-react-native';
import { api } from '../../src/api/client';
import { useAuthStore } from '../../src/store/authStore';
import { SignupFormSchema } from '../../src/lib/schemas';
import { AppApiError } from '../../src/lib/errors';

export default function SignupScreen(): React.JSX.Element {
  const { login } = useAuthStore();

  const [name, setName]                       = useState('');
  const [email, setEmail]                     = useState('');
  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading]                 = useState(false);
  const [loadingSocial, setLoadingSocial]     = useState(false);
  const [formError, setFormError]             = useState<string | null>(null);

  const [fieldErrors, setFieldErrors]         = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  // Real-time password criteria
  const hasMinLength  = password.length >= 8 && password.length <= 128;
  const hasUppercase  = /[A-Z]/.test(password);
  const hasLowercase  = /[a-z]/.test(password);
  const hasNumber     = /[0-9]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const handleSignup = async () => {
    setFormError(null);
    setFieldErrors({});

    const result = SignupFormSchema.safeParse({
      name:            name.trim(),
      email:           email.trim(),
      password,
      confirmPassword,
    });

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      setFieldErrors({
        name:            errors.name?.[0],
        email:           errors.email?.[0],
        password:        errors.password?.[0],
        confirmPassword: errors.confirmPassword?.[0],
      });
      return;
    }

    try {
      setLoading(true);
      const res = await api.signup({
        name:     name.trim(),
        email:    email.trim(),
        password,
      });

      await login(res.tokens, res.user);

      if (!res.user.onboardingCompleted) {
        router.replace('/(auth)/onboarding');
      } else {
        router.replace('/(tabs)');
      }
    } catch (err: unknown) {
      if (err instanceof AppApiError) {
        setFormError(err.message);
      } else if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError('Account creation failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoadingSocial(true);
      const res = await api.loginWithGoogle({
        idToken: 'mock_google_id_token_' + Date.now(),
      });
      await login(res.tokens, res.user);
      if (!res.user.onboardingCompleted) {
        router.replace('/(auth)/onboarding');
      } else {
        router.replace('/(tabs)');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google Sign-In failed.';
      Alert.alert('Sign-In Error', msg);
    } finally {
      setLoadingSocial(false);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setLoadingSocial(true);
      const res = await api.loginWithApple({
        identityToken: 'mock_apple_identity_token_' + Date.now(),
      });
      await login(res.tokens, res.user);
      if (!res.user.onboardingCompleted) {
        router.replace('/(auth)/onboarding');
      } else {
        router.replace('/(tabs)');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Apple Sign-In failed.';
      Alert.alert('Sign-In Error', msg);
    } finally {
      setLoadingSocial(false);
    }
  };

  return (
    <Screen scroll keyboardAware contentStyle={styles.container}>
      {/* Back button */}
      <TouchableOpacity
        onPress={() => router.canGoBack() ? router.back() : router.replace('/(auth)/welcome')}
        style={styles.backButton}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <ArrowLeft size={20} color={colors.textPrimary} strokeWidth={2} />
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Join E-Summit MNIT Jaipur and get your delegate pass</Text>
      </View>

      {/* Form Error Banner */}
      {formError && (
        <View style={styles.errorBanner}>
          <AlertCircle size={18} color={colors.error} strokeWidth={2} />
          <Text style={styles.errorText}>{formError}</Text>
        </View>
      )}

      {/* Form inputs */}
      <View style={styles.form}>
        <TextField
          label="Full name"
          placeholder="Aarav Sharma"
          value={name}
          onChangeText={(v) => {
            setName(v);
            if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }));
          }}
          autoCapitalize="words"
          error={fieldErrors.name}
        />

        <TextField
          label="Email address"
          placeholder="your.email@example.com"
          value={email}
          onChangeText={(v) => {
            setEmail(v);
            if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          error={fieldErrors.email}
        />

        <View>
          <TextField
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={(v) => {
              setPassword(v);
              if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
            }}
            isPassword
            error={fieldErrors.password}
          />

          {/* Password criteria checklist */}
          <View style={styles.criteriaBox}>
            <Text style={styles.criteriaTitle}>Password requirements:</Text>
            <View style={styles.criteriaRow}>
              {hasMinLength ? <Check size={14} color={colors.success} strokeWidth={2.5} /> : <X size={14} color={colors.textTertiary} strokeWidth={2} />}
              <Text style={[styles.criteriaText, hasMinLength && styles.criteriaTextMet]}>At least 8 characters</Text>
            </View>
            <View style={styles.criteriaRow}>
              {hasUppercase ? <Check size={14} color={colors.success} strokeWidth={2.5} /> : <X size={14} color={colors.textTertiary} strokeWidth={2} />}
              <Text style={[styles.criteriaText, hasUppercase && styles.criteriaTextMet]}>At least one uppercase letter (A-Z)</Text>
            </View>
            <View style={styles.criteriaRow}>
              {hasLowercase ? <Check size={14} color={colors.success} strokeWidth={2.5} /> : <X size={14} color={colors.textTertiary} strokeWidth={2} />}
              <Text style={[styles.criteriaText, hasLowercase && styles.criteriaTextMet]}>At least one lowercase letter (a-z)</Text>
            </View>
            <View style={styles.criteriaRow}>
              {hasNumber ? <Check size={14} color={colors.success} strokeWidth={2.5} /> : <X size={14} color={colors.textTertiary} strokeWidth={2} />}
              <Text style={[styles.criteriaText, hasNumber && styles.criteriaTextMet]}>At least one number (0-9)</Text>
            </View>
          </View>
        </View>

        <TextField
          label="Confirm password"
          placeholder="••••••••"
          value={confirmPassword}
          onChangeText={(v) => {
            setConfirmPassword(v);
            if (fieldErrors.confirmPassword) setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
          }}
          isPassword
          error={fieldErrors.confirmPassword}
          hint={passwordsMatch ? 'Passwords match' : undefined}
        />

        <Button
          label="Create account"
          onPress={handleSignup}
          loading={loading}
          fullWidth
          size="lg"
          style={styles.submitButton}
        />
      </View>

      {/* Social login divider */}
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR SIGN UP WITH</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Social buttons */}
      <View style={styles.socialButtons}>
        <Button
          label="Continue with Google"
          onPress={handleGoogleSignIn}
          variant="secondary"
          fullWidth
          loading={loadingSocial}
        />

        {Platform.OS === 'ios' && (
          <Button
            label="Sign in with Apple"
            onPress={handleAppleSignIn}
            variant="secondary"
            fullWidth
            loading={loadingSocial}
          />
        )}
      </View>

      {/* Footer link to Login */}
      <View style={styles.footerRow}>
        <Text style={styles.footerText}>Already have an account?</Text>
        <TouchableOpacity
          onPress={() => router.push('/(auth)/login')}
          accessibilityRole="button"
        >
          <Text style={styles.footerLink}>Log in</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing['8'],
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['4'],
  },
  header: {
    marginBottom: spacing['6'],
  },
  title: {
    fontFamily: typography.fontFamilyBold,
    fontSize: typography.size3xl,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: typography.fontFamilyRegular,
    fontSize: typography.sizeBase,
    color: colors.textSecondary,
    marginTop: spacing['2'],
    lineHeight: typography.sizeBase * typography.lineHeightNormal,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    backgroundColor: colors.errorBg,
    borderColor: colors.error,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing['3'],
    marginBottom: spacing['4'],
  },
  errorText: {
    fontFamily: typography.fontFamilyMedium,
    fontSize: typography.sizeSm,
    color: colors.error,
    flex: 1,
  },
  form: {
    gap: spacing['4'],
  },
  criteriaBox: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSubtle,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing['3'],
    marginTop: spacing['2'],
    gap: spacing['2'],
  },
  criteriaTitle: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: typography.size3xs,
    color: colors.textTertiary,
    letterSpacing: typography.trackingWide,
    textTransform: 'uppercase',
  },
  criteriaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
  },
  criteriaText: {
    fontFamily: typography.fontFamilyRegular,
    fontSize: typography.sizeXs,
    color: colors.textTertiary,
  },
  criteriaTextMet: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamilyMedium,
  },
  submitButton: {
    marginTop: spacing['2'],
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing['6'],
    gap: spacing['3'],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: typography.size3xs,
    color: colors.textTertiary,
    letterSpacing: typography.trackingWidest,
  },
  socialButtons: {
    gap: spacing['3'],
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['2'],
    marginTop: spacing['8'],
  },
  footerText: {
    fontFamily: typography.fontFamilyRegular,
    fontSize: typography.sizeSm,
    color: colors.textSecondary,
  },
  footerLink: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: typography.sizeSm,
    color: colors.primary,
  },
});
