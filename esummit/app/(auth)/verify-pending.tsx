/**
 * Pending email verification screen (spec §5.4)
 *
 * Shown when a user is signed in with an unverified email address.
 * Capabilities:
 * - "Resend verification email" (with cooldown)
 * - "I've verified my email" (refetches GET /me)
 * - Note that verification links open the website, not the app
 * - Log out to switch account
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Screen, Button } from '../../src/components';
import { colors, typography, spacing, radii } from '../../src/theme';
import { Mail, CheckCircle2, RefreshCw, AlertCircle, ExternalLink } from 'lucide-react-native';
import { api } from '../../src/api/client';
import { useAuthStore, selectUser } from '../../src/store/authStore';

export default function VerifyPendingScreen(): React.JSX.Element {
  const user = useAuthStore(selectUser);
  const { setUser, logout } = useAuthStore();

  const [checking, setChecking]       = useState(false);
  const [resending, setResending]     = useState(false);
  const [cooldown, setCooldown]       = useState(0);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => {
      setCooldown((c) => c - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleCheckVerification = async () => {
    setStatusMessage(null);
    try {
      setChecking(true);
      const freshUser = await api.getMe();
      setUser(freshUser);

      if (freshUser.emailVerified) {
        if (!freshUser.onboardingCompleted) {
          router.replace('/(auth)/onboarding');
        } else {
          router.replace('/(tabs)');
        }
      } else {
        setStatusMessage({
          type: 'error',
          text: 'Email not verified yet. Please click the link in your email, then tap below.',
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not check verification status.';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setChecking(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setStatusMessage(null);
    try {
      setResending(true);
      const res = await api.resendVerification();
      setCooldown(60); // 60s cooldown
      setStatusMessage({ type: 'success', text: res.message });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to resend verification email.';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setResending(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      await logout();
      router.replace('/(auth)/welcome');
    }
  };

  return (
    <Screen scroll contentStyle={styles.container}>
      {/* Icon */}
      <View style={styles.iconCircle}>
        <Mail size={44} color={colors.primary} strokeWidth={1.75} />
      </View>

      {/* Heading */}
      <Text style={styles.title}>Verify your email</Text>
      <Text style={styles.body}>
        We sent a verification link to{' '}
        <Text style={styles.emailHighlight}>{user?.email ?? 'your email'}</Text>.
        Please check your inbox and confirm your address.
      </Text>

      {/* Website info banner */}
      <View style={styles.infoBanner}>
        <ExternalLink size={18} color={colors.primary} strokeWidth={2} />
        <Text style={styles.infoBannerText}>
          The link will open the E-Summit website in your browser to confirm your address.
        </Text>
      </View>

      {/* Status Notice */}
      {statusMessage && (
        <View
          style={[
            styles.statusBanner,
            statusMessage.type === 'success' ? styles.statusSuccess : styles.statusError,
          ]}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 size={16} color={colors.success} strokeWidth={2} />
          ) : (
            <AlertCircle size={16} color={colors.error} strokeWidth={2} />
          )}
          <Text
            style={[
              styles.statusText,
              statusMessage.type === 'success' ? styles.statusTextSuccess : styles.statusTextError,
            ]}
          >
            {statusMessage.text}
          </Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          label="I've verified my email"
          onPress={handleCheckVerification}
          loading={checking}
          fullWidth
          size="lg"
          leftIcon={<RefreshCw size={18} color={colors.textInverse} strokeWidth={2} />}
        />

        <Button
          label={cooldown > 0 ? `Resend email (${cooldown}s)` : 'Resend verification email'}
          onPress={handleResend}
          variant="secondary"
          loading={resending}
          disabled={cooldown > 0}
          fullWidth
          size="lg"
        />

        <Button
          label="Sign in with a different email"
          onPress={handleLogout}
          variant="text"
          fullWidth
          style={styles.logoutButton}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: spacing['10'],
    paddingBottom: spacing['8'],
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: radii.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['6'],
  },
  title: {
    fontFamily: typography.fontFamilyBold,
    fontSize: typography.size3xl,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  body: {
    fontFamily: typography.fontFamilyRegular,
    fontSize: typography.sizeBase,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing['3'],
    lineHeight: typography.sizeBase * typography.lineHeightNormal,
    paddingHorizontal: spacing['4'],
  },
  emailHighlight: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamilySemiBold,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    backgroundColor: colors.surface,
    borderColor: colors.borderSubtle,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing['4'],
    marginVertical: spacing['6'],
    width: '100%',
  },
  infoBannerText: {
    fontFamily: typography.fontFamilyRegular,
    fontSize: typography.sizeSm,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: typography.sizeSm * typography.lineHeightNormal,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    padding: spacing['3'],
    borderRadius: radii.md,
    borderWidth: 1,
    width: '100%',
    marginBottom: spacing['4'],
  },
  statusSuccess: {
    backgroundColor: colors.successBg,
    borderColor: colors.success,
  },
  statusError: {
    backgroundColor: colors.errorBg,
    borderColor: colors.error,
  },
  statusText: {
    fontFamily: typography.fontFamilyMedium,
    fontSize: typography.sizeSm,
    flex: 1,
  },
  statusTextSuccess: {
    color: colors.success,
  },
  statusTextError: {
    color: colors.error,
  },
  actions: {
    width: '100%',
    gap: spacing['3'],
    marginTop: spacing['4'],
  },
  logoutButton: {
    marginTop: spacing['2'],
  },
});
