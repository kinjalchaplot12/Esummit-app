/**
 * My Pass tab — auth-required.
 *
 * Phase 7 will add: Ticket QR, Group QR, accommodation status,
 * offline caching, brightness lock, and web handoff buttons.
 *
 * Phase 3: shows login prompt if not authenticated, placeholder if logged in.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Screen, Button } from '../../src/components';
import { useAuthStore, selectIsLoggedIn, selectUser } from '../../src/store/authStore';
import { colors, typography, spacing } from '../../src/theme';
import { Ticket, Lock } from 'lucide-react-native';

export default function MyPassScreen(): React.JSX.Element {
  const isLoggedIn = useAuthStore(selectIsLoggedIn);
  const user       = useAuthStore(selectUser);

  if (!isLoggedIn) {
    return (
      <Screen>
        <View style={styles.container}>
          <Lock size={48} color={colors.textTertiary} strokeWidth={1.5} />
          <Text style={styles.title}>Your pass lives here</Text>
          <Text style={styles.body}>
            Log in to access your ticket QR, check-in status, and accommodation details.
          </Text>
          <Button
            label="Log in"
            onPress={() => router.push('/(auth)/login')}
            fullWidth
            style={styles.button}
          />
          <Button
            label="Create account"
            onPress={() => router.push('/(auth)/signup')}
            variant="secondary"
            fullWidth
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.container}>
        <Ticket size={48} color={colors.primary} strokeWidth={1.5} />
        <Text style={styles.title}>My Pass</Text>
        <Text style={styles.subtitle}>{user?.name}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>PHASE 7 — QR + PASS DETAILS</Text>
        </View>
        <Text style={styles.note}>
          Your ticket QR, group QR, accommodation status, and Buy / Upgrade buttons
          will be implemented in Phase 7.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    padding:        spacing['8'],
    gap:            spacing['4'],
  },
  title: {
    fontFamily: typography.fontFamilyBold,
    fontSize:   typography.size3xl,
    color:      colors.textPrimary,
    textAlign:  'center',
  },
  subtitle: {
    fontFamily: typography.fontFamilyMedium,
    fontSize:   typography.sizeMd,
    color:      colors.textSecondary,
  },
  body: {
    fontFamily:  typography.fontFamilyRegular,
    fontSize:    typography.sizeMd,
    color:       colors.textSecondary,
    textAlign:   'center',
    lineHeight:  typography.sizeMd * typography.lineHeightNormal,
  },
  button: {
    marginTop: spacing['2'],
  },
  badge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing['4'],
    paddingVertical:   spacing['1'],
    borderRadius:      4,
  },
  badgeText: {
    fontFamily:    typography.fontFamilySemiBold,
    fontSize:      typography.size3xs,
    color:         colors.primary,
    letterSpacing: typography.trackingWidest,
  },
  note: {
    fontFamily:  typography.fontFamilyRegular,
    fontSize:    typography.sizeSm,
    color:       colors.textTertiary,
    textAlign:   'center',
    lineHeight:  typography.sizeSm * typography.lineHeightRelaxed,
  },
});
