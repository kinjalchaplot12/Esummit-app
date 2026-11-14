/**
 * Welcome screen (spec §5.1)
 *
 * Entry point for unauthenticated visitors. Provides quick actions to:
 * - Log in with existing account
 * - Register a new account
 * - Authenticate via Google or Apple
 * - Continue as guest to explore the app
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Screen, Button } from '../../src/components';
import { colors, typography, spacing, radii } from '../../src/theme';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react-native';
import { api } from '../../src/api/client';
import { useAuthStore } from '../../src/store/authStore';

export default function WelcomeScreen(): React.JSX.Element {
  const { login } = useAuthStore();
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingApple, setLoadingApple]   = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoadingGoogle(true);
      // In production, GoogleSignin.signIn() retrieves idToken
      // Here with mock/native wrapper, we send idToken to POST /auth/google
      const response = await api.loginWithGoogle({
        idToken: 'mock_google_id_token_' + Date.now(),
      });
      await login(response.tokens, response.user);
      if (!response.user.onboardingCompleted) {
        router.replace('/(auth)/onboarding');
      } else {
        router.replace('/(tabs)');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google Sign-In failed.';
      Alert.alert('Sign-In Error', msg);
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setLoadingApple(true);
      const response = await api.loginWithApple({
        identityToken: 'mock_apple_identity_token_' + Date.now(),
      });
      await login(response.tokens, response.user);
      if (!response.user.onboardingCompleted) {
        router.replace('/(auth)/onboarding');
      } else {
        router.replace('/(tabs)');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Apple Sign-In failed.';
      Alert.alert('Sign-In Error', msg);
    } finally {
      setLoadingApple(false);
    }
  };

  return (
    <Screen scroll contentStyle={styles.scrollContent}>
      {/* Top Summit Badge */}
      <View style={styles.topSection}>
        <View style={styles.badge}>
          <Sparkles size={14} color={colors.primary} strokeWidth={2} />
          <Text style={styles.badgeText}>E-CELL MNIT JAIPUR PRESENTS</Text>
        </View>

        <Text style={styles.title}>E-Summit</Text>
        <Text style={styles.edition}>Annual Entrepreneurship Summit</Text>
        <Text style={styles.tagline}>
          Connect with visionary founders, innovators, and investors shaping the startup ecosystem.
        </Text>
      </View>

      {/* Feature Pillars */}
      <View style={styles.pillarsContainer}>
        <View style={styles.pillar}>
          <ShieldCheck size={18} color={colors.primary} strokeWidth={2} />
          <Text style={styles.pillarText}>Official Digital Pass & Event Schedule</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <Button
          label="Log in"
          onPress={() => router.push('/(auth)/login')}
          fullWidth
          size="lg"
        />

        <Button
          label="Create account"
          onPress={() => router.push('/(auth)/signup')}
          variant="secondary"
          fullWidth
          size="lg"
        />

        {/* Social Auth Options */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
          <View style={styles.dividerLine} />
        </View>

        <Button
          label="Continue with Google"
          onPress={handleGoogleSignIn}
          variant="secondary"
          fullWidth
          loading={loadingGoogle}
        />

        {Platform.OS === 'ios' && (
          <Button
            label="Sign in with Apple"
            onPress={handleAppleSignIn}
            variant="secondary"
            fullWidth
            loading={loadingApple}
          />
        )}

        {/* Guest access */}
        <Button
          label="Explore as guest"
          onPress={() => router.replace('/(tabs)')}
          variant="text"
          fullWidth
          rightIcon={<ArrowRight size={16} color={colors.textSecondary} strokeWidth={1.75} />}
          style={styles.guestButton}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    justifyContent: 'space-between',
    paddingVertical: spacing['8'],
    minHeight: '100%',
  },
  topSection: {
    alignItems: 'center',
    paddingHorizontal: spacing['2'],
    marginTop: spacing['6'],
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderWidth: 1,
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['1'],
    borderRadius: radii.full,
    marginBottom: spacing['4'],
  },
  badgeText: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: typography.size3xs,
    color: colors.primary,
    letterSpacing: typography.trackingWidest,
  },
  title: {
    fontFamily: typography.fontFamilyBold,
    fontSize: typography.size5xl,
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: typography.trackingTight,
  },
  edition: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: typography.sizeMd,
    color: colors.primary,
    marginTop: spacing['1'],
    textAlign: 'center',
  },
  tagline: {
    fontFamily: typography.fontFamilyRegular,
    fontSize: typography.sizeBase,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing['4'],
    lineHeight: typography.sizeBase * typography.lineHeightNormal,
    paddingHorizontal: spacing['4'],
  },
  pillarsContainer: {
    marginVertical: spacing['6'],
    paddingHorizontal: spacing['4'],
  },
  pillar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    backgroundColor: colors.surface,
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['3'],
    borderRadius: radii.lg,
    borderColor: colors.borderSubtle,
    borderWidth: 1,
  },
  pillarText: {
    fontFamily: typography.fontFamilyMedium,
    fontSize: typography.sizeSm,
    color: colors.textSecondary,
  },
  actionsContainer: {
    width: '100%',
    gap: spacing['3'],
    paddingHorizontal: spacing['2'],
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing['2'],
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
  guestButton: {
    marginTop: spacing['1'],
  },
});
