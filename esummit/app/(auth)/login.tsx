/**
 * Login screen
 *
 * Implements Mobile API v1 (openapi-v1.yaml & mobile-api-v1.md §3.1):
 * - Email OTP (Passwordless authentication via 6-digit code)
 * - Email + Password authentication
 * - Google Sign-In and Apple Sign-In
 * - Handling GoogleOnlyAccount error with "Set password" action
 * - Navigation to onboarding, verify-pending, or tabs based on user state
 */

import React, { useState, useEffect } from 'react';
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
import { ArrowLeft, AlertCircle, KeyRound, CheckCircle2, Mail, ShieldCheck } from 'lucide-react-native';
import { api } from '../../src/api/client';
import { useAuthStore } from '../../src/store/authStore';
import { LoginFormSchema } from '../../src/lib/schemas';
import { AppApiError } from '../../src/lib/errors';

type AuthMode = 'otp' | 'password';

export default function LoginScreen(): React.JSX.Element {
  const { login } = useAuthStore();

  const [authMode, setAuthMode] = useState<AuthMode>('otp');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp]           = useState('');
  const [otpSent, setOtpSent]   = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);

  const [loading, setLoading]               = useState(false);
  const [loadingSocial, setLoadingSocial]   = useState(false);
  const [formError, setFormError]           = useState<string | null>(null);
  const [emailError, setEmailError]         = useState<string | undefined>();
  const [passwordError, setPasswordError]   = useState<string | undefined>();
  const [otpError, setOtpError]             = useState<string | undefined>();

  // Special GoogleOnlyAccount state
  const [isGoogleOnly, setIsGoogleOnly]             = useState(false);
  const [requestingPassword, setRequestingPassword] = useState(false);
  const [passwordRequested, setPasswordRequested]   = useState(false);

  // OTP resend cooldown timer
  useEffect(() => {
    if (otpCooldown <= 0) return;
    const timer = setTimeout(() => {
      setOtpCooldown((c) => c - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [otpCooldown]);

  const handleSendOtp = async () => {
    setFormError(null);
    setEmailError(undefined);

    const emailTrimmed = email.trim();
    if (!emailTrimmed || !/^\S+@\S+\.\S+$/.test(emailTrimmed)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      const res = await api.sendOtp({ email: emailTrimmed });
      setOtpSent(true);
      setOtpCooldown(res.resendAfterSeconds ?? 60);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not send verification code.';
      setFormError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setFormError(null);
    setOtpError(undefined);

    if (!/^[0-9]{6}$/.test(otp.trim())) {
      setOtpError('Please enter the 6-digit code sent to your email');
      return;
    }

    try {
      setLoading(true);
      const res = await api.verifyOtp({ email: email.trim(), otp: otp.trim() });
      await login(res.tokens, res.user);

      if (!res.user.onboardingCompleted) {
        router.replace('/(auth)/onboarding');
      } else {
        router.replace('/(tabs)');
      }
    } catch (err: unknown) {
      if (err instanceof AppApiError && err.isOtpInvalid) {
        setOtpError('Incorrect or expired code. Please check your inbox or request a new one.');
      } else if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError('Verification failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async () => {
    setFormError(null);
    setEmailError(undefined);
    setPasswordError(undefined);
    setIsGoogleOnly(false);
    setPasswordRequested(false);

    // Validate form
    const validation = LoginFormSchema.safeParse({ email: email.trim(), password });
    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      if (fieldErrors.email?.[0]) setEmailError(fieldErrors.email[0]);
      if (fieldErrors.password?.[0]) setPasswordError(fieldErrors.password[0]);
      return;
    }

    try {
      setLoading(true);
      const res = await api.login({ email: email.trim(), password });
      await login(res.tokens, res.user);

      if (!res.user.onboardingCompleted) {
        router.replace('/(auth)/onboarding');
      } else {
        router.replace('/(tabs)');
      }
    } catch (err: unknown) {
      if (err instanceof AppApiError) {
        if (err.isGoogleOnlyAccount) {
          setIsGoogleOnly(true);
        } else {
          setFormError(err.message);
        }
      } else if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSetPassword = async () => {
    try {
      setRequestingPassword(true);
      await api.requestSetPassword({ email: email.trim() });
      setPasswordRequested(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not send set-password link.';
      Alert.alert('Error', msg);
    } finally {
      setRequestingPassword(false);
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
        <Text style={styles.title}>Sign in to E-Summit</Text>
        <Text style={styles.subtitle}>Access your delegate pass, registrations, and schedule</Text>
      </View>

      {/* Mode Selector (Email OTP vs Password) */}
      <View style={styles.modeTabs}>
        <TouchableOpacity
          onPress={() => {
            setAuthMode('otp');
            setFormError(null);
          }}
          style={[styles.modeTab, authMode === 'otp' && styles.modeTabActive]}
          accessibilityRole="tab"
          accessibilityState={{ selected: authMode === 'otp' }}
        >
          <Mail size={16} color={authMode === 'otp' ? colors.primary : colors.textTertiary} strokeWidth={2} />
          <Text style={[styles.modeTabText, authMode === 'otp' && styles.modeTabTextActive]}>
            Email Code (OTP)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setAuthMode('password');
            setFormError(null);
          }}
          style={[styles.modeTab, authMode === 'password' && styles.modeTabActive]}
          accessibilityRole="tab"
          accessibilityState={{ selected: authMode === 'password' }}
        >
          <KeyRound size={16} color={authMode === 'password' ? colors.primary : colors.textTertiary} strokeWidth={2} />
          <Text style={[styles.modeTabText, authMode === 'password' && styles.modeTabTextActive]}>
            Password
          </Text>
        </TouchableOpacity>
      </View>

      {/* General Error Banner */}
      {formError && (
        <View style={styles.errorBanner}>
          <AlertCircle size={18} color={colors.error} strokeWidth={2} />
          <Text style={styles.errorText}>{formError}</Text>
        </View>
      )}

      {/* Google-Only Account Notice */}
      {isGoogleOnly && (
        <View style={styles.googleOnlyBanner}>
          <KeyRound size={20} color={colors.info} strokeWidth={2} />
          <View style={styles.googleOnlyContent}>
            <Text style={styles.googleOnlyTitle}>Google Account Detected</Text>
            <Text style={styles.googleOnlyBody}>
              This account was registered using Google Sign-In. You can sign in with Google directly, or request a password setup link.
            </Text>
            {passwordRequested ? (
              <View style={styles.requestedRow}>
                <CheckCircle2 size={16} color={colors.success} strokeWidth={2} />
                <Text style={styles.requestedText}>Password setup link sent to your email.</Text>
              </View>
            ) : (
              <Button
                label="Set a password"
                onPress={handleRequestSetPassword}
                variant="secondary"
                size="sm"
                loading={requestingPassword}
                style={styles.setPasswordButton}
              />
            )}
          </View>
        </View>
      )}

      {/* Mode 1: Email OTP (Passwordless) */}
      {authMode === 'otp' && (
        <View style={styles.form}>
          <TextField
            label="Email address"
            placeholder="student@mnit.ac.in"
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              if (emailError) setEmailError(undefined);
              if (formError) setFormError(null);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            error={emailError}
            editable={!otpSent}
          />

          {!otpSent ? (
            <Button
              label="Send 6-digit code"
              onPress={handleSendOtp}
              loading={loading}
              fullWidth
              size="lg"
              style={styles.submitButton}
            />
          ) : (
            <View style={styles.otpSection}>
              <View style={styles.otpNotice}>
                <ShieldCheck size={18} color={colors.success} strokeWidth={2} />
                <Text style={styles.otpNoticeText}>
                  Code sent to <Text style={styles.emailHighlight}>{email}</Text>
                </Text>
              </View>

              <TextField
                label="Enter 6-digit code"
                placeholder="123456"
                value={otp}
                onChangeText={(v) => {
                  setOtp(v);
                  if (otpError) setOtpError(undefined);
                }}
                keyboardType="number-pad"
                maxLength={6}
                error={otpError}
              />

              <Button
                label="Verify & sign in"
                onPress={handleVerifyOtp}
                loading={loading}
                fullWidth
                size="lg"
                style={styles.submitButton}
              />

              <View style={styles.resendRow}>
                <TouchableOpacity
                  onPress={handleSendOtp}
                  disabled={otpCooldown > 0 || loading}
                  accessibilityRole="button"
                >
                  <Text style={[styles.resendText, otpCooldown > 0 && styles.resendTextDisabled]}>
                    {otpCooldown > 0 ? `Resend code in ${otpCooldown}s` : 'Resend code'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setOtpSent(false);
                    setOtp('');
                  }}
                  accessibilityRole="button"
                >
                  <Text style={styles.changeEmailText}>Change email</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Mode 2: Password Login */}
      {authMode === 'password' && (
        <View style={styles.form}>
          <TextField
            label="Email address"
            placeholder="your.email@example.com"
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              if (emailError) setEmailError(undefined);
              if (formError) setFormError(null);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            error={emailError}
          />

          <View>
            <TextField
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                if (passwordError) setPasswordError(undefined);
                if (formError) setFormError(null);
              }}
              isPassword
              error={passwordError}
            />
            <TouchableOpacity
              onPress={() => router.push('/(auth)/forgot-password')}
              style={styles.forgotPassword}
              accessibilityRole="button"
              accessibilityLabel="Forgot password"
            >
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          <Button
            label="Sign in"
            onPress={handlePasswordLogin}
            loading={loading}
            fullWidth
            size="lg"
            style={styles.submitButton}
          />
        </View>
      )}

      {/* Social login divider */}
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
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

      {/* Footer link to Signup */}
      <View style={styles.footerRow}>
        <Text style={styles.footerText}>New to E-Summit?</Text>
        <TouchableOpacity
          onPress={() => router.push('/(auth)/signup')}
          accessibilityRole="button"
        >
          <Text style={styles.footerLink}>Create account</Text>
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
    marginBottom: spacing['4'],
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
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing['1'],
    marginBottom: spacing['5'],
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['2'],
    paddingVertical: spacing['2'],
    borderRadius: radii.md,
  },
  modeTabActive: {
    backgroundColor: colors.surfaceElevated,
  },
  modeTabText: {
    fontFamily: typography.fontFamilyMedium,
    fontSize: typography.sizeSm,
    color: colors.textTertiary,
  },
  modeTabTextActive: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamilySemiBold,
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
  googleOnlyBanner: {
    flexDirection: 'row',
    gap: spacing['3'],
    backgroundColor: colors.infoBg,
    borderColor: colors.info,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing['4'],
    marginBottom: spacing['4'],
  },
  googleOnlyContent: {
    flex: 1,
  },
  googleOnlyTitle: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: typography.sizeSm,
    color: colors.textPrimary,
  },
  googleOnlyBody: {
    fontFamily: typography.fontFamilyRegular,
    fontSize: typography.sizeXs,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: typography.sizeXs * typography.lineHeightNormal,
  },
  setPasswordButton: {
    marginTop: spacing['3'],
    alignSelf: 'flex-start',
  },
  requestedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    marginTop: spacing['3'],
  },
  requestedText: {
    fontFamily: typography.fontFamilyMedium,
    fontSize: typography.sizeXs,
    color: colors.success,
  },
  form: {
    gap: spacing['4'],
  },
  otpSection: {
    gap: spacing['4'],
  },
  otpNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    backgroundColor: colors.surface,
    padding: spacing['3'],
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  otpNoticeText: {
    fontFamily: typography.fontFamilyRegular,
    fontSize: typography.sizeSm,
    color: colors.textSecondary,
    flex: 1,
  },
  emailHighlight: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamilySemiBold,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing['1'],
  },
  resendText: {
    fontFamily: typography.fontFamilyMedium,
    fontSize: typography.sizeSm,
    color: colors.primary,
  },
  resendTextDisabled: {
    color: colors.textDisabled,
  },
  changeEmailText: {
    fontFamily: typography.fontFamilyMedium,
    fontSize: typography.sizeSm,
    color: colors.textSecondary,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: spacing['2'],
    paddingVertical: spacing['1'],
  },
  forgotPasswordText: {
    fontFamily: typography.fontFamilyMedium,
    fontSize: typography.sizeSm,
    color: colors.primary,
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
