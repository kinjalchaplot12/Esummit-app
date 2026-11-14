/**
 * Forgot password screen (spec §5.5)
 *
 * Dispatches a password reset email.
 * Note: Password reset link opens the website (esummit.ecellmnit.org),
 * as password resetting is handled on the web per spec §5.5.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Screen, Button, TextField } from '../../src/components';
import { colors, typography, spacing, radii } from '../../src/theme';
import { ArrowLeft, CheckCircle2, AlertCircle, Mail } from 'lucide-react-native';
import { api } from '../../src/api/client';
import { ForgotPasswordFormSchema } from '../../src/lib/schemas';

export default function ForgotPasswordScreen(): React.JSX.Element {
  const [email, setEmail]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | undefined>();

  const handleSubmit = async () => {
    setError(null);
    setEmailError(undefined);

    const validation = ForgotPasswordFormSchema.safeParse({ email: email.trim() });
    if (!validation.success) {
      setEmailError(validation.error.flatten().fieldErrors.email?.[0]);
      return;
    }

    try {
      setLoading(true);
      await api.forgotPassword({ email: email.trim() });
      setSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send reset link.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll keyboardAware contentStyle={styles.container}>
      {/* Back button */}
      <TouchableOpacity
        onPress={() => router.canGoBack() ? router.back() : router.replace('/(auth)/login')}
        style={styles.backButton}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <ArrowLeft size={20} color={colors.textPrimary} strokeWidth={2} />
      </TouchableOpacity>

      {submitted ? (
        /* Success Confirmation View */
        <View style={styles.successContainer}>
          <View style={styles.successIconWrapper}>
            <CheckCircle2 size={40} color={colors.success} strokeWidth={2} />
          </View>
          <Text style={styles.title}>Check your inbox</Text>
          <Text style={styles.subtitle}>
            If an account is associated with <Text style={styles.highlightText}>{email}</Text>, we have sent a link to reset your password.
          </Text>

          <View style={styles.noticeBox}>
            <Mail size={18} color={colors.primary} strokeWidth={2} />
            <Text style={styles.noticeText}>
              The reset link will open in your web browser where you can securely set a new password.
            </Text>
          </View>

          <Button
            label="Back to log in"
            onPress={() => router.replace('/(auth)/login')}
            fullWidth
            size="lg"
            style={styles.actionButton}
          />
        </View>
      ) : (
        /* Input Form View */
        <View>
          <View style={styles.header}>
            <Text style={styles.title}>Reset password</Text>
            <Text style={styles.subtitle}>
              Enter the email address registered with your account and we will send you a reset link.
            </Text>
          </View>

          {error && (
            <View style={styles.errorBanner}>
              <AlertCircle size={18} color={colors.error} strokeWidth={2} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.form}>
            <TextField
              label="Email address"
              placeholder="your.email@example.com"
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                if (emailError) setEmailError(undefined);
                if (error) setError(null);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={emailError}
            />

            <Button
              label="Send reset link"
              onPress={handleSubmit}
              loading={loading}
              fullWidth
              size="lg"
              style={styles.actionButton}
            />
          </View>
        </View>
      )}
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
  actionButton: {
    marginTop: spacing['2'],
  },
  successContainer: {
    alignItems: 'center',
    paddingTop: spacing['4'],
  },
  successIconWrapper: {
    width: 72,
    height: 72,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['4'],
  },
  highlightText: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamilySemiBold,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    backgroundColor: colors.surface,
    borderColor: colors.borderSubtle,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing['4'],
    marginVertical: spacing['6'],
  },
  noticeText: {
    fontFamily: typography.fontFamilyRegular,
    fontSize: typography.sizeSm,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: typography.sizeSm * typography.lineHeightNormal,
  },
});
